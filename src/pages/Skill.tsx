import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiGet, type SkillPack, type SkillProgressResponse } from '@/api/client'

export default function Skill() {
  const { skillId } = useParams()
  const [skill, setSkill] = useState<SkillPack | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<SkillProgressResponse | null>(null)

  useEffect(() => {
    if (!skillId) return
    let cancelled = false
    apiGet<SkillPack>(`skills/${skillId}`)
      .then((data) => {
        if (cancelled) return
        setSkill(data)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [skillId])

  useEffect(() => {
    if (!skillId) return
    let cancelled = false
    apiGet<SkillProgressResponse>(`progress/skills/${skillId}`)
      .then((res) => {
        if (cancelled) return
        setProgress(res)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [skillId])

  const stats = useMemo(() => {
    if (!skill) return null
    let lessons = 0
    let tasks = 0
    for (const section of skill.sections ?? []) {
      lessons += section.lessons?.length ?? 0
      for (const lesson of section.lessons ?? []) {
        tasks += lesson.tasks?.length ?? 0
      }
    }
    return { lessons, tasks }
  }, [skill])

  if (!skillId) return null

  return (
    <div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {error}
        </div>
      )}

      {!skill && !error && (
        <div className="animate-pulse rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-3 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      )}

      {skill && (
        <>
          <div className="flex flex-col gap-2">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">v{skill.version}</div>
            <h1 className="text-2xl font-semibold tracking-tight">{skill.title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {skill.description}
            </p>
            {stats && (
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {stats.lessons} уроков · {stats.tasks} заданий
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {(skill.sections ?? [])
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div
                  key={section.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="text-sm font-semibold">{section.title}</div>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {(section.lessons ?? [])
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => (
                        <Link
                          key={lesson.id}
                          to={`/skills/${skillId}/lessons/${lesson.id}`}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate font-medium">{lesson.title}</div>
                              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                                {(lesson.tasks?.length ?? 0) > 0 ? `${lesson.tasks.length} заданий` : 'Без заданий'}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              {progress?.completedLessonIds.includes(lesson.id) ? (
                                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
                                  Пройдено
                                </div>
                              ) : progress?.viewedLessonIds.includes(lesson.id) ? (
                                <div className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                                  Просмотрено
                                </div>
                              ) : (
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Открыть</div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 text-sm">
            <Link to="/skills" className="text-zinc-700 underline underline-offset-4 dark:text-zinc-200">
              Назад к навыкам
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
