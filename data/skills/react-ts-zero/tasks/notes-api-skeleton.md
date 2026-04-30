# Задание: Notes API — скелет модуля

Контекст: чтобы перейти к фуллстек-уровню, нужно научиться разделять “HTTP-слой” и “логику”. В NestJS контроллер принимает запросы, а сервис хранит/обрабатывает данные. Модуль склеивает всё вместе.

## Требования
Собери минимальный скелет фичи Notes из 4 частей (можно одним ответом, но с понятными границами файлов):

1) `create-note.dto.ts`
- `export type CreateNoteDto = { text: string }`

2) `note.dto.ts`
- `export type NoteDto = { id: string; text: string }`

3) `notes.service.ts`
- `@Injectable() export class NotesService`
- Внутри: `private notes: NoteDto[] = []`
- Методы:
  - `create(dto: CreateNoteDto): NoteDto` создаёт note с `crypto.randomUUID()` и сохраняет в массив
  - `findAll(): NoteDto[]` возвращает массив
  - `findOne(id: string): NoteDto | null` возвращает note или `null`

4) `notes.controller.ts`
- `@Controller('notes') export class NotesController`
- Внедри `NotesService` через constructor.
- Маршруты:
  - `@Get()` → `findAll(): NoteDto[]`
  - `@Get(':id')` → `findOne(@Param('id') id: string): NoteDto | null`
  - `@Post()` → `create(@Body() dto: CreateNoteDto): NoteDto`

5) `notes.module.ts`
- `@Module({ controllers: [NotesController], providers: [NotesService] }) export class NotesModule {}`

## Ограничения
- Контроллер должен быть тонким: никакой логики хранения данных в контроллере.
- Не используй `any`.
- Не добавляй базу данных (пока только in-memory).

## Формат ответа
Вставь код для всех файлов в одном ответе, разделяя блоки так:

```ts
// create-note.dto.ts
...
```

## Самопроверка
- DTO типизированы и используются в сигнатурах методов.
- DI сделан через constructor.
- Роуты корректно описаны декораторами.
- Логика хранения/поиска только в сервисе.

