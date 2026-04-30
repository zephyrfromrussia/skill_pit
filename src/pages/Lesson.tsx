import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiGet, apiPostJson, type LessonDto, type SkillProgressResponse } from '@/api/client'
import { Markdown } from '@/components/Markdown'

export default function Lesson() {
  const { skillId, lessonId } = useParams()
  const [lesson, setLesson] = useState<LessonDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!skillId || !lessonId) return
    let cancelled = false
    apiGet<LessonDto>(`skills/${skillId}/lessons/${lessonId}`)
      .then((data) => {
        if (cancelled) return
        setLesson(data)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [skillId, lessonId])

  useEffect(() => {
    if (!skillId || !lessonId) return
    apiPostJson<{ ok: boolean }>('progress/lesson-viewed', { skillId, lessonId }).catch(() => {})
  }, [skillId, lessonId])

  useEffect(() => {
    if (!skillId || !lessonId) return
    let cancelled = false
    apiGet<SkillProgressResponse>(`progress/skills/${skillId}`)
      .then((res) => {
        if (cancelled) return
        setCompleted(res.completedLessonIds.includes(lessonId))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [skillId, lessonId])

  const markdown = useMemo(() => {
    if (!lesson) return ''
    return stripLeadingH1(lesson.markdown)
  }, [lesson])

  if (!skillId || !lessonId) return null

  return (
    <div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {error}
        </div>
      )}

      {!lesson && !error && (
        <div className="animate-pulse rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-3 w-80 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      )}

      {lesson && (
        <>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Урок</div>
          <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{lesson.title}</h1>
            <button
              type="button"
              onClick={async () => {
                if (busy) return
                setBusy(true)
                try {
                  await apiPostJson('progress/lesson-completed', { skillId, lessonId, completed: !completed })
                  setCompleted((v) => !v)
                } finally {
                  setBusy(false)
                }
              }}
              className={
                completed
                  ? 'rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-950/50'
                  : 'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900'
              }
            >
              {completed ? 'Пройдено' : 'Отметить пройденным'}
            </button>
          </div>
          <div className="mt-5">
            <Markdown content={markdown} />
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold">Задания</div>
            {lesson.tasks.length === 0 ? (
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">В этом уроке нет заданий.</div>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {lesson.tasks.map((t) => (
                  <Link
                    key={t.id}
                    to={`/skills/${skillId}/tasks/${t.id.split('/')[1]}`}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900"
                  >
                    <div className="font-medium">{t.title}</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      Проходной балл: {t.passScore}/10 · Формат: {t.answerFormat}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              to={`/skills/${skillId}`}
              className="text-zinc-700 underline underline-offset-4 dark:text-zinc-200"
            >
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
