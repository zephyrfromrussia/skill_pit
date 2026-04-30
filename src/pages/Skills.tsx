import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, type SkillListItem } from '@/api/client'

export default function Skills() {
  const [skills, setSkills] = useState<SkillListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiGet<SkillListItem[]>('skills')
      .then((data) => {
        if (cancelled) return
        setSkills(data)
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
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Навыки</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Установленные пакеты обучения (skill packs).
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {error}
        </div>
      )}

      {!skills && !error && (
        <div className="mt-6 animate-pulse rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-3 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      )}

      {skills && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {skills.map((s) => (
            <Link
              key={s.id}
              to={`/skills/${s.id}`}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold">{s.title}</div>
                  <div className="mt-2 max-h-12 overflow-hidden text-sm text-zinc-600 dark:text-zinc-300">
                    {s.description}
                  </div>
                </div>
                <div className="shrink-0 rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  v{s.version}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                  <span>Прогресс</span>
                  <span>
                    {s.progress.passed}/{s.progress.total}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <div
                    className="h-2 rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
                    style={{
                      width: s.progress.total
                        ? `${Math.round((s.progress.passed / s.progress.total) * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              {s.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.tags.slice(0, 6).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
