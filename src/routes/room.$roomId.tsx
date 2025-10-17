/**
 * Room Detail Page
 * Displays room information, booking details, and management actions
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'
import type { RoomWithBooking, Booking } from '../types/room'

export const Route = createFileRoute('/room/$roomId')({
  component: RoomDetailPage,
})

function RoomDetailPage() {
  return (
    <ProtectedRoute>
      <RoomDetailContent />
    </ProtectedRoute>
  )
}

function RoomDetailContent() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { roomId } = Route.useParams()

  const [room, setRoom] = useState<RoomWithBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)

  useEffect(() => {
    loadRoomDetails()
  }, [roomId])

  const loadRoomDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock data for now - replace with actual API call
      const mockRoom: RoomWithBooking = {
        id: roomId,
        name: 'Conference Room A',
        type: 'conference',
        capacity: 10,
        floor: 3,
        building: 'Main Building',
        amenities: ['Projector', 'Whiteboard', 'Video Conference', 'WiFi'],
        description: 'A spacious conference room perfect for team meetings and presentations.',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        pricePerHour: 50,
        currentBooking: {
          id: 'booking-1',
          roomId: roomId,
          userId: user?.id || 'user-1',
          userName: user?.name || 'John Doe',
          userEmail: user?.email || 'john@example.com',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          title: 'Team Planning Meeting',
          description: 'Q4 planning and strategy discussion',
          status: 'confirmed',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        upcomingBookings: [
          {
            id: 'booking-2',
            roomId: roomId,
            userId: 'user-2',
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
            title: 'Client Presentation',
            description: 'Product demo for potential client',
            status: 'confirmed',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          },
        ],
      }

      setRoom(mockRoom)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load room details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      setCancellingBookingId(bookingId)
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reload room details after cancellation
      await loadRoomDetails()
      alert('Booking cancelled successfully')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel booking')
    } finally {
      setCancellingBookingId(null)
    }
  }

  const handleEditBooking = (bookingId: string) => {
    // TODO: Navigate to edit booking page or open modal
    alert(`Edit booking ${bookingId} - To be implemented`)
  }

  const handleBack = () => {
    navigate({ to: '/dashboard' })
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    return `${hours.toFixed(1)} hours`
  }

  const isUserBooking = (booking: Booking) => {
    return booking.userId === user?.id
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading room details...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error || 'Room not found'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Room Details</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Room Information Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {room.imageUrl && (
            <img
              src={room.imageUrl}
              alt={room.name}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h2>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className="flex items-center">
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Capacity: {room.capacity}
                  </span>
                  <span className="flex items-center">
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {room.building} - Floor {room.floor}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {room.type}
                  </span>
                </div>
              </div>
              {room.pricePerHour && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">${room.pricePerHour}</div>
                  <div className="text-sm text-gray-600">per hour</div>
                </div>
              )}
            </div>

            {room.description && (
              <p className="text-gray-700 mb-4">{room.description}</p>
            )}

            {/* Amenities */}
            {room.amenities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-md"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Booking */}
        {room.currentBooking && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Current Booking
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                In Progress
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{room.currentBooking.title}</h4>
                {room.currentBooking.description && (
                  <p className="text-gray-600 mt-1">{room.currentBooking.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Booked by</span>
                  <p className="text-gray-900">{room.currentBooking.userName}</p>
                  <p className="text-sm text-gray-600">{room.currentBooking.userEmail}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Time</span>
                  <p className="text-gray-900">
                    {formatDateTime(room.currentBooking.startTime)} - {formatDateTime(room.currentBooking.endTime)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Duration: {formatDuration(room.currentBooking.startTime, room.currentBooking.endTime)}
                  </p>
                </div>
              </div>

              {isUserBooking(room.currentBooking) && (
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleEditBooking(room.currentBooking!.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Edit Booking
                  </button>
                  <button
                    onClick={() => handleCancelBooking(room.currentBooking!.id)}
                    disabled={cancellingBookingId === room.currentBooking!.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancellingBookingId === room.currentBooking!.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Bookings */}
        {room.upcomingBookings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Bookings</h3>
            <div className="space-y-4">
              {room.upcomingBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{booking.title}</h4>
                      {booking.description && (
                        <p className="text-gray-600 text-sm mt-1">{booking.description}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Booked by:</span>
                      <span className="ml-2 text-gray-900">{booking.userName}</span>
                    </div>

                    <div>
                      <span className="font-medium text-gray-500">Time:</span>
                      <span className="ml-2 text-gray-900">
                        {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                      </span>
                    </div>
                  </div>

                  {isUserBooking(booking) && (
                    <div className="flex space-x-3 mt-4 pt-3 border-t">
                      <button
                        onClick={() => handleEditBooking(booking.id)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingBookingId === booking.id}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No upcoming bookings message */}
        {!room.currentBooking && room.upcomingBookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings</h3>
            <p className="mt-1 text-gray-500">This room is currently available for booking.</p>
          </div>
        )}
      </main>
    </div>
  )
}
