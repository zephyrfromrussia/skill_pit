# NotesPage: UI, стейт-машина, анимация списка

## Идея
Фуллстек-пользовательский сценарий — это не “сделать fetch”, а управлять состояниями: загрузка, ошибка, пусто, успешное действие, повторная попытка. В React это обычно выглядит как маленькая стейт-машина: `loading → ready/error`, плюс переходы на события (`create`, `delete`, `retry`).

Для UX мы добавляем две вещи:
1) Tailwind — чтобы форма и список выглядели аккуратно и адаптивно.
2) Framer Motion — чтобы добавление/удаление заметки было визуально понятным (enter/exit + перестройка списка).

Пример:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createNote, deleteNote, getNotes, type NoteDto } from './notes-api'

export function NotesPage() {
  const [items, setItems] = useState<NoteDto[]>([])
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setError(null)
    getNotes(controller.signal)
      .then((data) => setItems(data))
      .catch((e) => {
        if (e instanceof Error && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : String(e))
        setStatus('error')
      })
      .finally(() => setStatus((s) => (s === 'loading' ? 'idle' : s)))
    return () => controller.abort()
  }, [])

  const canSubmit = useMemo(() => text.trim().length > 0 && status !== 'loading', [text, status])

  async function onAdd() {
    if (!canSubmit) return
    const created = await createNote({ text: text.trim() })
    setItems((prev) => [created, ...prev])
    setText('')
  }

  async function onDelete(id: string) {
    await deleteNote(id)
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">Notes</h1>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950"
          placeholder="Новая заметка…"
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={!canSubmit}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"
        >
          Добавить
        </button>
      </div>

      {error && <div className="mt-3 text-sm text-red-700 dark:text-red-200">{error}</div>}

      <ul className="mt-6 space-y-2">
        <AnimatePresence initial={false}>
          {items.map((n) => (
            <motion.li
              key={n.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="min-w-0 break-words text-sm text-zinc-800 dark:text-zinc-100">{n.text}</div>
              <button
                type="button"
                onClick={() => onDelete(n.id)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Удалить
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
```

## Мини-конспект
- Думай UI как стейт-машину: загрузка/ошибка/готово.
- Для списков важны стабильные `key` (иначе ломается и рендер, и анимация).
- В `motion` для списков часто достаточно: `layout + initial/animate/exit`.
- Компоненты внутри карточек: `min-w-0` и `break-words` помогают не получить горизонтальный скролл на мобиле.
- Ошибки: `AbortError` не показываем пользователю, остальные показываем явно.

## Типовые ошибки
- Делают `key={index}` → при удалении анимация “прыгает”, состояние едет.
- Вызывают `setState` после размонтирования → предупреждения/баги.
- Добавляют длинный текст без `break-words`/`min-w-0` → появляется горизонтальный скролл.
- Мешают загрузку и ошибки в одну переменную → UI становится непредсказуемым.

## Практика
- Соберёшь страницу NotesPage: форма + список.
- Подключишь NotesApi и аккуратно обработаешь состояния.
- Добавишь анимации enter/exit и перестройку списка без “дёрганья”.
