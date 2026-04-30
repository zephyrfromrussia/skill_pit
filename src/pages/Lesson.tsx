import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiGet, type LessonDto } from '@/api/client'
import { Markdown } from '@/components/Markdown'

export default function Lesson() {
  const { skillId, lessonId } = useParams()
  const [lesson, setLesson] = useState<LessonDto | null>(null)
  const [error, setError] = useState<string | null>(null)

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
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{lesson.title}</h1>
          <div className="mt-5">
            <Markdown content={lesson.markdown} />
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

