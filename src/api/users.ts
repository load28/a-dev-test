/**
 * Users API
 * Enterprise-grade user management API with pagination, sorting, and filtering
 */

import { users, User } from '../mocks/data'

/**
 * Query parameters for user list API
 */
export interface UsersQueryParams {
  // Pagination
  page?: number
  limit?: number

  // Sorting
  sortBy?: 'name' | 'email' | 'joinDate' | 'location'
  sortOrder?: 'asc' | 'desc'

  // Filtering
  search?: string // Search in name, email, bio
  location?: string // Filter by location
  dateFrom?: string // Filter by join date (from)
  dateTo?: string // Filter by join date (to)
}

/**
 * Paginated response for user list
 */
export interface UsersResponse {
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * Sort users by specified field and order
 */
function sortUsers(users: User[], sortBy: UsersQueryParams['sortBy'], sortOrder: UsersQueryParams['sortOrder']): User[] {
  if (!sortBy) return users

  const sorted = [...users].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'email':
        comparison = a.email.localeCompare(b.email)
        break
      case 'joinDate':
        comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
        break
      case 'location':
        comparison = (a.location || '').localeCompare(b.location || '')
        break
      default:
        return 0
    }

    return sortOrder === 'desc' ? -comparison : comparison
  })

  return sorted
}

/**
 * Filter users based on search and filter criteria
 */
function filterUsers(users: User[], params: UsersQueryParams): User[] {
  let filtered = [...users]

  // Search filter (name, email, bio)
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.bio && user.bio.toLowerCase().includes(searchLower))
    )
  }

  // Location filter
  if (params.location) {
    const locationLower = params.location.toLowerCase()
    filtered = filtered.filter(user =>
      user.location && user.location.toLowerCase().includes(locationLower)
    )
  }

  // Date range filter
  if (params.dateFrom) {
    const fromDate = new Date(params.dateFrom).getTime()
    filtered = filtered.filter(user =>
      new Date(user.joinDate).getTime() >= fromDate
    )
  }

  if (params.dateTo) {
    const toDate = new Date(params.dateTo).getTime()
    filtered = filtered.filter(user =>
      new Date(user.joinDate).getTime() <= toDate
    )
  }

  return filtered
}

/**
 * Paginate users array
 */
function paginateUsers(users: User[], page: number, limit: number): User[] {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  return users.slice(startIndex, endIndex)
}

/**
 * GET /api/users
 *
 * Returns a paginated list of users with sorting and filtering capabilities
 *
 * @param params Query parameters for pagination, sorting, and filtering
 * @returns Paginated user list response
 *
 * @example
 * ```typescript
 * // Basic usage
 * const response = await getUsers({ page: 1, limit: 10 })
 *
 * // With sorting
 * const response = await getUsers({
 *   page: 1,
 *   limit: 10,
 *   sortBy: 'joinDate',
 *   sortOrder: 'desc'
 * })
 *
 * // With filtering
 * const response = await getUsers({
 *   search: 'developer',
 *   location: 'San Francisco',
 *   dateFrom: '2023-01-01'
 * })
 * ```
 */
export async function getUsers(params: UsersQueryParams = {}): Promise<UsersResponse> {
  // Default values
  const page = params.page || 1
  const limit = params.limit || 10
  const sortBy = params.sortBy
  const sortOrder = params.sortOrder || 'asc'

  // Validate pagination params
  if (page < 1) {
    throw new Error('Page number must be greater than 0')
  }

  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100')
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))

  // Apply filters
  let filteredUsers = filterUsers(users, params)

  // Apply sorting
  filteredUsers = sortUsers(filteredUsers, sortBy, sortOrder)

  // Calculate pagination metadata
  const total = filteredUsers.length
  const totalPages = Math.ceil(total / limit)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  // Apply pagination
  const paginatedUsers = paginateUsers(filteredUsers, page, limit)

  return {
    data: paginatedUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  }
}

/**
 * Convenience function to build query string from params
 */
export function buildUsersQueryString(params: UsersQueryParams): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}
