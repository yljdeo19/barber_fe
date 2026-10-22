import type { Booking, ServiceOffering, Specialist, User, WorkingHours } from '../model/types'
import { jsonBody, request } from './http'

export const api = {
  auth: {
    me: () => request<User>('/auth/me'),
    login: (body: { email: string; password: string }) =>
      request<{ user: User }>('/auth/login', { method: 'POST', body: jsonBody(body) }),
    register: (body: { name: string; email: string; password: string }) =>
      request<{ user: User }>('/auth/register', { method: 'POST', body: jsonBody(body) }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' })
  },
  services: {
    list: () => request<ServiceOffering[]>('/services'),
    create: (body: { name: string; description?: string; price: number; durationMin: number }) =>
      request<ServiceOffering>('/services', { method: 'POST', body: jsonBody(body) }),
    update: (
      id: string,
      body: {
        name?: string
        description?: string
        price?: number
        durationMin?: number
        isActive?: boolean
      }
    ) => request<ServiceOffering>(`/services/${id}`, { method: 'PATCH', body: jsonBody(body) }),
    remove: (id: string) => request<ServiceOffering>(`/services/${id}`, { method: 'DELETE' })
  },
  specialists: {
    list: () => request<Specialist[]>('/specialists'),
    create: (body: { name: string; email: string; password: string; serviceIds: string[] }) =>
      request('/specialists', { method: 'POST', body: jsonBody(body) }),
    updateServices: (id: string, serviceIds: string[]) =>
      request<Specialist>(`/specialists/${id}/services`, {
        method: 'PATCH',
        body: jsonBody({ serviceIds })
      }),
    setSchedule: (
      id: string,
      days: Array<Pick<WorkingHours, 'dayOfWeek' | 'startMinute' | 'endMinute'>>
    ) =>
      request<WorkingHours[]>(`/specialists/${id}/schedule`, {
        method: 'PUT',
        body: jsonBody({ days })
      })
  },
  availability: (specialistId: string, serviceId: string, date: string) => {
    const query = new URLSearchParams({ specialistId, serviceId, date })
    return request<string[]>(`/availability?${query}`)
  },
  bookings: {
    create: (body: { specialistId: string; serviceId: string; startAt: string }) =>
      request<Booking>('/bookings', { method: 'POST', body: jsonBody(body) }),
    mine: () => request<Booking[]>('/bookings/me'),
    cancel: (id: string) => request<Booking>(`/bookings/${id}/cancel`, { method: 'PATCH' }),
    calendar: (from: string, to: string, specialistId?: string) => {
      const query = new URLSearchParams({ from, to })
      if (specialistId) query.set('specialistId', specialistId)
      return request<Booking[]>(`/bookings/calendar?${query}`)
    }
  }
}
