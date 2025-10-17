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
    
  }
}
  
/* Room Reservation Types
 * Room & Reservation Types
 * Type definitions for room reservation system
 */

export interface Room {
  id: string
  name: string
  capacity: number
  floor: number
  building: string
  amenities: string[]
  imageUrl?: string
  isActive: boolean
}

export interface Reservation {
  id: string
  roomId: string
  userId: string
  room: Room
  startTime: string // ISO 8601 date string
  endTime: string // ISO 8601 date string
  purpose: string
  status: ReservationStatus
  createdAt: string
  updatedAt: string
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: 'startTime' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  status?: ReservationStatus
  startDate?: string
  endDate?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface ReservationListResponse extends PaginatedResponse<Reservation> {
  summary?: {
    totalReservations: number
    upcomingReservations: number
    completedReservations: number
  }
  sessionId: string
  userId?: string
  startTime: Date
  endTime: Date
  purpose?: string
  createdAt: Date
}

export interface ReservationRequest {
  roomId: string
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
  purpose?: string
}

export interface ReservationResponse {
  reservation: Reservation
  room: Room
  message: string
}

export enum ReservationErrorCode {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_UNAVAILABLE = 'ROOM_UNAVAILABLE',
  INVALID_TIME_RANGE = 'INVALID_TIME_RANGE',
  TIME_CONFLICT = 'TIME_CONFLICT',
  DUPLICATE_RESERVATION = 'DUPLICATE_RESERVATION',
  SESSION_REQUIRED = 'SESSION_REQUIRED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class ReservationError extends Error {
  code: ReservationErrorCode

  constructor(message: string, code: ReservationErrorCode) {
    super(message)
    this.name = 'ReservationError'
    this.code = code
  }
}
