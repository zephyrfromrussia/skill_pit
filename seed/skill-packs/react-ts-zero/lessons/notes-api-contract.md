# Контракт Notes API: DTO, ошибки, CRUD

## Идея
Фуллстек начинается с контракта: фронт и бэк должны договориться, какие есть маршруты, какие поля приходят/уходят и какие ошибки возможны. Хороший контракт делает поведение предсказуемым: фронт не “угадывает”, почему запрос упал, а бэк не возвращает разные форматы данных в разных местах.

В этом уроке ты оформляешь Notes API как маленькую “фичу”: DTO, сервис с бизнес-логикой, контроллер с роутингом и понятными ошибками. Это база для следующего шага — подключить React через `fetch`.

Пример:

```ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'

export type CreateNoteDto = { text: string }
export type NoteDto = { id: string; text: string }

@Injectable()
class NotesService {
  private notes: NoteDto[] = []

  create(dto: CreateNoteDto): NoteDto {
    const text = dto.text.trim()
    if (text.length === 0 || text.length > 200) {
      throw new BadRequestException('text must be 1..200 chars')
    }

    const note: NoteDto = { id: crypto.randomUUID(), text }
    this.notes.push(note)
    return note
  }

  findAll(): NoteDto[] {
    return this.notes
  }

  findOne(id: string): NoteDto {
    const found = this.notes.find((n) => n.id === id)
    if (!found) throw new NotFoundException('note not found')
    return found
  }

  remove(id: string): void {
    const before = this.notes.length
    this.notes = this.notes.filter((n) => n.id !== id)
    if (this.notes.length === before) throw new NotFoundException('note not found')
  }
}

@Controller('notes')
class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  findAll(): NoteDto[] {
    return this.notes.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): NoteDto {
    return this.notes.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateNoteDto): NoteDto {
    return this.notes.create(dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string): { ok: true } {
    this.notes.remove(id)
    return { ok: true }
  }
}

@Module({ controllers: [NotesController], providers: [NotesService] })
export class NotesModule {}
```

## Мини-конспект
- Контракт = маршруты + DTO + правила ошибок; фиксируй его до UI.
- Типы DTO на бэке должны быть “простыми” и сериализуемыми (JSON).
- CRUD в минимуме: `GET /notes`, `GET /notes/:id`, `POST /notes`, `DELETE /notes/:id`.
- Контроллер отвечает за HTTP (декораторы, параметры, `@Body()`), сервис — за логику и данные.
- Ошибки должны быть предсказуемыми: неправильный ввод → 400, нет сущности → 404.
- Возвращай единый формат данных: например, `NoteDto` всегда `{ id, text }`.

## Типовые ошибки
- Делают валидацию прямо в UI и забывают про сервер → API принимает мусор.
- “Толстый контроллер”: хранение массива/логики в контроллере вместо сервиса.
- Непонятные ошибки: `throw new Error('bad')` без статуса → фронт не различает 400 и 500.
- Меняют форму ответа без обновления типов на фронте → ломают интеграцию.

## Практика
- Расширишь скелет Notes API до CRUD: добавишь `DELETE`.
- Добавишь минимальные проверки данных (`trim`, длина).
- Сделаешь ошибки читаемыми для фронта (BadRequest/NotFound).
