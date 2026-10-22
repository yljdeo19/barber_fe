import type { ReactNode } from 'react'
import { Redirect, Route, Switch } from 'wouter'

import { useAuthStore } from '../store/auth'
import type { Role } from '@/shared/model/types'
import { PageLoader } from '@/shared/ui/Feedback'
import { AppLayout } from '@/widgets/layout/AppLayout'
import { AuthPage } from '@/pages/auth/AuthPage'
import { BookingPage } from '@/pages/booking/BookingPage'
import { MyBookingsPage } from '@/pages/bookings/MyBookingsPage'
import { ServicesPage } from '@/pages/admin/ServicesPage'
import { SpecialistsPage } from '@/pages/admin/SpecialistsPage'
import { CalendarPage } from '@/pages/calendar/CalendarPage'
import { SchedulePage } from '@/pages/schedule/SchedulePage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

const homeByRole: Record<Role, string> = {
  CLIENT: '/book',
  SPECIALIST: '/calendar',
  ADMIN: '/calendar'
}

function Protected({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, ready } = useAuthStore()
  if (!ready) return <PageLoader />
  if (!user) return <Redirect to="/login" />
  if (!roles.includes(user.role)) return <Redirect to={homeByRole[user.role]} />
  return <AppLayout>{children}</AppLayout>
}

function Home() {
  const { user, ready } = useAuthStore()
  if (!ready) return <PageLoader />
  return <Redirect to={user ? homeByRole[user.role] : '/login'} />
}

export function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login">
        <AuthPage mode="login" />
      </Route>
      <Route path="/register">
        <AuthPage mode="register" />
      </Route>
      <Route path="/book">
        <Protected roles={['CLIENT']}>
          <BookingPage />
        </Protected>
      </Route>
      <Route path="/bookings">
        <Protected roles={['CLIENT']}>
          <MyBookingsPage />
        </Protected>
      </Route>
      <Route path="/calendar">
        <Protected roles={['ADMIN', 'SPECIALIST']}>
          <CalendarPage />
        </Protected>
      </Route>
      <Route path="/schedule">
        <Protected roles={['SPECIALIST']}>
          <SchedulePage />
        </Protected>
      </Route>
      <Route path="/admin/services">
        <Protected roles={['ADMIN']}>
          <ServicesPage />
        </Protected>
      </Route>
      <Route path="/admin/specialists">
        <Protected roles={['ADMIN']}>
          <SpecialistsPage />
        </Protected>
      </Route>
      <Route component={NotFoundPage} />
    </Switch>
  )
}
