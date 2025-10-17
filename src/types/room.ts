/**
 * Room Reservation Types
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
}
