/**
 * Reservation Types
 * Type definitions for reservation system
 */

export interface Reservation {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  roomType: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  guests: number
  totalAmount: number
  phone?: string
  email?: string
  specialRequests?: string
  createdAt: string
}

export type ReservationStatus = Reservation['status']
