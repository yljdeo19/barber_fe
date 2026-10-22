import { Link } from 'wouter'
import { Button } from '@/shared/ui/Button'

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper p-6 text-center">
      <div>
        <p className="text-7xl font-semibold text-copper">404</p>
        <h1 className="mt-3 text-2xl font-semibold">Страница не найдена</h1>
        <p className="mt-2 text-ink/45">Возможно, адрес изменился или был введён неверно.</p>
        <Link href="/">
          <Button className="mt-6">Вернуться на главную</Button>
        </Link>
      </div>
    </main>
  )
}
