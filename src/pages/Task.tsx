import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiGet, apiPostJson, type AttemptDto, type CheckResponse, type TaskDto } from '@/api/client'
import { Markdown } from '@/components/Markdown'
import { useSettingsStore } from '@/store/settings'

export default function Task() {
  const { skillId, taskId } = useParams()
  const { llmBaseUrl, llmModel } = useSettingsStore()
  const [task, setTask] = useState<TaskDto | null>(null)
  const [attempts, setAttempts] = useState<AttemptDto[] | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<CheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!skillId || !taskId) return
    let cancelled = false

    apiGet<TaskDto>(`skills/${skillId}/tasks/${taskId}`)
      .then((data) => {
        if (cancelled) return
        setTask(data)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })

    apiGet<AttemptDto[]>(`skills/${skillId}/tasks/${taskId}/attempts`)
      .then((data) => {
        if (cancelled) return
        setAttempts(data)
      })
      .catch(() => {
        if (cancelled) return
        setAttempts([])
      })

    return () => {
      cancelled = true
    }
  }, [skillId, taskId])

  const latestAttempt = useMemo(() => (attempts && attempts.length > 0 ? attempts[0] : null), [attempts])
  const resultView = useMemo(() => {
    if (!task || !result) return null
    const mastery = getMasteryLabel(result.score0to10, task.passScore)
    const rubricSorted = (result.rubricBreakdown ?? []).slice().sort((a, b) => a.score0to10 - b.score0to10)
    const focus = rubricSorted.slice(0, 3)
    return {
      mastery,
      focus,
      rubricSorted,
    }
  }, [result, task])

  if (!skillId || !taskId) return null

  async function submit() {
    if (!task) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await apiPostJson<CheckResponse>('check', {
        skillId,
        taskId,
        userAnswer,
        llm: { baseUrl: llmBaseUrl, model: llmModel },
      })
      setResult(res)
      const nextAttempts = await apiGet<AttemptDto[]>(`skills/${skillId}/tasks/${taskId}/attempts`)
      setAttempts(nextAttempts)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {error}
        </div>
      )}

      {!task && !error && (
        <div className="animate-pulse rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-3 w-80 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      )}

      {task && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Задание</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{task.title}</h1>
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Проходной балл: {task.passScore}/10 · Формат: {task.answerFormat}
              </div>
            </div>
            {latestAttempt && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Последняя попытка</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-semibold">{latestAttempt.score}/10</span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-300">
                    {latestAttempt.passed ? 'Сдано' : 'Не сдано'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5">
            <Markdown content={stripLeadingH1(task.promptMd)} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="text-sm font-semibold">Ответ</div>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={14}
                className="mt-2 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-mono text-sm leading-6 text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                placeholder="Вставь сюда свой ответ (текст или код)…"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting || userAnswer.trim().length === 0}
                  className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {submitting ? 'Проверяю…' : 'Проверить в LM Studio'}
                </button>
                <Link
                  to="/settings"
                  className="text-sm text-zinc-700 underline underline-offset-4 dark:text-zinc-200"
                >
                  Настроить LM Studio
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-sm font-semibold">Результат</div>
              {result ? (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-300">Оценка</span>
                    <span className="font-semibold">{result.score0to10}/10</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-zinc-600 dark:text-zinc-300">Статус</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {resultView?.mastery && <MasteryBadge mastery={resultView.mastery} />}
                      <span
                        className={
                          result.passed
                            ? 'rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100'
                            : 'rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100'
                        }
                      >
                        {result.passed ? 'Сдано' : 'Не сдано'}
                      </span>
                    </div>
                  </div>

                  {resultView && resultView.focus.length > 0 && (
                    <div className="rounded-xl bg-white p-3 text-sm dark:bg-zinc-950">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Фокус на улучшение
                      </div>
                      <div className="mt-2 space-y-2">
                        {resultView.focus.map((c) => (
                          <div key={c.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900/40">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <div className="min-w-0 truncate font-medium text-zinc-800 dark:text-zinc-100">
                                {c.title}
                              </div>
                              <div className="shrink-0 text-zinc-600 dark:text-zinc-300">{c.score0to10}/10</div>
                            </div>
                            {c.notes && (
                              <div className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                                {truncate(c.notes, 160)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resultView && resultView.rubricSorted.length > 0 && (
                    <div className="rounded-xl bg-white p-3 text-sm dark:bg-zinc-950">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Рубрика</div>
                      <div className="mt-2 space-y-2">
                        {resultView.rubricSorted.map((c) => (
                          <div key={c.id} className="space-y-1">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <div className="min-w-0 truncate text-zinc-700 dark:text-zinc-200">{c.title}</div>
                              <div className="shrink-0 text-zinc-600 dark:text-zinc-300">{c.score0to10}/10</div>
                            </div>
                            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
                              <div
                                className="h-2 rounded-full bg-zinc-900 dark:bg-zinc-100"
                                style={{ width: `${Math.round((c.score0to10 / 10) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl bg-white p-3 text-sm dark:bg-zinc-950">
                    <Markdown content={result.feedbackMd || '—'} />
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  Отправь ответ, чтобы получить фидбек.
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold">История попыток</div>
            {!attempts && <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Загрузка…</div>}
            {attempts && attempts.length === 0 && (
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Пока нет попыток.</div>
            )}
            {attempts && attempts.length > 0 && (
              <div className="mt-3 space-y-2">
                {attempts.slice(0, 10).map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(a.createdAt).toLocaleString('ru-RU')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{a.score}/10</span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-300">{a.passed ? 'Сдано' : 'Не сдано'}</span>
                      </div>
                    </div>
                    {renderAttemptRubric(a.rubricBreakdownJson)}
                    <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200">
                      <pre className="whitespace-pre-wrap font-mono">{a.userAnswer.slice(0, 800)}</pre>
                    </div>
                    {a.feedbackMd && (
                      <div className="mt-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/40">
                        <Markdown content={a.feedbackMd} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 text-sm">
            <Link to={`/skills/${skillId}`} className="text-zinc-700 underline underline-offset-4 dark:text-zinc-200">
              Назад к программе
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

function stripLeadingH1(md: string) {
  return md.replace(/^# .*\n+/, '')
}

function getMasteryLabel(
  score0to10: number,
  passScore: number,
): 'Mastered' | 'Progressing' | 'Getting Started' {
  if (score0to10 >= passScore) return 'Mastered'
  if (score0to10 >= Math.max(0, passScore - 2)) return 'Progressing'
  return 'Getting Started'
}

function MasteryBadge(props: { mastery: 'Mastered' | 'Progressing' | 'Getting Started' }) {
  if (props.mastery === 'Mastered') {
    return (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
        Mastered
      </span>
    )
  }
  if (props.mastery === 'Progressing') {
    return (
      <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
        Progressing
      </span>
    )
  }
  return (
    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
      Getting Started
    </span>
  )
}

function renderAttemptRubric(rubricBreakdownJson: string) {
  const parsed = safeJsonParse<Array<{ id: string; title: string; score0to10: number }>>(rubricBreakdownJson)
  if (!parsed || parsed.length === 0) return null
  const focus = parsed.slice().sort((a, b) => a.score0to10 - b.score0to10).slice(0, 2)
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {focus.map((c) => (
        <span
          key={c.id}
          className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200"
          title={c.title}
        >
          {truncate(c.title, 28)} · {Math.round(c.score0to10)}/10
        </span>
      ))}
    </div>
  )
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function truncate(input: string, max: number) {
  if (input.length <= max) return input
  return `${input.slice(0, max - 1)}…`
}
