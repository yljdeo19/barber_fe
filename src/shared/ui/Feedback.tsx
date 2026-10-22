import { CalendarX2, LoaderCircle } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="grid min-h-64 place-items-center">
      <LoaderCircle className="h-7 w-7 animate-spin text-copper" aria-label="Загрузка" />
    </div>
  )
}
export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-ink/20 bg-white/50 p-8 text-center">
      <div>
        <CalendarX2 className="mx-auto mb-3 h-7 w-7 text-copper" />
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-ink/55">{text}</p>
      </div>
    </div>
  )
}
export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {message}
    </div>
  )
}
