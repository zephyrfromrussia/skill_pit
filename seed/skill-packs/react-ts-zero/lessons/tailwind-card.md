# Tailwind: собираем UI из утилит

## Идея
Tailwind — это подход “utility-first”: вместо написания новых CSS-классов ты собираешь интерфейс из маленьких утилит (`p-4`, `rounded-xl`, `shadow-md`, `text-sm`, `sm:grid-cols-2`). Это ускоряет разработку, делает изменения локальными и помогает держать единый визуальный “словарь”.
Важно мыслить mobile-first: базовые классы работают на всех экранах, а `sm:`, `md:` и выше добавляют улучшения для больших ширин.

Пример:

```tsx
type CardProps = { title: string; subtitle: string }

export function Card(props: CardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{props.subtitle}</div>
      <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{props.title}</div>
      <button
        type="button"
        className="mt-4 inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        Действие
      </button>
    </div>
  )
}
```

## Мини-конспект
- Utility-first = много маленьких классов прямо в `className`.
- Не бойся “длинных” className: это цена за локальность и скорость изменений.
- Mobile-first: без префикса — для всех; `sm:` — 640px+; `md:` — 768px+ (по умолчанию).
- Состояния: `hover:`, `focus:`, `active:`, `disabled:`; для фокуса обычно делай `focus:ring-*`.
- Для тёмной темы: `dark:*` (если проект поддерживает dark-mode).

## Типовые ошибки
- Пытаются стилизовать mobile через `sm:*` вместо базовых классов (в Tailwind это наоборот).
- Делают интерактивный элемент на `<div>` вместо `<button>` и теряют доступность.
- Не добавляют focus-стили → на клавиатуре непонятно, где фокус.
- Лепят `overflow-hidden` “на всякий случай” и режут текст/тени.

## Практика
- Соберёшь адаптивную карточку `PricingCard` на Tailwind.
- Добавишь состояния hover/focus и аккуратные отступы.
- Сделаешь mobile-first верстку без горизонтального скролла.

