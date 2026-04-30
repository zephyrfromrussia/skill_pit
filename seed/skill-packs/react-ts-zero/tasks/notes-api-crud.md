# Задание: Notes API — CRUD + ошибки

Контекст: у тебя уже есть скелет Notes (controller + service + module). Теперь нужно довести его до минимально “взрослого” API: добавить удаление и сделать ошибки предсказуемыми для фронта.

## Требования
Собери код фичи Notes (можно одним ответом, но с понятными границами файлов), чтобы получилось:

1) DTO
- `create-note.dto.ts`: `export type CreateNoteDto = { text: string }`
- `note.dto.ts`: `export type NoteDto = { id: string; text: string }`

2) Service
- `notes.service.ts`:
  - `@Injectable() export class NotesService`
  - Внутри: `private notes: NoteDto[] = []`
  - Методы:
    - `create(dto: CreateNoteDto): NoteDto`
      - делает `const text = dto.text.trim()`
      - если `text.length` не в диапазоне 1..200 → кидает `BadRequestException`
      - иначе создаёт note с `crypto.randomUUID()` и кладёт в массив
    - `findAll(): NoteDto[]`
    - `findOne(id: string): NoteDto`
      - если нет → кидает `NotFoundException`
    - `remove(id: string): void`
      - если нечего удалять → кидает `NotFoundException`

3) Controller
- `notes.controller.ts`:
  - `@Controller('notes') export class NotesController`
  - DI через constructor
  - Роуты:
    - `@Get()` → `findAll(): NoteDto[]`
    - `@Get(':id')` → `findOne(@Param('id') id: string): NoteDto`
    - `@Post()` → `create(@Body() dto: CreateNoteDto): NoteDto`
    - `@Delete(':id')` → `remove(@Param('id') id: string): { ok: true }` (возвращай `{ ok: true }`)

4) Module
- `notes.module.ts`: `@Module({ controllers: [NotesController], providers: [NotesService] }) export class NotesModule {}`

## Ограничения
- Не используй `any`.
- Не добавляй базу данных (только in-memory).
- Контроллер остаётся тонким: никаких `this.notes = ...` в контроллере.

## Формат ответа
Вставь код для всех файлов в одном ответе, разделяя блоки так:

```ts
// notes.service.ts
...
```

## Самопроверка
- `create()` всегда возвращает `NoteDto` с `id` и “подчищенным” `text` (trim).
- Для пустого `text` и для слишком длинного текста возвращается 400.
- Для неизвестного `id` в `GET /notes/:id` и `DELETE /notes/:id` возвращается 404.
- В контроллере нет логики хранения/поиска/валидации (только вызовы сервиса).
