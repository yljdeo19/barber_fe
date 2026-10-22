import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Scissors, UserRoundPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { api } from '@/shared/api/api'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/Button'
import { ErrorState, PageLoader } from '@/shared/ui/Feedback'
import { Field, Input } from '@/shared/ui/Form'

const schema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  serviceIds: z.array(z.string()).min(1, 'Выберите хотя бы одну услугу')
})
type Values = z.infer<typeof schema>

export function SpecialistsPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [servicesError, setServicesError] = useState<string | null>(null)
  const services = useQuery({ queryKey: ['services'], queryFn: api.services.list })
  const specialists = useQuery({ queryKey: ['specialists'], queryFn: api.specialists.list })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', serviceIds: [] }
  })
  const create = useMutation({
    mutationFn: api.specialists.create,
    onSuccess: async () => {
      toast.success('Специалист создан')
      reset()
      await queryClient.invalidateQueries({ queryKey: ['specialists'] })
    }
  })
  const updateServices = useMutation({
    mutationFn: ({ id, serviceIds }: { id: string; serviceIds: string[] }) =>
      api.specialists.updateServices(id, serviceIds),
    onSuccess: async () => {
      toast.success('Услуги специалиста обновлены')
      setEditing(null)
      setSelectedServiceIds([])
      setServicesError(null)
      await queryClient.invalidateQueries({ queryKey: ['specialists'] })
    }
  })

  const startEdit = (specialist: NonNullable<typeof specialists.data>[number]) => {
    setEditing(specialist.id)
    setSelectedServiceIds(specialist.services.map(({ service }) => service.id))
    setServicesError(null)
    updateServices.reset()
  }

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    )
    setServicesError(null)
  }

  const saveServices = (specialistId: string) => {
    if (!selectedServiceIds.length) {
      setServicesError('Выберите хотя бы одну услугу')
      return
    }
    updateServices.mutate({ id: specialistId, serviceIds: selectedServiceIds })
  }

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-copper">Команда</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Специалисты</h1>
      </header>
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form
          className="h-fit rounded-2xl border border-ink/10 bg-white p-5 shadow-card"
          onSubmit={(event) => {
            void handleSubmit((values) => create.mutate(values))(event)
          }}
        >
          <h2 className="mb-5 flex items-center gap-2 font-semibold">
            <UserRoundPlus className="h-4 w-4 text-copper" />
            Новый специалист
          </h2>
          <div className="grid gap-4">
            <Field label="Имя" error={errors.name?.message}>
              <Input autoComplete="name" {...register('name')} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" autoComplete="email" {...register('email')} />
            </Field>
            <Field label="Временный пароль" error={errors.password?.message}>
              <Input type="password" autoComplete="new-password" {...register('password')} />
            </Field>
            <Field label="Услуги" error={errors.serviceIds?.message}>
              <div className="grid gap-2 rounded-xl border border-ink/10 p-3">
                {services.data?.map((service) => (
                  <label
                    key={service.id}
                    className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                  >
                    <input
                      type="checkbox"
                      value={service.id}
                      className="accent-copper"
                      {...register('serviceIds')}
                    />
                    {service.name}
                  </label>
                ))}
              </div>
            </Field>
            {create.error && (
              <ErrorState
                message={
                  create.error instanceof ApiError
                    ? create.error.message
                    : 'Не удалось создать специалиста'
                }
              />
            )}
            <Button loading={create.isPending}>Создать аккаунт</Button>
          </div>
        </form>
        <section>
          {specialists.isLoading ? (
            <PageLoader />
          ) : specialists.error ? (
            <ErrorState message="Не удалось загрузить специалистов" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {specialists.data?.map((specialist) => (
                <article
                  key={specialist.id}
                  className="rounded-2xl border border-ink/10 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-cream">
                        <Scissors className="h-5 w-5 text-copper" />
                      </span>
                      <div>
                        <h3 className="font-semibold">{specialist.user.name}</h3>
                        <p className="text-xs text-ink/40">
                          {specialist.workingHours.length} рабочих дней
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-9 px-2.5"
                      aria-label="Редактировать услуги специалиста"
                      onClick={() => startEdit(specialist)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  {editing === specialist.id ? (
                    <div className="mt-4 grid gap-3 rounded-xl border border-ink/10 bg-cream/35 p-3">
                      <p className="text-sm font-medium">Доступные услуги</p>
                      <div className="grid gap-2">
                        {services.data?.map((service) => (
                          <label
                            key={service.id}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedServiceIds.includes(service.id)}
                              className="accent-copper"
                              onChange={() => toggleService(service.id)}
                            />
                            {service.name}
                          </label>
                        ))}
                      </div>
                      {servicesError && <p className="text-xs text-red-600">{servicesError}</p>}
                      {updateServices.error && (
                        <ErrorState
                          message={
                            updateServices.error instanceof ApiError
                              ? updateServices.error.message
                              : 'Не удалось обновить услуги специалиста'
                          }
                        />
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          className="flex-1"
                          loading={updateServices.isPending}
                          onClick={() => saveServices(specialist.id)}
                        >
                          Сохранить
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setEditing(null)
                            setSelectedServiceIds([])
                            setServicesError(null)
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {specialist.services.map(({ service }) => (
                        <span
                          key={service.id}
                          className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/60"
                        >
                          {service.name}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
