/**
 * Room Reservations API - List Endpoint
 * GET /api/rooms/reservations - Retrieve user's reservations with pagination
 *
 * Features:
 * - Session-based authentication
 * - Pagination support
 * - Filtering by status and date range
 * - Sorting options
 * - Mock implementation for development
 */

import type {
  Reservation,
  ReservationListResponse,
  PaginationParams,
  ReservationStatus,
  Room,
} from '../../types/room'

/**
 * Mock data generator for development
 */
class MockReservationData {
  private mockRooms: Room[] = [
    {
      id: 'room_001',
      name: 'Conference Room A',
      capacity: 10,
      floor: 3,
      building: 'Main Building',
      amenities: ['Projector', 'Whiteboard', 'Video Conference'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Conference+Room+A',
    },
    {
      id: 'room_002',
      name: 'Meeting Room B',
      capacity: 6,
      floor: 2,
      building: 'Main Building',
      amenities: ['TV', 'Whiteboard'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Meeting+Room+B',
    },
    {
      id: 'room_003',
      name: 'Executive Suite',
      capacity: 4,
      floor: 5,
      building: 'Executive Tower',
      amenities: ['Premium Audio', 'Smart Board', 'Coffee Machine'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Executive+Suite',
    },
    {
      id: 'room_004',
      name: 'Training Room',
      capacity: 20,
      floor: 1,
      building: 'Training Center',
      amenities: ['Projector', 'Audio System', 'Microphones'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Training+Room',
    },
    {
      id: 'room_005',
      name: 'Huddle Space',
      capacity: 4,
      floor: 2,
      building: 'Main Building',
      amenities: ['Monitor', 'Whiteboard'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Huddle+Space',
    },
  ]

  generateReservations(userId: string, count: number = 50): Reservation[] {
    const statuses = Object.values(ReservationStatus)
    const purposes = [
      'Team Standup Meeting',
      'Client Presentation',
      'Project Planning Session',
      'Training Workshop',
      'Executive Review',
      'Team Retrospective',
      'Product Demo',
      'Interview',
      'Brainstorming Session',
      'Department Meeting',
    ]

    const reservations: Reservation[] = []
    const now = new Date()

    for (let i = 0; i < count; i++) {
      const room = this.mockRooms[i % this.mockRooms.length]
      const daysOffset = Math.floor(Math.random() * 60) - 30 // -30 to +30 days
      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() + daysOffset)
      startDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0) // 9 AM to 5 PM

      const endDate = new Date(startDate)
      endDate.setHours(endDate.getHours() + 1 + Math.floor(Math.random() * 3)) // 1-4 hours duration

      const createdDate = new Date(startDate)
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 7)) // Created 0-7 days before

      const updatedDate = new Date(createdDate)
      updatedDate.setHours(updatedDate.getHours() + Math.floor(Math.random() * 24))

      // Determine status based on dates
      let status: ReservationStatus
      if (daysOffset < -1) {
        status = Math.random() > 0.8 ? ReservationStatus.CANCELLED : ReservationStatus.COMPLETED
      } else if (daysOffset < 0) {
        status = Math.random() > 0.9 ? ReservationStatus.CANCELLED : ReservationStatus.COMPLETED
      } else {
        status = Math.random() > 0.85 ? ReservationStatus.PENDING : ReservationStatus.CONFIRMED
      }

      reservations.push({
        id: `res_${String(i + 1).padStart(4, '0')}`,
        roomId: room.id,
        userId,
        room,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        purpose: purposes[i % purposes.length],
        status,
        createdAt: createdDate.toISOString(),
        updatedAt: updatedDate.toISOString(),
      })
    }

    return reservations
  }
}

/**
 * Room Reservations API Service
 */
class RoomReservationsAPI {
  private mockData = new MockReservationData()
  private reservationsCache: Map<string, Reservation[]> = new Map()

  /**
   * Get reservations for a user with pagination and filtering
   *
   * @param sessionId - User session identifier (or access token)
   * @param params - Pagination and filter parameters
   * @returns Paginated list of reservations
   */
  async getReservations(
    sessionId: string,
    params: Partial<PaginationParams> = {}
  ): Promise<ReservationListResponse> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    // Validate session
    if (!sessionId || sessionId === '') {
      throw new Error('Unauthorized: Invalid session')
    }

