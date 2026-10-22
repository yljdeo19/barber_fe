export type Role = 'CLIENT' | 'SPECIALIST' | 'ADMIN'
export type BookingStatus = 'CONFIRMED' | 'CANCELLED'

export type User = {
  id: string
  email: string
  name: string
  role: Role
  createdAt?: string
  specialistProfile?: { id: string } | null
}

export type ServiceOffering = {
  id: string
  name: string
  description: string | null
  price: string
  durationMin: number
  isActive: boolean
}

export type WorkingHours = {
  id: string
  dayOfWeek: number
  startMinute: number
  endMinute: number
}

export type Specialist = {
  id: string
  user: { name: string }
  services: Array<{ service: ServiceOffering }>
  workingHours: WorkingHours[]
}

export type Booking = {
  id: string
  startAt: string
  endAt: string
  status: BookingStatus
  service: Pick<ServiceOffering, 'id' | 'name' | 'durationMin' | 'price'>
  specialist: { id: string; user: { name: string } }
  client: { id: string; name: string; email: string }
}
