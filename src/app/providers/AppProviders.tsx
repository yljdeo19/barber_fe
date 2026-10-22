import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useAuthStore } from '../store/auth'
import { api } from '@/shared/api/api'
import { ApiError } from '@/shared/api/http'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
      refetchOnWindowFocus: false
    },
    mutations: { retry: false }
  }
})

function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser)
  const setReady = useAuthStore((state) => state.setReady)
  const session = useQuery({ queryKey: ['me'], queryFn: api.auth.me })

  useEffect(() => {
    if (session.isSuccess) {
      setUser(session.data)
      setReady(true)
    }
    if (session.isError) {
      setUser(null)
      setReady(true)
    }
  }, [session.data, session.isError, session.isSuccess, setReady, setUser])

  return children
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>{children}</SessionBootstrap>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
    </QueryClientProvider>
  )
}
