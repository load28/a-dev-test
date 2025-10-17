/**
 * Room-related TypeScript type definitions
 */

/**
 * Room entity representing a bookable room
 */
export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  location: string;
  amenities: string[];
  isAvailable: boolean;
  pricePerHour: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Reservation entity
 */
export interface Reservation {
  id: string;
  roomId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Room with reservation information
 */
export interface RoomWithReservation extends Room {
  reservation?: Reservation;
  hasActiveReservation: boolean;
}

/**
 * Sort field options for room list
 */
export type RoomSortField = 'name' | 'capacity' | 'pricePerHour' | 'createdAt' | 'updatedAt';

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Query parameters for room list API
 */
export interface RoomListParams {
  // Pagination
  page?: number;
  limit?: number;

  // Filtering
  userId?: string; // Filter by user's reservations
  hasReservation?: boolean; // Filter rooms with active reservations
  isAvailable?: boolean; // Filter by availability
  minCapacity?: number;
  maxCapacity?: number;
  location?: string;
  amenities?: string[];

  // Sorting
  sortBy?: RoomSortField;
  order?: SortOrder;

  // Search
  search?: string; // Search by name or description
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Response structure for room list API
 */
export interface RoomListResponse {
  data: RoomWithReservation[];
  meta: PaginationMeta;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
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
