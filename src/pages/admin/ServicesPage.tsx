import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { api } from '@/shared/api/api'
import { ApiError } from '@/shared/api/http'
import { formatMoney } from '@/shared/lib/utils'
import type { ServiceOffering } from '@/shared/model/types'
import { Button } from '@/shared/ui/Button'
import { ErrorState, PageLoader } from '@/shared/ui/Feedback'
import { Field, Input, Textarea } from '@/shared/ui/Form'

const schema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  description: z.string(),
  price: z.number().nonnegative('Цена не может быть отрицательной'),
  durationMin: z.number().int().min(15).max(480)
})
type Values = z.infer<typeof schema>
const defaults: Values = { name: '', description: '', price: 0, durationMin: 60 }

export function ServicesPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<string | null>(null)
  const services = useQuery({ queryKey: ['services'], queryFn: api.services.list })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults })
  const save = useMutation({
    mutationFn: (values: Values) =>
      editing ? api.services.update(editing, values) : api.services.create(values),
    onSuccess: async () => {
      toast.success(editing ? 'Услуга обновлена' : 'Услуга создана')
      setEditing(null)
      reset(defaults)
      await queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })
  const remove = useMutation({
    mutationFn: api.services.remove,
    onSuccess: async () => {
      toast.success('Услуга скрыта')
      await queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })
  const startEdit = (service: ServiceOffering) => {
    setEditing(service.id)
    reset({
      name: service.name,
      description: service.description ?? '',
      price: Number(service.price),
      durationMin: service.durationMin
    })
  }

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-copper">Управление</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Услуги</h1>
      </header>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          className="h-fit rounded-2xl border border-ink/10 bg-white p-5 shadow-card"
          onSubmit={(event) => {
            void handleSubmit((values) => save.mutate(values))(event)
          }}
        >
          <h2 className="mb-5 flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4 text-copper" />
            {editing ? 'Редактировать услугу' : 'Новая услуга'}
          </h2>
          <div className="grid gap-4">
            <Field label="Название" error={errors.name?.message}>
              <Input {...register('name')} />
            </Field>
            <Field label="Описание">
              <Textarea {...register('description')} />
            </Field>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
              <Field label="Цена, ₸" error={errors.price?.message}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                />
              </Field>
              <Field label="Длительность" error={errors.durationMin?.message}>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  {...register('durationMin', { valueAsNumber: true })}
                />
              </Field>
            </div>
            {save.error && (
              <ErrorState
                message={
                  save.error instanceof ApiError ? save.error.message : 'Не удалось сохранить'
                }
              />
            )}
            <div className="flex gap-2">
              <Button className="flex-1" loading={save.isPending}>
                {editing ? 'Сохранить' : 'Создать'}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditing(null)
                    reset(defaults)
                  }}
                >
                  Отмена
                </Button>
              )}
            </div>
          </div>
        </form>
        <section>
          {services.isLoading ? (
            <PageLoader />
          ) : services.error ? (
            <ErrorState message="Не удалось загрузить услуги" />
          ) : (
            <div className="grid gap-3">
              {services.data?.map((service) => (
                <article
                  key={service.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-5"
                >
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="mt-1 text-sm text-ink/45">
                      {service.description || 'Без описания'}
                    </p>
                    <div className="mt-3 flex gap-4 text-sm">
                      <span>{formatMoney(service.price)}</span>
                      <span className="flex items-center gap-1 text-ink/45">
                        <Clock3 className="h-4 w-4" />
                        {service.durationMin} мин
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      aria-label="Редактировать"
                      onClick={() => startEdit(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      aria-label="Удалить"
                      onClick={() => remove.mutate(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
