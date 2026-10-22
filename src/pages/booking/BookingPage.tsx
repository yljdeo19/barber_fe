import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Check, Clock3, Scissors, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { api } from '@/shared/api/api'
import { ApiError } from '@/shared/api/http'
import { cn, formatMoney, toDateInput } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'
import { EmptyState, ErrorState, PageLoader } from '@/shared/ui/Feedback'
import { Input } from '@/shared/ui/Form'

const tomorrow = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toDateInput(date)
}
const utcTime = (value: string) =>
  `${String(new Date(value).getUTCHours()).padStart(2, '0')}:${String(new Date(value).getUTCMinutes()).padStart(2, '0')}`

export function BookingPage() {
  const queryClient = useQueryClient()
  const [serviceId, setServiceId] = useState('')
  const [specialistId, setSpecialistId] = useState('')
  const [date, setDate] = useState(tomorrow)
  const [slot, setSlot] = useState('')
  const services = useQuery({ queryKey: ['services'], queryFn: api.services.list })
  const specialists = useQuery({ queryKey: ['specialists'], queryFn: api.specialists.list })
  const availableSpecialists = useMemo(
    () =>
      specialists.data?.filter((item) =>
        item.services.some(({ service }) => service.id === serviceId)
      ) ?? [],
    [serviceId, specialists.data]
  )
  const slots = useQuery({
    queryKey: ['availability', specialistId, serviceId, date],
    queryFn: () => api.availability(specialistId, serviceId, date),
    enabled: Boolean(specialistId && serviceId && date)
  })
  const create = useMutation({
    mutationFn: api.bookings.create,
    onSuccess: async () => {
      toast.success('Запись подтверждена')
      setSlot('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['availability'] }),
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
      ])
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : 'Не удалось создать запись')
  })

  if (services.isLoading || specialists.isLoading) return <PageLoader />
  if (services.error || specialists.error)
    return <ErrorState message="Не удалось загрузить услуги и специалистов" />

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-copper">
          Онлайн-запись
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Выберите удобное время
        </h1>
        <p className="mt-2 text-ink/50">Три шага — и место у мастера ваше.</p>
      </header>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <section className="space-y-5">
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-copper text-xs text-white">
                1
              </span>
              Услуга
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.data?.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setServiceId(service.id)
                    setSpecialistId('')
                    setSlot('')
                  }}
                  className={cn(
                    'rounded-xl border p-4 text-left transition hover:border-copper/50',
                    serviceId === service.id
                      ? 'border-copper bg-copper/5 ring-2 ring-copper/10'
                      : 'border-ink/10'
                  )}
                >
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold">{service.name}</span>
                    {serviceId === service.id && <Check className="h-4 w-4 text-copper" />}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-ink/45">
                    {service.description || 'Профессиональный уход'}
                  </p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span>{formatMoney(service.price)}</span>
                    <span className="text-ink/45">{service.durationMin} мин</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div
            className={cn(
              'rounded-2xl border border-ink/10 bg-white p-5 shadow-card transition',
              !serviceId && 'pointer-events-none opacity-45'
            )}
          >
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-copper text-xs text-white">
                2
              </span>
              Мастер
            </h2>
            {availableSpecialists.length ? (
              <div className="flex flex-wrap gap-3">
                {availableSpecialists.map((specialist) => (
                  <button
                    key={specialist.id}
                    onClick={() => {
                      setSpecialistId(specialist.id)
                      setSlot('')
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-3 transition',
                      specialistId === specialist.id
                        ? 'border-copper bg-copper/5'
                        : 'border-ink/10 hover:border-copper/50'
                    )}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-cream">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{specialist.user.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink/45">Сначала выберите услугу.</p>
            )}
          </div>
          <div
            className={cn(
              'rounded-2xl border border-ink/10 bg-white p-5 shadow-card transition',
              !specialistId && 'pointer-events-none opacity-45'
            )}
          >
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-copper text-xs text-white">
                3
              </span>
              Дата и время
            </h2>
            <Input
              type="date"
              min={tomorrow()}
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                setSlot('')
              }}
              className="max-w-52"
            />
            {slots.isFetching ? (
              <PageLoader />
            ) : slots.data?.length ? (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.data.map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlot(value)}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                      slot === value
                        ? 'border-ink bg-ink text-white'
                        : 'border-ink/10 hover:border-copper'
                    )}
                  >
                    {utcTime(value)}
                  </button>
                ))}
              </div>
            ) : (
              specialistId && (
                <div className="mt-4">
                  <EmptyState title="Свободных окон нет" text="Попробуйте выбрать другую дату." />
                </div>
              )
            )}
            <p className="mt-3 text-xs text-ink/35">
              Время указано в UTC согласно расписанию салона.
            </p>
          </div>
        </section>
        <aside className="h-fit rounded-2xl bg-ink p-6 text-white xl:sticky xl:top-10">
          <p className="text-xs uppercase tracking-[.22em] text-[#d98761]">Ваша запись</p>
          <div className="mt-6 space-y-4 text-sm">
            {serviceId ? (
              <Summary
                icon={Scissors}
                label="Услуга"
                value={services.data?.find((item) => item.id === serviceId)?.name ?? ''}
              />
            ) : (
              <p className="text-white/40">Заполните шаги слева</p>
            )}
            {specialistId && (
              <Summary
                icon={UserRound}
                label="Мастер"
                value={specialists.data?.find((item) => item.id === specialistId)?.user.name ?? ''}
              />
            )}
            {date && serviceId && (
              <Summary
                icon={CalendarDays}
                label="Дата"
                value={new Date(`${date}T00:00:00Z`).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  timeZone: 'UTC'
                })}
              />
            )}
            {slot && <Summary icon={Clock3} label="Время" value={utcTime(slot)} />}
          </div>
          <Button
            className="mt-7 w-full bg-copper hover:bg-[#ca6b45]"
            disabled={!slot}
            loading={create.isPending}
            onClick={() => slot && create.mutate({ specialistId, serviceId, startAt: slot })}
          >
            Подтвердить запись
          </Button>
        </aside>
      </div>
    </div>
  )
}

function Summary({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Scissors
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-[#d98761]" />
      <div>
        <p className="text-xs text-white/35">{label}</p>
        <p className="mt-0.5 font-medium">{value}</p>
      </div>
    </div>
  )
}
