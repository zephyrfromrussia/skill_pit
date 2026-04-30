import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Import() {
  const [file, setFile] = useState<File | null>(null)
  const [inspect, setInspect] = useState<InspectResponse | null>(null)
  const [installed, setInstalled] = useState<InstallResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inspecting, setInspecting] = useState(false)
  const [installing, setInstalling] = useState(false)
  const demoSkillIds = ['react-basics', 'react-ts-zero']

  const canInstall = useMemo(() => {
    if (!file) return false
    if (!inspect?.ok) return false
    if ((inspect.errors?.length ?? 0) > 0) return false
    return true
  }, [file, inspect])

  async function inspectZip() {
    if (!file) return
    setInspecting(true)
    setError(null)
    setInspect(null)
    setInstalled(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/import/inspect', { method: 'POST', body: fd })
      const json = (await res.json()) as InspectResponse
      if (!res.ok) throw new Error(JSON.stringify(json))
      setInspect(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setInspecting(false)
    }
  }

  async function installZip() {
    if (!file) return
    setInstalling(true)
    setError(null)
    setInstalled(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/import', { method: 'POST', body: fd })
      const json = (await res.json()) as InstallResponse
      if (!res.ok || !json.ok) throw new Error(JSON.stringify(json))
      setInstalled(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setInstalling(false)
    }
  }

  async function inspectDemo(id: string) {
    setInspecting(true)
    setError(null)
    setInspect(null)
    setInstalled(null)
    try {
      const res = await fetch(`/api/import/demo/${encodeURIComponent(id)}/inspect`)
      const json = (await res.json()) as InspectResponse
      if (!res.ok) throw new Error(JSON.stringify(json))
      setInspect(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setInspecting(false)
    }
  }

  async function installDemo(id: string) {
    setInstalling(true)
    setError(null)
    setInstalled(null)
    try {
      const res = await fetch(`/api/import/demo/${encodeURIComponent(id)}/install`)
      const json = (await res.json()) as InstallResponse
      if (!res.ok || !json.ok) throw new Error(JSON.stringify(json))
      setInstalled(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Импорт skill pack</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        Загрузи локальный zip‑архив с контентом навыка. Сначала проверим структуру и метаданные, затем установим пак в локальное
        хранилище.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Файл</div>
          <div className="mt-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Только .zip</div>
                <div className="mt-1 truncate text-sm text-zinc-800 dark:text-zinc-100">
                  {file ? file.name : 'Файл не выбран'}
                </div>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
                Выбрать файл
                <input
                  type="file"
                  accept=".zip,application/zip"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null)
                    setInspect(null)
                    setInstalled(null)
                    setError(null)
                  }}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={inspectZip}
              disabled={!file || inspecting}
              className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              {inspecting ? 'Проверяю…' : 'Проверить структуру'}
            </button>
            <button
              type="button"
              onClick={installZip}
              disabled={!canInstall || installing}
              className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {installing ? 'Устанавливаю…' : 'Установить'}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Демо-пак</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
              Для проверки импорта без выбора файла можно установить локальный пример.
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {demoSkillIds.map((id) => (
                <div key={id} className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{id}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => inspectDemo(id)}
                      disabled={inspecting}
                      className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                    >
                      {inspecting ? 'Проверяю…' : 'Проверить'}
                    </button>
                    <button
                      type="button"
                      onClick={() => installDemo(id)}
                      disabled={installing}
                      className="inline-flex items-center rounded-xl bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      {installing ? 'Устанавливаю…' : 'Установить'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {inspect && (
              <motion.div
                className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Предпросмотр</div>
                    <div className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {inspect.skill?.title || '—'}
                    </div>
                    {inspect.skill?.id && (
                      <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                        {inspect.skill.id} · v{inspect.skill.version}
                      </div>
                    )}
                  </div>
                  <div
                    className={
                      inspect.ok
                        ? 'rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100'
                        : 'rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100'
                    }
                  >
                    {inspect.ok ? 'Готов к установке' : 'Требует исправлений'}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Stat label="Разделы" value={inspect.counts?.sections ?? 0} />
                  <Stat label="Уроки" value={inspect.counts?.lessons ?? 0} />
                  <Stat label="Задания" value={inspect.counts?.tasks ?? 0} />
                </div>

                {(inspect.errors?.length ?? 0) > 0 && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
                    <div className="text-xs font-semibold">Ошибки</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                      {inspect.errors!.slice(0, 8).map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(inspect.warnings?.length ?? 0) > 0 && (
                  <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Предупреждения</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-700 dark:text-zinc-200">
                      {inspect.warnings!.slice(0, 8).map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {installed?.ok && installed.skill && (
              <motion.div
                className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
              >
                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">Установлено</div>
                <div className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  {installed.skill.title} · v{installed.skill.version}
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    to={`/skills/${installed.skill.id}`}
                    className="inline-flex items-center rounded-xl bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-100 dark:text-emerald-950 dark:hover:bg-white"
                  >
                    Открыть навык
                  </Link>
                  <Link
                    to="/skills"
                    className="inline-flex items-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/10 dark:text-emerald-100 dark:hover:bg-emerald-950/20"
                  >
                    К списку навыков
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
          <div className="font-semibold">Минимальная структура</div>
          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
            В архиве должен быть <span className="font-mono">skill.json</span> и файлы, на которые он ссылается.
          </div>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-50">{`skill.json
lessons/
  some-lesson.md
tasks/
  some-task.md`}</pre>
        </div>
      </div>

    </div>
  )
}

function Stat(props: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{props.label}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{props.value}</div>
    </div>
  )
}

type InspectResponse = {
  ok: boolean
  skill?: { id: string; version: string; title: string; description: string; tags: string[] }
  counts?: { sections: number; lessons: number; tasks: number }
  warnings?: string[]
  errors?: string[]
}

type InstallResponse = {
  ok: boolean
  skill?: { id: string; version: string; title: string }
}
