import { useMemo, useState } from 'react'
import { apiGet } from '@/api/client'
import { useSettingsStore } from '@/store/settings'

export default function Settings() {
  const { llmBaseUrl, llmModel, setLlmBaseUrl, setLlmModel } = useSettingsStore()
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [modelQuery, setModelQuery] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableModels = useMemo(() => {
    const models = extractModelIds(health?.models)
    if (!modelQuery.trim()) return models
    const q = modelQuery.trim().toLowerCase()
    return models.filter((m) => m.toLowerCase().includes(q))
  }, [health?.models, modelQuery])

  async function checkHealth() {
    setChecking(true)
    setError(null)
    setHealth(null)
    try {
      const res = await apiGet<HealthResponse>(`llm/health?baseUrl=${encodeURIComponent(llmBaseUrl)}`)
      setHealth(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setChecking(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        Приложение вызывает LM Studio как OpenAI‑compatible сервер на localhost.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="text-sm font-semibold">LM Studio endpoint</div>
          <input
            value={llmBaseUrl}
            onChange={(e) => setLlmBaseUrl(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
            placeholder="http://127.0.0.1:1234/v1"
          />
          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
            Обычно это <span className="font-mono">http://127.0.0.1:1234/v1</span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="text-sm font-semibold">Model</div>
          <input
            value={llmModel}
            onChange={(e) => setLlmModel(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
            placeholder="local-model"
          />
          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
            Укажи имя модели так, как оно отображается в LM Studio.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={checkHealth}
            disabled={checking}
            className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {checking ? 'Проверяю…' : 'Проверить подключение'}
          </button>
          {health && (
            <div
              className={
                health.ok
                  ? 'text-sm font-medium text-emerald-700 dark:text-emerald-300'
                  : 'text-sm font-medium text-amber-700 dark:text-amber-300'
              }
            >
              {health.ok ? 'OK' : 'Не отвечает'}
            </div>
          )}
        </div>

        {health?.ok && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Доступные модели</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                  Это список из <span className="font-mono">GET /v1/models</span>. Нажми, чтобы подставить в поле Model.
                </div>
              </div>
              <div className="w-full sm:w-64">
                <input
                  value={modelQuery}
                  onChange={(e) => setModelQuery(e.target.value)}
                  placeholder="Фильтр…"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
                />
              </div>
            </div>

            {availableModels.length === 0 ? (
              <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
                Модели не найдены. Проверь, что в LM Studio загружена хотя бы одна модель и сервер запущен.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {availableModels.slice(0, 24).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setLlmModel(m)}
                    className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                    title={m}
                  >
                    <span className="min-w-0 truncate font-mono text-xs">{m}</span>
                    <span className="shrink-0 text-xs text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200">
                      Выбрать
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

type HealthResponse = {
  ok: boolean
  models?: unknown
}

function extractModelIds(models: unknown) {
  const root = models as any
  const data = Array.isArray(root?.data) ? root.data : []
  return data
    .map((m: any) => String(m?.id ?? ''))
    .filter(Boolean)
    .slice()
    .sort((a: string, b: string) => a.localeCompare(b))
}
