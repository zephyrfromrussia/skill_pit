import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, type ContinueResponse } from '@/api/client'

export default function Home() {
  const [cont, setCont] = useState<ContinueResponse['continue']>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiGet<ContinueResponse>('progress/continue')
      .then((res) => {
        if (cancelled) return
        setCont(res.continue)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Локальный тренажёр навыков</h1>
      <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-300">
        Выбирай навык, проходи уроки и сдавай задания. Проверка ответа делается через LM Studio, запущенный на
        localhost.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {error}
        </div>
      )}

      {cont && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Продолжить</div>
          <div className="mt-1 text-sm font-semibold">
            {cont.skillId} / {cont.lessonId}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              to={`/skills/${cont.skillId}/lessons/${cont.lessonId}`}
              className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Открыть урок
            </Link>
            <div className="text-xs text-zinc-600 dark:text-zinc-300">
              {new Date(cont.lastViewedAt).toLocaleString('ru-RU')}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5">
        <Link
          to="/skills"
          className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Перейти к навыкам
        </Link>
      </div>
    </div>
  )
}
