/**
 * Mock Room List API
 * For development and testing purposes
 */

import type {
  Room,
  RoomWithReservation,
  Reservation,
  RoomListParams,
  RoomListResponse,
  SortOrder,
} from '../../types/room'

/**
 * Generate mock rooms data
 */
function generateMockRooms(): Room[] {
  return [
    {
      id: 'room-1',
      name: 'Conference Room A',
      description: 'Large conference room with video conferencing equipment',
      capacity: 20,
      location: 'Building A, Floor 3',
      amenities: ['Projector', 'Whiteboard', 'Video Conference', 'WiFi'],
      isAvailable: true,
      pricePerHour: 50,
      imageUrl: 'https://via.placeholder.com/400x300?text=Conference+Room+A',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
    },
    {
      id: 'room-2',
      name: 'Meeting Room B',
      description: 'Small meeting room perfect for team discussions',
      capacity: 8,
      location: 'Building A, Floor 2',
      amenities: ['TV Screen', 'Whiteboard', 'WiFi'],
      isAvailable: true,
      pricePerHour: 30,
      imageUrl: 'https://via.placeholder.com/400x300?text=Meeting+Room+B',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
    },
    {
      id: 'room-3',
      name: 'Executive Suite',
      description: 'Premium suite with luxury amenities for executive meetings',
      capacity: 12,
      location: 'Building B, Floor 5',
      amenities: ['Projector', 'Video Conference', 'Coffee Machine', 'WiFi', 'Lounge'],
      isAvailable: false,
      pricePerHour: 100,
      imageUrl: 'https://via.placeholder.com/400x300?text=Executive+Suite',
      createdAt: '2024-01-20T11:00:00Z',
      updatedAt: '2024-01-20T11:00:00Z',
    },
    {
      id: 'room-4',
      name: 'Training Room C',
      description: 'Spacious training room with flexible seating arrangements',
      capacity: 30,
      location: 'Building C, Floor 1',
      amenities: ['Projector', 'Whiteboard', 'Sound System', 'WiFi'],
      isAvailable: true,
      pricePerHour: 60,
      imageUrl: 'https://via.placeholder.com/400x300?text=Training+Room+C',
      createdAt: '2024-01-05T08:00:00Z',
      updatedAt: '2024-01-05T08:00:00Z',
    },
    {
      id: 'room-5',
      name: 'Huddle Room D',
      description: 'Quick meeting space for 4 people',
      capacity: 4,
      location: 'Building A, Floor 2',
      amenities: ['TV Screen', 'WiFi'],
      isAvailable: true,
      pricePerHour: 20,
      imageUrl: 'https://via.placeholder.com/400x300?text=Huddle+Room+D',
      createdAt: '2024-01-12T12:00:00Z',
      updatedAt: '2024-01-12T12:00:00Z',
    },
    {
      id: 'room-6',
      name: 'Innovation Lab',
      description: 'Creative space with brainstorming tools and collaborative tech',
      capacity: 15,
      location: 'Building B, Floor 2',
      amenities: ['Whiteboard', 'Smart TV', 'Breakout Spaces', 'WiFi', 'Standing Desks'],
      isAvailable: true,
      pricePerHour: 45,
      imageUrl: 'https://via.placeholder.com/400x300?text=Innovation+Lab',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-18T14:00:00Z',
    },
  ]
}

/**
 * Generate mock reservations
 */
function generateMockReservations(userId?: string): Reservation[] {
  const mockUserId = userId || 'user-123'

  return [
    {
      id: 'reservation-1',
      roomId: 'room-2',
      userId: mockUserId,
      startTime: '2024-10-18T10:00:00Z',
      endTime: '2024-10-18T12:00:00Z',
      status: 'confirmed',
      createdAt: '2024-10-17T09:00:00Z',
      updatedAt: '2024-10-17T09:00:00Z',
    },
    {
      id: 'reservation-2',
      roomId: 'room-3',
      userId: 'other-user-456',
      startTime: '2024-10-18T14:00:00Z',
      endTime: '2024-10-18T16:00:00Z',
      status: 'confirmed',
      createdAt: '2024-10-17T10:00:00Z',
      updatedAt: '2024-10-17T10:00:00Z',
    },
  ]
}

