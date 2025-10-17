/**
 * Room List Types
 * Type definitions for room booking system
 */

export interface Room {
  id: string
  name: string
  description?: string
  capacity?: number
  amenities?: string[]
}

export interface Booking {
  id: string
  roomId: string
  room?: Room
  userId: string
  startTime: string
  endTime: string
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface RoomListResponse {
  bookings: Booking[]
  total: number
}

export enum RoomListErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class RoomListError extends Error {
  code: RoomListErrorCode

  constructor(message: string, code: RoomListErrorCode = RoomListErrorCode.UNKNOWN_ERROR) {
    super(message)
    this.name = 'RoomListError'
    this.code = code
  }
}
