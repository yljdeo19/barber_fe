import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'wouter'

import { useAuthStore } from '@/app/store/auth'
import { api } from '@/shared/api/api'

const homeByRole = { CLIENT: '/book', SPECIALIST: '/calendar', ADMIN: '/calendar' } as const

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()
  const [, navigate] = useLocation()
  return useMutation({
    mutationFn: api.auth.login,
    onSuccess: async ({ user }) => {
      setUser(user)
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate(homeByRole[user.role], { replace: true })
    }
  })
}

export function useRegister() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()
  const [, navigate] = useLocation()
  return useMutation({
    mutationFn: api.auth.register,
    onSuccess: async ({ user }) => {
      setUser(user)
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/book', { replace: true })
    }
  })
}

export function useLogout() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()
  const [, navigate] = useLocation()
  return useMutation({
    mutationFn: api.auth.logout,
    onSettled: () => {
      setUser(null)
      queryClient.clear()
      navigate('/login', { replace: true })
    }
  })
}
