import {
  CalendarDays,
  CalendarRange,
  LogOut,
  Scissors,
  Settings2,
  UserRoundPlus
} from 'lucide-react'
import { Link, useLocation } from 'wouter'

import { useAuthStore } from '@/app/store/auth'
import { useLogout } from '@/features/auth/useAuthActions'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'

const navigation = {
  CLIENT: [
    { href: '/book', label: 'Новая запись', icon: Scissors },
    { href: '/bookings', label: 'Мои записи', icon: CalendarDays }
  ],
  SPECIALIST: [
    { href: '/calendar', label: 'Календарь', icon: CalendarRange },
    { href: '/schedule', label: 'Расписание', icon: Settings2 }
  ],
  ADMIN: [
    { href: '/calendar', label: 'Календарь', icon: CalendarRange },
    { href: '/admin/services', label: 'Услуги', icon: Scissors },
    { href: '/admin/specialists', label: 'Специалисты', icon: UserRoundPlus }
  ]
} as const

export function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user)!
  const [location] = useLocation()
  const logout = useLogout()

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-ink/10 bg-ink px-4 py-4 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:px-5 lg:py-7">
        <div className="flex items-center justify-between lg:block">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-wide">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10">
              <Scissors className="h-5 w-5 text-[#d98761]" />
            </span>
            <span>NORTH & BLADE</span>
          </Link>
          <Button
            variant="ghost"
            className="text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => logout.mutate()}
            aria-label="Выйти"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto lg:mt-12 lg:grid">
          {navigation[user.role].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white',
                location === href && 'bg-white/10 text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-white/10 pt-5 lg:absolute lg:bottom-7 lg:left-5 lg:right-5 lg:block">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-white/45">{user.email}</p>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start text-white/60 hover:bg-white/10 hover:text-white"
            loading={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-7 lg:p-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
