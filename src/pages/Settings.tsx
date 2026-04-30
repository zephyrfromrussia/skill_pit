import { useState } from 'react'
import { apiGet } from '@/api/client'
import { useSettingsStore } from '@/store/settings'

export default function Settings() {
  const { llmBaseUrl, llmModel, setLlmBaseUrl, setLlmModel } = useSettingsStore()
  const [health, setHealth] = useState<{ ok: boolean } | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function checkHealth() {
    setChecking(true)
    setError(null)
    setHealth(null)
    try {
      const res = await apiGet<{ ok: boolean }>(`llm/health?baseUrl=${encodeURIComponent(llmBaseUrl)}`)
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

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

