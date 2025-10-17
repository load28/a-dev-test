/**
 * Room Types
 * Type definitions for room/booking system
 */

export interface Room {
  id: string
  name: string
  description: string
  capacity: number
  floor: number
  amenities: string[]
  imageUrl?: string
  pricePerHour?: number
}

export interface Booking {
  id: string
  roomId: string
  room: Room
  userId: string
  startTime: Date
  endTime: Date
  status: BookingStatus
  createdAt: Date
  updatedAt: Date
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface CreateBookingRequest {
  roomId: string
  startTime: Date
  endTime: Date
}

export interface UpdateBookingRequest {
  startTime?: Date
  endTime?: Date
  status?: BookingStatus
}
