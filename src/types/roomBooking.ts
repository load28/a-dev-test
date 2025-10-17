/**
 * Room Booking Types
 * Type definitions for room booking system
 */

/**
 * Room information
 */
export interface Room {
  id: string
  name: string
  capacity: number
  location?: string
  facilities?: string[]
}

/**
 * Booking request payload for POST /api/bookings
 */
export interface BookingRequest {
  roomId: string
  title: string
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
  attendees?: string[]
  description?: string
}

/**
 * Booking response from API
 */
export interface BookingResponse {
  id: string
  roomId: string
  userId: string
  title: string
  startTime: string
  endTime: string
  attendees?: string[]
  description?: string
  status: BookingStatus
  createdAt: string
  updatedAt: string
  room?: Room
}

/**
 * Booking status enum
 */
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

/**
 * API response wrapper for successful booking creation
 */
export interface CreateBookingApiResponse {
  success: true
  data: BookingResponse
  message?: string
}

/**
 * Error response from booking API
 */
export interface BookingErrorResponse {
  success: false
  error: {
    code: BookingErrorCode
    message: string
    details?: Record<string, unknown>
  }
}

/**
 * Booking error codes
 */
export enum BookingErrorCode {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_UNAVAILABLE = 'ROOM_UNAVAILABLE',
  INVALID_TIME_RANGE = 'INVALID_TIME_RANGE',
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for booking operations
 */
export class BookingError extends Error {
  code: BookingErrorCode
  details?: Record<string, unknown>

  constructor(
    message: string,
    code: BookingErrorCode = BookingErrorCode.UNKNOWN_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'BookingError'
    this.code = code
    this.details = details
  }
}

/**
 * Query parameters for fetching bookings
 */
export interface BookingQueryParams {
  roomId?: string
  startDate?: string
  endDate?: string
  status?: BookingStatus
  userId?: string
}

/**
 * List of bookings response
 */
export interface BookingListResponse {
  success: true
  data: BookingResponse[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
