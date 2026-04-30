# Typed fetch-клиент: загрузка, ошибки, AbortController

## Идея
Когда React напрямую вызывает `fetch` в каждом компоненте, быстро появляется хаос: разные форматы ошибок, дубли кода, нет единых типов, сложно отменять запросы при размонтировании. Лучший базовый шаг (без “магических” библиотек) — вынести HTTP-вызовы в маленький “клиент” с типами и одинаковыми правилами обработки ошибок.

В этом уроке ты соберёшь `NotesApi`: функции `getNotes/createNote/deleteNote`, которые возвращают типизированные данные и умеют принимать `AbortSignal` (чтобы безопасно отменять запросы в `useEffect`).

Пример:

```ts
export type CreateNoteDto = { text: string }
export type NoteDto = { id: string; text: string }

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new ApiError(`HTTP ${res.status}`, res.status)
  }
  return (await res.json()) as T
}

export async function getNotes(signal?: AbortSignal): Promise<NoteDto[]> {
  const res = await fetch('/api/notes', { signal })
  return asJson<NoteDto[]>(res)
}

export async function createNote(dto: CreateNoteDto, signal?: AbortSignal): Promise<NoteDto> {
  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(dto),
    signal,
  })
  return asJson<NoteDto>(res)
}
```

## Мини-конспект
- Один API-клиент = один стиль ошибок и типов на всём фронте.
- `Response.ok` проверяй всегда; иначе UI получит “тихий” баг.
- `AbortController` решает 2 проблемы: отмена при размонтировании и гонки запросов при быстрой смене состояния.
- В `useEffect` создавай `const controller = new AbortController()` и возвращай cleanup `() => controller.abort()`.
- Ошибка `AbortError` — это “нормальная” отмена, не показывай её как красный alert.

## Типовые ошибки
- Вызов `res.json()` до проверки `res.ok` → исключения в неожиданных местах.
- “Ловят всё” и глушат ошибки → UI зависает без причины.
- Не передают `signal` → после размонтирования прилетает `setState` на уже несуществующий компонент.
- Смешивают типы фронта и бэка без единой точки → ломают контракт незаметно.

## Практика
- Напишешь `NotesApi` с тремя методами и типами DTO.
- Добавишь единый формат ошибок (класс `ApiError`).
- Подготовишь основу для следующего урока: страница NotesPage с загрузкой/созданием/удалением.
