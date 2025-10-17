/**
 * Room Reservation Types
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
