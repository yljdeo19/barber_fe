import { zodResolver } from '@hookform/resolvers/zod'
import { Scissors } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Redirect } from 'wouter'
import { z } from 'zod'

import { useAuthStore } from '@/app/store/auth'
import { useLogin, useRegister } from '@/features/auth/useAuthActions'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/Button'
import { ErrorState, PageLoader } from '@/shared/ui/Feedback'
import { Field, Input } from '@/shared/ui/Form'

const schema = z.object({
  name: z.string(),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов')
})
type FormValues = z.infer<typeof schema>

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, ready } = useAuthStore()
  const login = useLogin()
  const registerUser = useRegister()
  const mutation = mode === 'login' ? login : registerUser
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '' } })

  if (!ready) return <PageLoader />
  if (user) return <Redirect to="/" />

  const onSubmit = (values: FormValues) => {
    if (mode === 'register') {
      if (values.name.trim().length < 2) {
        setError('name', { message: 'Минимум 2 символа' })
        return
      }
      registerUser.mutate({
        name: values.name.trim(),
        email: values.email,
        password: values.password
      })
    } else login.mutate({ email: values.email, password: values.password })
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-paper lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_20%,#b85c38_0,transparent_35%),radial-gradient(circle_at_85%_80%,#687766_0,transparent_30%)]" />
        <div className="relative flex items-center gap-3 font-semibold tracking-[.16em]">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-white/20">
            <Scissors className="h-5 w-5 text-[#d98761]" />
          </span>
          NORTH & BLADE
        </div>
        <div className="relative max-w-xl">
          <p className="mb-5 text-xs uppercase tracking-[.3em] text-[#d98761]">
            Время принадлежит вам
          </p>
          <h1 className="text-5xl font-semibold leading-[1.08]">
            Хорошая стрижка начинается с удобной записи.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/55">
            Выберите мастера и свободное время — остальное мы возьмём на себя.
          </p>
        </div>
        <p className="relative text-xs text-white/35">© 2026 North & Blade</p>
      </section>
      <section className="grid place-items-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <div className="flex items-center gap-2 font-semibold tracking-wider">
              <Scissors className="h-5 w-5 text-copper" />
              NORTH & BLADE
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[.25em] text-copper">
            {mode === 'login' ? 'С возвращением' : 'Новый клиент'}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {mode === 'login' ? 'Войти в аккаунт' : 'Создать аккаунт'}
          </h2>
          <p className="mt-2 text-sm text-ink/50">
            {mode === 'login' ? 'Используйте email и пароль.' : 'Регистрация займёт меньше минуты.'}
          </p>
          <form
            className="mt-8 grid gap-4"
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event)
            }}
            noValidate
          >
            {mode === 'register' && (
              <Field label="Имя" error={errors.name?.message}>
                <Input
                  autoComplete="name"
                  placeholder="Айбар"
                  {...register('name', { minLength: 2 })}
                />
              </Field>
            )}
            <Field label="Email" error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="aibar@example.kz"
                {...register('email')}
              />
            </Field>
            <Field label="Пароль" error={errors.password?.message}>
              <Input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Минимум 8 символов"
                {...register('password')}
              />
            </Field>
            {mutation.error && (
              <ErrorState
                message={
                  mutation.error instanceof ApiError
                    ? mutation.error.message
                    : 'Что-то пошло не так'
                }
              />
            )}
            <Button className="mt-2 w-full" type="submit" loading={mutation.isPending}>
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-ink/50">
            {mode === 'login' ? 'Ещё нет аккаунта?' : 'Уже зарегистрированы?'}{' '}
            <Link
              className="font-semibold text-copper hover:underline"
              href={mode === 'login' ? '/register' : '/login'}
            >
              {mode === 'login' ? 'Регистрация' : 'Войти'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
