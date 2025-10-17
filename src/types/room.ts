/**
 * Room Types
 * Type definitions for room management system
 */

/**
 * Room option information
 */
export interface RoomOption {
  id: string
  name: string
  description?: string
  price: number
  isAvailable: boolean
}

/**
 * Reservation time slot
 */
export interface ReservationTime {
  id: string
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
  isAvailable: boolean
  price?: number
}

/**
 * Room basic information
 */
export interface Room {
  id: string
  name: string
  description?: string
  capacity: number
  basePrice: number
  imageUrl?: string
  amenities?: string[]
  location?: string
}

/**
 * Room detail response with all information
 */
export interface RoomDetail extends Room {
  reservationTimes: ReservationTime[]
  options: RoomOption[]
}

/**
 * Room API response
 */
export interface RoomDetailResponse {
  success: boolean
  data: RoomDetail
  message?: string
}

/**
 * Room error codes
 */
export enum RoomErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Room error class
 */
export class RoomError extends Error {
  code: RoomErrorCode

  constructor(message: string, code: RoomErrorCode = RoomErrorCode.UNKNOWN_ERROR) {
    super(message)
    this.name = 'RoomError'
    this.code = code
  }
}
