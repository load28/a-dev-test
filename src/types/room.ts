/**
 * Room and Booking Types
 * Type definitions for room details and booking management
 */

export interface Room {
  id: string
  name: string
  type: 'meeting' | 'conference' | 'workspace' | 'other'
  capacity: number
  floor: number
  building: string
  amenities: string[]
  description?: string
  imageUrl?: string
  pricePerHour?: number
}

export interface Booking {
  id: string
  roomId: string
  userId: string
  userName: string
  userEmail: string
  startTime: string
  endTime: string
  title: string
  description?: string
  status: 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface RoomWithBooking extends Room {
  currentBooking?: Booking
  upcomingBookings: Booking[]
}

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface CreateBookingRequest {
  roomId: string
  startTime: string
  endTime: string
  title: string
  description?: string
}

export interface UpdateBookingRequest {
  startTime?: string
  endTime?: string
  title?: string
  description?: string
}
