/**
 * Room Detail API
 * Handles room detail information retrieval
 */

import type { RoomDetail, RoomDetailResponse } from '../../types/room'
import { RoomError, RoomErrorCode } from '../../types/room'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

/**
 * Get room detail by ID
 *
 * @param roomId - The ID of the room to fetch
 * @param accessToken - Optional access token for authenticated requests
 * @returns Promise<RoomDetail> - Complete room information including reservation times and options
 * @throws RoomError - When the request fails
 *
 * @example
 * ```typescript
 * const roomDetail = await getRoomDetail('room-123', accessToken);
 * console.log(roomDetail.name); // Room name
 * console.log(roomDetail.reservationTimes); // Available time slots
 * console.log(roomDetail.options); // Available room options
 * ```
 */
export async function getRoomDetail(
  roomId: string,
  accessToken?: string
): Promise<RoomDetail> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add authorization header if token is provided
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw await handleErrorResponse(response)
    }

    const result: RoomDetailResponse = await response.json()

    if (!result.success || !result.data) {
      throw new RoomError(
        result.message || 'Failed to fetch room details',
        RoomErrorCode.UNKNOWN_ERROR
      )
    }

    return result.data
  } catch (error) {
    if (error instanceof RoomError) {
      throw error
    }
    throw new RoomError(
      'Failed to fetch room details',
      RoomErrorCode.NETWORK_ERROR
    )
  }
}

/**
 * Handle error responses from the API
 */
async function handleErrorResponse(response: Response): Promise<RoomError> {
  let errorMessage = 'An error occurred while fetching room details'
  let errorCode = RoomErrorCode.UNKNOWN_ERROR

  try {
    const errorData = await response.json()
    errorMessage = errorData.message || errorMessage
    errorCode = mapHttpStatusToErrorCode(response.status)
  } catch {
    errorCode = mapHttpStatusToErrorCode(response.status)
  }

  return new RoomError(errorMessage, errorCode)
}

/**
 * Map HTTP status codes to RoomErrorCode
 */
function mapHttpStatusToErrorCode(status: number): RoomErrorCode {
  switch (status) {
    case 401:
    case 403:
      return RoomErrorCode.UNAUTHORIZED
    case 404:
      return RoomErrorCode.NOT_FOUND
    default:
      return RoomErrorCode.UNKNOWN_ERROR
  }
}

/**
 * Create authenticated fetch function for room API calls
 *
 * @param getAccessToken - Function to retrieve the current access token
 * @returns Function that makes authenticated requests to fetch room details
 *
 * @example
 * ```typescript
 * const fetchRoomDetail = createAuthenticatedRoomFetch(() => tokenStorage.getAccessToken());
 * const room = await fetchRoomDetail('room-123');
 * ```
 */
export function createAuthenticatedRoomFetch(
  getAccessToken: () => string | null
): (roomId: string) => Promise<RoomDetail> {
  return async (roomId: string): Promise<RoomDetail> => {
    const token = getAccessToken()

    if (!token) {
      throw new RoomError(
        'No access token available',
        RoomErrorCode.UNAUTHORIZED
      )
    }

    return getRoomDetail(roomId, token)
  }
}