    // Extract user ID from session (in real implementation, this would validate the session)
    const userId = this.extractUserIdFromSession(sessionId)

    // Get or generate reservations for this user
    if (!this.reservationsCache.has(userId)) {
      this.reservationsCache.set(userId, this.mockData.generateReservations(userId))
    }

    let reservations = this.reservationsCache.get(userId) || []

    // Apply filters
    reservations = this.applyFilters(reservations, params)

    // Apply sorting
    reservations = this.applySorting(reservations, params)

    // Calculate pagination
    const page = params.page || 1
    const limit = Math.min(params.limit || 10, 100) // Max 100 items per page
    const totalItems = reservations.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    // Paginate results
    const paginatedData = reservations.slice(startIndex, endIndex)

    // Calculate summary statistics
    const summary = {
      totalReservations: totalItems,
      upcomingReservations: reservations.filter(
        (r) =>
          (r.status === ReservationStatus.CONFIRMED ||
            r.status === ReservationStatus.PENDING) &&
          new Date(r.startTime) > new Date()
      ).length,
      completedReservations: reservations.filter(
        (r) => r.status === ReservationStatus.COMPLETED
      ).length,
    }

    console.log(
      `[RoomReservationsAPI] Retrieved ${paginatedData.length} reservations for user ${userId} (page ${page}/${totalPages})`
    )

    return {
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary,
    }
  }

  /**
   * Apply filters to reservations
   */
  private applyFilters(
    reservations: Reservation[],
    params: Partial<PaginationParams>
  ): Reservation[] {
    let filtered = [...reservations]

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((r) => r.status === params.status)
    }

    // Filter by date range
    if (params.startDate) {
      const startDate = new Date(params.startDate)
      filtered = filtered.filter((r) => new Date(r.startTime) >= startDate)
    }

    if (params.endDate) {
      const endDate = new Date(params.endDate)
      filtered = filtered.filter((r) => new Date(r.endTime) <= endDate)
    }

    return filtered
  }

  /**
   * Apply sorting to reservations
   */
  private applySorting(
    reservations: Reservation[],
    params: Partial<PaginationParams>
  ): Reservation[] {
    const sortBy = params.sortBy || 'startTime'
    const sortOrder = params.sortOrder || 'desc'

    return reservations.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'startTime':
          aValue = new Date(a.startTime).getTime()
          bValue = new Date(b.startTime).getTime()
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
          aValue = new Date(a.startTime).getTime()
          bValue = new Date(b.startTime).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  /**
   * Extract user ID from session (mock implementation)
   */
  private extractUserIdFromSession(sessionId: string): string {
    // In real implementation, this would validate the session and extract user ID
    // For mock, we'll use a hash of the session ID
    if (sessionId.startsWith('mock_access_token_')) {
      return 'mock_user_' + sessionId.slice(-8)
    }
    return 'user_' + sessionId.slice(-8)
  }

  /**
   * Simulate network delay (100-500ms)
   */
  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 400 + 100
    return new Promise((resolve) => setTimeout(resolve, delay))
  }

  /**
   * Clear cache for a specific user (for testing)
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.reservationsCache.delete(userId)
    } else {
      this.reservationsCache.clear()
    }
  }
}

// Export singleton instance
export const roomReservationsAPI = new RoomReservationsAPI()

// Export class for testing
export { RoomReservationsAPI, MockReservationData }

/**
 * Convenience function to fetch reservations
 * Usage example:
 *
 * ```typescript
 * import { getReservations } from '@/api/rooms/list'
 *
 * const response = await getReservations(sessionId, {
 *   page: 1,
 *   limit: 20,
 *   status: ReservationStatus.CONFIRMED,
 *   sortBy: 'startTime',
 *   sortOrder: 'desc'
 * })
 * ```
 */
export async function getReservations(
  sessionId: string,
  params?: Partial<PaginationParams>
): Promise<ReservationListResponse> {
  return roomReservationsAPI.getReservations(sessionId, params)
}
