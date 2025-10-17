/**
 * Room Reservation API
 * POST /api/rooms/reserve endpoint implementation
 */

import type {
  Room,
  Reservation,
  ReservationRequest,
  ReservationResponse,
  ReservationErrorCode,
} from '../../types/room'
import { ReservationError } from '../../types/room'

// In-memory storage (replace with database in production)
const rooms: Map<string, Room> = new Map([
  [
    'room-001',
    {
      id: 'room-001',
      name: 'Conference Room A',
      capacity: 10,
      floor: 1,
      amenities: ['Projector', 'Whiteboard', 'Video Conference'],
      isActive: true,
    },
  ],
  [
    'room-002',
    {
      id: 'room-002',
      name: 'Meeting Room B',
      capacity: 6,
      floor: 2,
      amenities: ['Whiteboard', 'TV Screen'],
      isActive: true,
    },
  ],
  [
    'room-003',
    {
      id: 'room-003',
      name: 'Small Room C',
      capacity: 4,
      floor: 1,
      amenities: ['Whiteboard'],
      isActive: true,
    },
  ],
])

const reservations: Reservation[] = []

/**
 * Validate time range
 */
function validateTimeRange(startTime: Date, endTime: Date): void {
  const now = new Date()

  if (startTime >= endTime) {
    throw new ReservationError(
      'End time must be after start time',
      'INVALID_TIME_RANGE' as ReservationErrorCode
    )
  }

  if (startTime < now) {
    throw new ReservationError(
      'Cannot reserve in the past',
      'INVALID_TIME_RANGE' as ReservationErrorCode
    )
  }

  // Maximum reservation duration: 8 hours
  const maxDuration = 8 * 60 * 60 * 1000
  if (endTime.getTime() - startTime.getTime() > maxDuration) {
    throw new ReservationError(
      'Reservation duration cannot exceed 8 hours',
      'INVALID_TIME_RANGE' as ReservationErrorCode
    )
  }
}

/**
 * Check for time conflicts with existing reservations
 */
function hasTimeConflict(
  roomId: string,
  startTime: Date,
  endTime: Date
): boolean {
  return reservations.some(
    (reservation) =>
      reservation.roomId === roomId &&
      ((startTime >= reservation.startTime && startTime < reservation.endTime) ||
        (endTime > reservation.startTime && endTime <= reservation.endTime) ||
        (startTime <= reservation.startTime && endTime >= reservation.endTime))
  )
}

/**
 * Check for duplicate reservation by session
 */
function hasDuplicateReservation(
  sessionId: string,
  roomId: string,
  startTime: Date,
  endTime: Date
): boolean {
  return reservations.some(
    (reservation) =>
      reservation.sessionId === sessionId &&
      reservation.roomId === roomId &&
      reservation.startTime.getTime() === startTime.getTime() &&
      reservation.endTime.getTime() === endTime.getTime()
  )
}

/**
 * Generate unique reservation ID
 */
function generateReservationId(): string {
  return `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create room reservation
 */
export async function createReservation(
  request: ReservationRequest,
  sessionId: string,
  userId?: string
): Promise<ReservationResponse> {
  // Validate session ID
  if (!sessionId) {
    throw new ReservationError(
      'Session ID is required',
      'SESSION_REQUIRED' as ReservationErrorCode
    )
  }

  // Validate request
  if (!request.roomId || !request.startTime || !request.endTime) {
    throw new ReservationError(
      'Missing required fields',
      'VALIDATION_ERROR' as ReservationErrorCode
    )
  }

  // Check if room exists
  const room = rooms.get(request.roomId)
  if (!room) {
    throw new ReservationError(
      `Room ${request.roomId} not found`,
      'ROOM_NOT_FOUND' as ReservationErrorCode
    )
  }

  // Check if room is active
  if (!room.isActive) {
    throw new ReservationError(
      `Room ${room.name} is currently unavailable`,
      'ROOM_UNAVAILABLE' as ReservationErrorCode
    )
  }

  // Parse and validate time range
  const startTime = new Date(request.startTime)
  const endTime = new Date(request.endTime)

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    throw new ReservationError(
      'Invalid date format',
      'VALIDATION_ERROR' as ReservationErrorCode
    )
  }

  validateTimeRange(startTime, endTime)

  // Check for duplicate reservation
  if (hasDuplicateReservation(sessionId, request.roomId, startTime, endTime)) {
    throw new ReservationError(
      'Duplicate reservation detected',
      'DUPLICATE_RESERVATION' as ReservationErrorCode
    )
  }

  // Check for time conflicts
  if (hasTimeConflict(request.roomId, startTime, endTime)) {
    throw new ReservationError(
      `Room ${room.name} is already booked for the selected time`,
      'TIME_CONFLICT' as ReservationErrorCode
    )
  }

  // Create reservation
  const reservation: Reservation = {
    id: generateReservationId(),
    roomId: request.roomId,
    sessionId,
    userId,
    startTime,
    endTime,
    purpose: request.purpose,
    createdAt: new Date(),
  }

  reservations.push(reservation)

  return {
    reservation,
    room,
    message: `Successfully reserved ${room.name} from ${startTime.toLocaleString()} to ${endTime.toLocaleString()}`,
  }
}

/**
 * Get all reservations (for testing/debugging)
 */
export function getAllReservations(): Reservation[] {
  return [...reservations]
}

/**
 * Get reservations by session ID
 */
export function getReservationsBySession(sessionId: string): Reservation[] {
  return reservations.filter((r) => r.sessionId === sessionId)
}

/**
 * Get available rooms for a time slot
 */
export function getAvailableRooms(startTime: Date, endTime: Date): Room[] {
  return Array.from(rooms.values()).filter(
    (room) =>
      room.isActive && !hasTimeConflict(room.id, startTime, endTime)
  )
}

/**
 * Clear all reservations (for testing)
 */
export function clearReservations(): void {
  reservations.length = 0
}

/**
 * POST /api/rooms/reserve handler
 */
export async function handleReserveRequest(
  req: Request
): Promise<Response> {
  try {
    // Parse request body
    const body = await req.json() as ReservationRequest

    // Extract session ID from headers or cookies
    const sessionId = req.headers.get('x-session-id') ||
                      req.headers.get('cookie')?.match(/sessionId=([^;]+)/)?.[1]

    if (!sessionId) {
      return new Response(
        JSON.stringify({
          error: 'Session ID required',
          code: 'SESSION_REQUIRED',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract user ID from auth token if available
    const authHeader = req.headers.get('authorization')
    const userId = authHeader?.match(/Bearer\s+(.+)/)?.[1]

    // Create reservation
    const response = await createReservation(body, sessionId, userId)

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error instanceof ReservationError) {
      const statusCode = getStatusCodeForError(error.code)
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        }),
        {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Unexpected error
    console.error('Reservation error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        code: 'UNKNOWN_ERROR',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusCodeForError(code: ReservationErrorCode): number {
  const statusMap: Record<ReservationErrorCode, number> = {
    ROOM_NOT_FOUND: 404,
    ROOM_UNAVAILABLE: 409,
    INVALID_TIME_RANGE: 400,
    TIME_CONFLICT: 409,
    DUPLICATE_RESERVATION: 409,
    SESSION_REQUIRED: 401,
    VALIDATION_ERROR: 400,
  }
  return statusMap[code] || 500
}
