import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { BookOpen, Download, Settings } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/ui'

export function AppLayout(props: { children: ReactNode }) {
  const { isDark, toggleTheme } = useTheme()
  const { mobileQa, toggleMobileQa, setMobileQa } = useUiStore()
  const isMobileQa = mobileQa

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div
        className={cn(
          'mx-auto grid w-full grid-cols-1 gap-0 px-4 py-6',
          isMobileQa ? 'max-w-[430px]' : 'max-w-6xl md:grid-cols-[260px_1fr] md:gap-8',
        )}
      >
        <aside className={cn(!isMobileQa && 'md:sticky md:top-6 md:h-[calc(100dvh-48px)]')}>
          <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium tracking-wide text-zinc-700 dark:text-zinc-300">
                Skill Pit
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleMobileQa()
                  }}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  {isMobileQa ? 'Десктоп' : 'Моб.'}
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  {isDark ? 'Светлая' : 'Тёмная'}
                </button>
              </div>
            </div>

            <nav className="mt-4 flex flex-col gap-1">
              <SideLink to="/skills" icon={<BookOpen className="h-4 w-4" />} label="Навыки" />
              <SideLink to="/import" icon={<Download className="h-4 w-4" />} label="Импорт" />
              <SideLink to="/settings" icon={<Settings className="h-4 w-4" />} label="Настройки" />
            </nav>

            <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
              Локальный тренажёр. Контент офлайн, проверка через LM Studio на localhost.
            </div>
            {isMobileQa && (
              <button
                type="button"
                onClick={() => setMobileQa(false)}
                className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Выйти из Mobile QA
              </button>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] dark:border-zinc-800 dark:bg-zinc-950">
            {props.children}
          </div>
        </main>
      </div>
    </div>
  )
}

function SideLink(props: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900',
          isActive && 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50',
        )
      }
    >
      <span className="text-zinc-500 dark:text-zinc-400">{props.icon}</span>
      <span>{props.label}</span>
    </NavLink>
  )
}
