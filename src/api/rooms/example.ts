/**
 * Usage examples for Room List API
 * This file is for demonstration purposes only
 */

import { getRooms, getMockRooms } from './index'
import type { RoomListParams } from './index'

/**
 * Example 1: Basic room list with pagination
 */
export async function example1_BasicList(accessToken: string) {
  const response = await getRooms(
    {
      page: 1,
      limit: 10,
    },
    accessToken
  )

  console.log('Total rooms:', response.meta.totalItems)
  console.log('Rooms:', response.data)
  return response
}

/**
 * Example 2: Get user's reserved rooms
 */
export async function example2_UserReservedRooms(
  userId: string,
  accessToken: string
) {
  const response = await getRooms(
    {
      userId,
      hasReservation: true,
    },
    accessToken
  )

  console.log('User reserved rooms:', response.data)
  return response
}

/**
 * Example 3: Available rooms sorted by price
 */
export async function example3_AvailableRoomsByPrice(accessToken: string) {
  const response = await getRooms(
    {
      isAvailable: true,
      sortBy: 'pricePerHour',
      order: 'asc',
    },
    accessToken
  )

  console.log('Available rooms (cheapest first):', response.data)
  return response
}

/**
 * Example 4: Large rooms with specific amenities
 */
export async function example4_FilteredRooms(accessToken: string) {
  const response = await getRooms(
    {
      minCapacity: 15,
      amenities: ['Projector', 'WiFi'],
      sortBy: 'capacity',
      order: 'desc',
    },
    accessToken
  )

  console.log('Large rooms with Projector and WiFi:', response.data)
  return response
}

/**
 * Example 5: Search rooms
 */
export async function example5_SearchRooms(
  searchTerm: string,
  accessToken: string
) {
  const response = await getRooms(
    {
      search: searchTerm,
    },
    accessToken
  )

  console.log(`Rooms matching "${searchTerm}":`, response.data)
  return response
}

/**
 * Example 6: Using mock service for development
 */
export async function example6_MockService() {
  const response = await getMockRooms(
    {
      page: 1,
      limit: 5,
      isAvailable: true,
    },
    'mock-token'
  )

  console.log('Mock rooms:', response.data)
  console.log('Pagination:', response.meta)
  return response
}

/**
 * Example 7: Advanced filtering with pagination
 */
export async function example7_AdvancedQuery(accessToken: string) {
  const params: RoomListParams = {
    // Filtering
    isAvailable: true,
    minCapacity: 10,
    maxCapacity: 20,
    location: 'Building A',
    amenities: ['WiFi', 'Whiteboard'],

    // Sorting
    sortBy: 'pricePerHour',
    order: 'asc',

    // Pagination
    page: 1,
    limit: 10,
  }

  const response = await getRooms(params, accessToken)

  console.log('Filtered rooms:', response.data)
  console.log('Page info:', response.meta)
  return response
}

/**
 * Example 8: Pagination navigation
 */
export async function example8_PaginationNavigation(accessToken: string) {
  let currentPage = 1
  const limit = 5

  // Get first page
  const firstPage = await getRooms({ page: currentPage, limit }, accessToken)
  console.log(`Page ${currentPage}:`, firstPage.data.map(r => r.name))

  // Check if there's a next page
  if (firstPage.meta.hasNextPage) {
    currentPage++
    const nextPage = await getRooms({ page: currentPage, limit }, accessToken)
    console.log(`Page ${currentPage}:`, nextPage.data.map(r => r.name))
  }

  return firstPage
}

// Export all examples
export default {
  example1_BasicList,
  example2_UserReservedRooms,
  example3_AvailableRoomsByPrice,
  example4_FilteredRooms,
  example5_SearchRooms,
  example6_MockService,
  example7_AdvancedQuery,
  example8_PaginationNavigation,
}
