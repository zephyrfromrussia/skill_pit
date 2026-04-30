# NestJS: контроллер, сервис и модуль

## Идея
Фуллстек-приложение — это минимум “клиент” (React) и “сервер” (API). Клиент отправляет HTTP-запросы (`GET/POST/...`), сервер принимает их, выполняет бизнес-логику и возвращает данные.
NestJS — фреймворк для Node.js, который помогает строить API через модули, контроллеры и сервисы. Контроллер отвечает за маршруты и структуру запросов/ответов, а сервис — за логику (например, работу с данными).

Пример:

```ts
import { Body, Controller, Get, Post } from '@nestjs/common'
import { Injectable, Module } from '@nestjs/common'

type CreateNoteDto = { text: string }
type NoteDto = { id: string; text: string }

@Injectable()
class NotesService {
  private notes: NoteDto[] = []

  create(dto: CreateNoteDto): NoteDto {
    const note: NoteDto = { id: crypto.randomUUID(), text: dto.text }
    this.notes.push(note)
    return note
  }

  findAll(): NoteDto[] {
    return this.notes
  }
}

@Controller('notes')
class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  findAll(): NoteDto[] {
    return this.notes.findAll()
  }

  @Post()
  create(@Body() dto: CreateNoteDto): NoteDto {
    return this.notes.create(dto)
  }
}

@Module({
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
```

## Мини-конспект
- HTTP методы: `GET` (получить), `POST` (создать), `PUT/PATCH` (обновить), `DELETE` (удалить).
- `@Controller('path')` задаёт префикс маршрутов.
- `@Get()`/`@Post()` мапят методы класса на endpoints.
- DTO — “форма” входных данных; даже если это просто type/interface, это дисциплинирует API.
- Сервис помечается `@Injectable()` и внедряется в контроллер через constructor (DI).
- Модуль `@Module({ controllers, providers })` связывает части фичи в один блок.

## Типовые ошибки
- “Толстый контроллер”: делают всю логику внутри controller-методов.
- Возвращают разные форматы ответа в разных местах без единой схемы.
- Не типизируют DTO и затем ломают контракт между фронтом и бэком.
- Смешивают работу с данными и HTTP-слой в одном месте.

## Практика
- Соберёшь “скелет” модуля Notes (controller + service + module + dto).
- Сделаешь тонкий контроллер и явные типы.
- Подготовишь основу для следующего шага: подключить фронт к API.

