/**
 * Booking Types
 * Type definitions for booking system
 */

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Booking {
  id: string
  userId: string
  serviceType: string
  startTime: string
  endTime: string
  status: BookingStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookingRequest {
  serviceType: string
  startTime: string
  endTime: string
  notes?: string
}

export interface CreateBookingResponse {
  booking: Booking
}

export interface GetBookingsResponse {
  bookings: Booking[]
  total: number
  page: number
  limit: number
}

export interface GetBookingResponse {
  booking: Booking
}

export enum BookingErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CONFLICT = 'CONFLICT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class BookingError extends Error {
  code: BookingErrorCode

  constructor(message: string, code: BookingErrorCode = BookingErrorCode.UNKNOWN_ERROR) {
    super(message)
    this.name = 'BookingError'
    this.code = code
  }
}
