# Задание: NotesApi — типизированный клиент

Контекст: чтобы не размазывать `fetch` по компонентам, мы выносим работу с API в один файл. Там же фиксируем типы DTO и единый формат ошибки.

## Требования
Напиши `notes-api.ts` (один файл), который содержит:

1) Типы DTO
- `export type CreateNoteDto = { text: string }`
- `export type NoteDto = { id: string; text: string }`

2) Ошибку API
- `export class ApiError extends Error`
  - поле `status: number`
  - конструктор `(message: string, status: number)`

3) Хелпер для JSON-ответов
- `async function asJson<T>(res: Response): Promise<T>`
  - если `!res.ok` → `throw new ApiError(\`HTTP ${res.status}\`, res.status)`
  - иначе `return (await res.json()) as T`

4) Методы NotesApi (функции)
- `export async function getNotes(signal?: AbortSignal): Promise<NoteDto[]>`
  - `GET /api/notes`
- `export async function createNote(dto: CreateNoteDto, signal?: AbortSignal): Promise<NoteDto>`
  - `POST /api/notes`
  - заголовок `content-type: application/json`
- `export async function deleteNote(id: string, signal?: AbortSignal): Promise<{ ok: true }>`
  - `DELETE /api/notes/:id`

## Ограничения
- Не используй библиотеки для HTTP (axios и т.п.).
- Не используй `any`.
- Не делай глобального `AbortController` внутри файла (управление отменой будет в компоненте).

## Формат ответа
Вставь только содержимое файла `notes-api.ts`:

```ts
// notes-api.ts
...
```

## Самопроверка
- Все функции возвращают типизированные данные (без `unknown`/`any`).
- Для non-OK ответов выбрасывается `ApiError` со статусом.
- `signal` прокидывается внутрь `fetch` (все методы).
