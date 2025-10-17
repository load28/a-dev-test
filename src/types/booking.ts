/**
 * Booking Types
 * Type definitions for booking/room reservation system
 */

export interface Room {
  id: string
  name: string
  type: string
  capacity: number
  pricePerNight: number
  amenities: string[]
  imageUrl?: string
  description?: string
  available: boolean
}

export interface Booking {
  id: string
  roomId: string
  room: Room
  userId: string
  checkIn: string
  checkOut: string
  guestCount: number
  totalPrice: number
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
}

export interface BookingListProps {
  className?: string
}
