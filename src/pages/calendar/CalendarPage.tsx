import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock3, Scissors, UserRound } from 'lucide-react'
import { useState } from 'react'

import { useAuthStore } from '@/app/store/auth'
import { api } from '@/shared/api/api'
import { cn, formatMoney, toDateInput } from '@/shared/lib/utils'
import { EmptyState, ErrorState, PageLoader } from '@/shared/ui/Feedback'
import { Input, Select } from '@/shared/ui/Form'

function utcRange(date: string) {
  const from = new Date(`${date}T00:00:00.000Z`)
  return { from: from.toISOString(), to: new Date(from.getTime() + 86_400_000).toISOString() }
}

export function CalendarPage() {
  const user = useAuthStore((state) => state.user)!
  const [date, setDate] = useState(() => toDateInput(new Date()))
  const [specialistId, setSpecialistId] = useState('')
  const specialists = useQuery({
    queryKey: ['specialists'],
    queryFn: api.specialists.list,
    enabled: user.role === 'ADMIN'
  })
  const range = utcRange(date)
  const bookings = useQuery({
    queryKey: ['calendar', date, specialistId],
    queryFn: () => api.bookings.calendar(range.from, range.to, specialistId || undefined)
  })

  return (
    <div>
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.25em] text-copper">
            Рабочий день
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Календарь записей
          </h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          {user.role === 'ADMIN' && (
            <Select value={specialistId} onChange={(event) => setSpecialistId(event.target.value)}>
              <option value="">Все специалисты</option>
              {specialists.data?.map((specialist) => (
                <option key={specialist.id} value={specialist.id}>
                  {specialist.user.name}
                </option>
              ))}
            </Select>
          )}
        </div>
      </header>
      {bookings.isLoading ? (
        <PageLoader />
      ) : bookings.error ? (
        <ErrorState message="Не удалось загрузить календарь" />
      ) : bookings.data?.length ? (
        <div className="relative grid gap-3 before:absolute before:bottom-4 before:left-[39px] before:top-4 before:w-px before:bg-ink/10">
          {bookings.data.map((booking) => (
            <article
              key={booking.id}
              className={cn(
                'relative z-10 grid grid-cols-[64px_1fr] gap-4 rounded-2xl border border-ink/10 bg-white p-4 shadow-card',
                booking.status === 'CANCELLED' && 'opacity-45'
              )}
            >
              <div className="pt-1 text-sm font-semibold">
                {String(new Date(booking.startAt).getUTCHours()).padStart(2, '0')}:
                {String(new Date(booking.startAt).getUTCMinutes()).padStart(2, '0')}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{booking.client.name}</h2>
                  {booking.status === 'CANCELLED' && (
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs">Отменена</span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/50">
                  <span className="flex items-center gap-1.5">
                    <Scissors className="h-3.5 w-3.5 text-copper" />
                    {booking.service.name}
                  </span>
                  {user.role === 'ADMIN' && (
                    <span className="flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5 text-copper" />
                      {booking.specialist.user.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-copper" />
                    {booking.service.durationMin} мин
                  </span>
                  <span>{formatMoney(booking.service.price)}</span>
                </div>
                <p className="mt-2 text-xs text-ink/35">{booking.client.email}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="На этот день записей нет" text="Выберите другую дату или специалиста." />
      )}
      <p className="mt-4 flex items-center gap-2 text-xs text-ink/35">
        <CalendarDays className="h-3.5 w-3.5" />
        Время отображается в UTC.
      </p>
    </div>
  )
}
