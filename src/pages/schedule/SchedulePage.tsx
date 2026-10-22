import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { useAuthStore } from '@/app/store/auth'
import { api } from '@/shared/api/api'
import { ApiError } from '@/shared/api/http'
import { minutesToTime, timeToMinutes } from '@/shared/lib/utils'
import type { WorkingHours } from '@/shared/model/types'
import { Button } from '@/shared/ui/Button'
import { ErrorState, PageLoader } from '@/shared/ui/Feedback'
import { Input } from '@/shared/ui/Form'

const days = [
  { id: 1, name: 'Понедельник' },
  { id: 2, name: 'Вторник' },
  { id: 3, name: 'Среда' },
  { id: 4, name: 'Четверг' },
  { id: 5, name: 'Пятница' },
  { id: 6, name: 'Суббота' },
  { id: 0, name: 'Воскресенье' }
]
type DayState = Record<number, { enabled: boolean; start: string; end: string }>

function createSchedule(workingHours: WorkingHours[]) {
  return days.reduce<DayState>((result, { id }) => {
    const hours = workingHours.find((item) => item.dayOfWeek === id)
    result[id] = hours
      ? {
          enabled: true,
          start: minutesToTime(hours.startMinute),
          end: minutesToTime(hours.endMinute)
        }
      : { enabled: false, start: '09:00', end: '18:00' }
    return result
  }, {})
}

export function SchedulePage() {
  const specialistId = useAuthStore((state) => state.user?.specialistProfile?.id)
  const specialists = useQuery({ queryKey: ['specialists'], queryFn: api.specialists.list })
  if (!specialistId) return <ErrorState message="Для аккаунта не найден профиль специалиста" />
  if (specialists.isLoading) return <PageLoader />
  if (specialists.error) return <ErrorState message="Не удалось загрузить расписание" />
  const current = specialists.data?.find((item) => item.id === specialistId)
  if (!current) return <ErrorState message="Профиль специалиста не найден" />
  return <ScheduleEditor specialistId={specialistId} workingHours={current.workingHours} />
}

function ScheduleEditor({
  specialistId,
  workingHours
}: {
  specialistId: string
  workingHours: WorkingHours[]
}) {
  const queryClient = useQueryClient()
  const [schedule, setSchedule] = useState<DayState>(() => createSchedule(workingHours))
  const save = useMutation({
    mutationFn: () =>
      api.specialists.setSchedule(
        specialistId,
        days
          .filter(({ id }) => schedule[id].enabled)
          .map(({ id }) => ({
            dayOfWeek: id,
            startMinute: timeToMinutes(schedule[id].start),
            endMinute: timeToMinutes(schedule[id].end)
          }))
      ),
    onSuccess: async () => {
      toast.success('Расписание сохранено')
      await queryClient.invalidateQueries({ queryKey: ['specialists'] })
    }
  })

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-copper">
          Рабочее время
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Моё расписание</h1>
        <p className="mt-2 text-sm text-ink/45">
          Укажите рабочие интервалы. Шаг времени — 30 минут, часовой пояс — UTC.
        </p>
      </header>
      <section className="max-w-3xl rounded-2xl border border-ink/10 bg-white p-5 shadow-card sm:p-7">
        <div className="grid gap-2">
          {days.map(({ id, name }) => {
            const value = schedule[id]
            return (
              <div
                key={id}
                className="grid items-center gap-3 rounded-xl border border-ink/5 p-3 sm:grid-cols-[170px_1fr]"
              >
                <label className="flex items-center gap-3 font-medium">
                  <input
                    type="checkbox"
                    checked={value.enabled}
                    onChange={(event) =>
                      setSchedule((state) => ({
                        ...state,
                        [id]: { ...state[id], enabled: event.target.checked }
                      }))
                    }
                    className="h-4 w-4 accent-copper"
                  />
                  {name}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    step="1800"
                    disabled={!value.enabled}
                    value={value.start}
                    onChange={(event) =>
                      setSchedule((state) => ({
                        ...state,
                        [id]: { ...state[id], start: event.target.value }
                      }))
                    }
                  />
                  <span className="text-ink/30">—</span>
                  <Input
                    type="time"
                    step="1800"
                    disabled={!value.enabled}
                    value={value.end}
                    onChange={(event) =>
                      setSchedule((state) => ({
                        ...state,
                        [id]: { ...state[id], end: event.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>
        {save.error && (
          <div className="mt-4">
            <ErrorState
              message={
                save.error instanceof ApiError
                  ? save.error.message
                  : 'Не удалось сохранить расписание'
              }
            />
          </div>
        )}
        <Button className="mt-6" loading={save.isPending} onClick={() => save.mutate()}>
          <Clock3 className="h-4 w-4" />
          Сохранить расписание
        </Button>
      </section>
    </div>
  )
}
