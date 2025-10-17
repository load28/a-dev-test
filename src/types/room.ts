/**
 * Room-related TypeScript type definitions
 */

/**
 * Facility information for a room
 */
export interface Facility {
  id: string
  name: string
  description?: string
  icon?: string
  category?: 'amenity' | 'service' | 'equipment' | 'other'
}

/**
 * Reservation information for a room
 */
export interface Reservation {
  id: string
  roomId: string
  userId: string
  userName?: string
  userEmail?: string
  checkInDate: string // ISO 8601 date string
  checkOutDate: string // ISO 8601 date string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  guestCount?: number
  totalPrice?: number
  specialRequests?: string
  createdAt: string // ISO 8601 date string
  updatedAt: string // ISO 8601 date string
}

/**
 * Room information
 */
export interface Room {
  id: string
  name: string
  description: string
  type?: 'single' | 'double' | 'suite' | 'deluxe' | 'other'
  capacity: number
  pricePerNight: number
  currency?: string
  imageUrl?: string
  images?: string[]
  isAvailable: boolean
  floor?: number
  size?: number // in square meters
  bedType?: string
  viewType?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Complete room detail response including facilities and reservations
 */
export interface RoomDetail extends Room {
  facilities: Facility[]
  reservations?: Reservation[]
}

/**
 * API response for room detail endpoint
 */
export interface RoomDetailResponse {
  room: RoomDetail
}

/**
 * Error response from room API
 */
export interface RoomApiError {
  error: string
  message: string
  statusCode: number
}
