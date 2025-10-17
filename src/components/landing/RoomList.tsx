/**
 * RoomList Component
 * Displays a list of available rooms with auto-refresh and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { roomListService, RoomListError } from '../../services/roomList.service'
import type { Room, RoomListParams } from '../../types/room'
import { tokenStorage } from '../../utils/tokenStorage'
import './RoomList.css'

interface RoomListProps {
  autoRefreshInterval?: number // in milliseconds, default 30000 (30s)
  initialParams?: RoomListParams
  onRoomSelect?: (room: Room) => void
}

/**
 * RoomList Component
 * Features:
 * - Data fetching from roomList.service
 * - Auto-refresh functionality
 * - Loading states
 * - Error handling with retry
 * - Pagination support
 */
export function RoomList({
  autoRefreshInterval = 30000,
  initialParams = { page: 1, pageSize: 20, status: 'active' },
  onRoomSelect,
}: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<RoomListParams>(initialParams)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialParams.page || 1)

  const refreshIntervalRef = useRef<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Fetch rooms from the API
   */
  const fetchRooms = useCallback(async (showLoadingState = true) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (showLoadingState) {
      setIsLoading(true)
    }
    setError(null)

    try {
      const accessToken = tokenStorage.getAccessToken()
      const response = await roomListService.getRooms(params, accessToken || undefined)

      setRooms(response.rooms)
      setTotalPages(Math.ceil(response.total / (params.pageSize || 20)))
      setCurrentPage(response.page)
    } catch (err) {
      if (err instanceof RoomListError) {
        setError(err.message)
      } else {
        setError('Failed to load rooms. Please try again.')
      }
      console.error('Failed to fetch rooms:', err)
    } finally {
      if (showLoadingState) {
        setIsLoading(false)
      }
    }
  }, [params])

  /**
   * Retry fetching rooms
   */
  const handleRetry = useCallback(() => {
    fetchRooms(true)
  }, [fetchRooms])

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }))
  }, [])

  /**
   * Handle room selection
   */
  const handleRoomClick = useCallback(
    (room: Room) => {
      if (onRoomSelect) {
        onRoomSelect(room)
      }
    },
    [onRoomSelect]
  )

  /**
   * Initial fetch and setup auto-refresh
   */
  useEffect(() => {
    fetchRooms(true)

    // Setup auto-refresh
    if (autoRefreshInterval > 0) {
      refreshIntervalRef.current = window.setInterval(() => {
        // Fetch without showing loading state for background refresh
        fetchRooms(false)
      }, autoRefreshInterval)
    }

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchRooms, autoRefreshInterval])

  /**
   * Re-fetch when params change
   */
  useEffect(() => {
    fetchRooms(true)
  }, [params])

  /**
   * Loading state
   */
  if (isLoading && rooms.length === 0) {
    return (
      <div className="room-list-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading rooms...</p>
        </div>
      </div>
    )
  }

  /**
   * Error state
   */
  if (error && rooms.length === 0) {
    return (
      <div className="room-list-container">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    )
  }

  /**
   * Empty state
   */
  if (rooms.length === 0) {
    return (
      <div className="room-list-container">
        <div className="empty-state">
          <p>No rooms available at the moment.</p>
          <button onClick={handleRetry} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>
    )
  }

  /**
   * Room list display
   */
  return (
    <div className="room-list-container">
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="close-button">
            ×
          </button>
        </div>
      )}

      <div className="room-list-header">
        <h2>Available Rooms</h2>
        <button onClick={() => fetchRooms(true)} className="refresh-button" disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="room-list">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`room-item ${room.status}`}
            onClick={() => handleRoomClick(room)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleRoomClick(room)
              }
            }}
          >
            <div className="room-header">
              <h3 className="room-name">{room.name}</h3>
              <span className={`room-status ${room.status}`}>{room.status}</span>
            </div>

            {room.description && <p className="room-description">{room.description}</p>}

            <div className="room-info">
              <div className="room-participants">
                <span className="icon">👥</span>
                <span>
                  {room.participantCount}
                  {room.maxParticipants && ` / ${room.maxParticipants}`}
                </span>
              </div>

              <div className="room-host">
                <span className="icon">👤</span>
                <span>{room.host.name}</span>
              </div>

              <div className="room-created">
                <span className="icon">🕐</span>
                <span>{new Date(room.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
