import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Локальный тренажёр навыков</h1>
      <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-300">
        Выбирай навык, проходи уроки и сдавай задания. Проверка ответа делается через LM Studio, запущенный на
        localhost.
      </p>
      <div className="mt-5">
        <Link
          to="/skills"
          className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Перейти к навыкам
        </Link>
      </div>
    </div>
  )
}
