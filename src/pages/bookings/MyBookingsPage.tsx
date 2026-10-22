import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Clock3, Scissors, UserRound } from 'lucide-react'
import { toast } from 'react-toastify'

import { api } from '@/shared/api/api'
import { ApiError } from '@/shared/api/http'
import { cn, formatDateTime, formatMoney } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'
import { EmptyState, ErrorState, PageLoader } from '@/shared/ui/Feedback'

export function MyBookingsPage() {
  const queryClient = useQueryClient()
  const bookings = useQuery({ queryKey: ['my-bookings'], queryFn: api.bookings.mine })
  const cancel = useMutation({
    mutationFn: api.bookings.cancel,
    onSuccess: async () => {
      toast.success('Запись отменена')
      await queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : 'Не удалось отменить запись')
  })
  if (bookings.isLoading) return <PageLoader />
  if (bookings.error) return <ErrorState message="Не удалось загрузить записи" />

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-copper">
          Личный кабинет
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Мои записи</h1>
      </header>
      {bookings.data?.length ? (
        <div className="grid gap-4">
          {bookings.data.map((booking) => {
            const active = booking.status === 'CONFIRMED' && new Date(booking.startAt) > new Date()
            return (
              <article
                key={booking.id}
                className={cn(
                  'grid gap-5 rounded-2xl border border-ink/10 bg-white p-5 shadow-card sm:grid-cols-[1fr_auto] sm:items-center',
                  !active && 'opacity-60'
                )}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold">{booking.service.name}</h2>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium',
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-ink/5 text-ink/50'
                      )}
                    >
                      {booking.status === 'CONFIRMED' ? 'Подтверждена' : 'Отменена'}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/55">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-copper" />
                      {formatDateTime(booking.startAt)}
                    </span>
                    <span className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-copper" />
                      {booking.specialist.user.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-copper" />
                      {booking.service.durationMin} мин
                    </span>
                    <span className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-copper" />
                      {formatMoney(booking.service.price)}
                    </span>
                  </div>
                </div>
                {active && (
                  <Button
                    variant="danger"
                    loading={cancel.isPending && cancel.variables === booking.id}
                    onClick={() => cancel.mutate(booking.id)}
                  >
                    Отменить
                  </Button>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="Записей пока нет"
          text="Выберите услугу и удобное время в разделе «Новая запись»."
        />
      )}
    </div>
  )
}
