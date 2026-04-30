# Framer Motion: первая анимация

## Идея
Framer Motion позволяет добавлять анимации в React без “танцев” с CSS keyframes. Базовый паттерн: заменяем обычный элемент на `motion.*` и задаём `initial`, `animate`, `exit`, `transition`.
Для анимации появления/исчезновения используем `AnimatePresence`, иначе `exit` не сработает.

Пример:

```tsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function DemoToast() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Показать
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
          >
            Привет! <button onClick={() => setOpen(false)}>Закрыть</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

## Мини-конспект
- `motion.div`/`motion.button` — те же элементы, но “умеют” анимацию.
- `initial` — стартовое состояние, `animate` — целевое, `exit` — при удалении из DOM.
- `AnimatePresence` нужен, чтобы `exit` проигрался при условном рендере.
- Короткие анимации UI обычно 150–250мс; делай минимальную амплитуду (y 8–16px).
- Сначала UX, потом эффект: анимация должна подсказать состояние, не отвлекать.

## Типовые ошибки
- Указывают `exit`, но забывают `AnimatePresence`.
- Делают слишком долгие анимации → UI ощущается “тяжёлым”.
- Анимируют всё подряд → шум. Лучше 1–2 места с высоким эффектом.
- Используют анимацию там, где проще CSS transition (но это нормально на старте).

## Практика
- Сделаешь `AnimatedToast`: появление/исчезновение с `AnimatePresence`.
- Научишься управлять анимацией через state.
- Сверстаешь toast на Tailwind без переполнений на мобиле.