/**
 * Filter rooms based on parameters
 */
function filterRooms(
  rooms: Room[],
  reservations: Reservation[],
  params: RoomListParams
): RoomWithReservation[] {
  let filteredRooms: RoomWithReservation[] = rooms.map(room => {
    const reservation = reservations.find(r => r.roomId === room.id && r.status === 'confirmed')
    return {
      ...room,
      reservation,
      hasActiveReservation: !!reservation,
    }
  })

  // Filter by user's reservations
  if (params.userId) {
    filteredRooms = filteredRooms.filter(room =>
      room.reservation && room.reservation.userId === params.userId
    )
  }

  // Filter by reservation status
  if (params.hasReservation !== undefined) {
    filteredRooms = filteredRooms.filter(room =>
      room.hasActiveReservation === params.hasReservation
    )
  }

  // Filter by availability
  if (params.isAvailable !== undefined) {
    filteredRooms = filteredRooms.filter(room => room.isAvailable === params.isAvailable)
  }

  // Filter by capacity range
  if (params.minCapacity !== undefined) {
    filteredRooms = filteredRooms.filter(room => room.capacity >= params.minCapacity!)
  }
  if (params.maxCapacity !== undefined) {
    filteredRooms = filteredRooms.filter(room => room.capacity <= params.maxCapacity!)
  }

  // Filter by location
  if (params.location) {
    filteredRooms = filteredRooms.filter(room =>
      room.location.toLowerCase().includes(params.location!.toLowerCase())
    )
  }

  // Filter by amenities
  if (params.amenities && params.amenities.length > 0) {
    filteredRooms = filteredRooms.filter(room =>
      params.amenities!.every(amenity =>
        room.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
      )
    )
  }

  // Search in name or description
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredRooms = filteredRooms.filter(room =>
      room.name.toLowerCase().includes(searchLower) ||
      room.description.toLowerCase().includes(searchLower)
    )
  }

  return filteredRooms
}

/**
 * Sort rooms based on parameters
 */
function sortRooms(
  rooms: RoomWithReservation[],
  sortBy?: string,
  order: SortOrder = 'asc'
): RoomWithReservation[] {
  if (!sortBy) return rooms

  const sorted = [...rooms].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'capacity':
        aValue = a.capacity
        bValue = b.capacity
        break
      case 'pricePerHour':
        aValue = a.pricePerHour
        bValue = b.pricePerHour
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime()
        bValue = new Date(b.updatedAt).getTime()
        break
      default:
        return 0
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })

  return sorted
}

/**
 * Paginate rooms
 */
function paginateRooms(
  rooms: RoomWithReservation[],
  page: number = 1,
  limit: number = 10
): { data: RoomWithReservation[], meta: RoomListResponse['meta'] } {
  const totalItems = rooms.length
  const totalPages = Math.ceil(totalItems / limit)
  const currentPage = Math.max(1, Math.min(page, totalPages || 1))
  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit

  const paginatedData = rooms.slice(startIndex, endIndex)

  return {
    data: paginatedData,
    meta: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  }
}

/**
 * Mock implementation of getRooms
 * Simulates API delay for realistic testing
 */
export async function getMockRooms(
  params: RoomListParams = {},
  _accessToken: string
): Promise<RoomListResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const mockRooms = generateMockRooms()
  const mockReservations = generateMockReservations(params.userId)

  // Apply filters
  let filteredRooms = filterRooms(mockRooms, mockReservations, params)

  // Apply sorting
  filteredRooms = sortRooms(filteredRooms, params.sortBy, params.order)

  // Apply pagination
  const page = params.page || 1
  const limit = params.limit || 10
  const result = paginateRooms(filteredRooms, page, limit)

  return result
}

/**
 * Default export for convenience
 */
export default {
  getMockRooms,
}
