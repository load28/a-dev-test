/**
 * Room API module
 * Exports room-related API functions
 */

export { getRooms, RoomApiError } from './list'
export { getMockRooms } from './list.mock'
export type {
  Room,
  RoomWithReservation,
  Reservation,
  RoomListParams,
  RoomListResponse,
  RoomSortField,
  SortOrder,
  PaginationMeta,
  ApiError,
} from '../../types/room'
