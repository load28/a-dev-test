/**
 * BookingList Component
 * Displays a list of room bookings with card UI
 * Handles navigation to detail pages on click
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Booking, BookingStatus, BookingListProps } from '../types/booking'

export function BookingList({ className = '' }: BookingListProps) {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data for demonstration
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))

        const mockBookings: Booking[] = [
          {
            id: '1',
            roomId: 'room-1',
            room: {
              id: 'room-1',
              name: 'Deluxe Ocean View',
              type: 'Suite',
              capacity: 2,
              pricePerNight: 250,
              amenities: ['Ocean View', 'King Bed', 'Balcony', 'WiFi'],
              imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500',
              description: 'Luxurious suite with stunning ocean views',
              available: true,
            },
            userId: 'user-1',
            checkIn: '2025-11-01',
            checkOut: '2025-11-05',
            guestCount: 2,
            totalPrice: 1000,
            status: BookingStatus.CONFIRMED,
            createdAt: '2025-10-15T10:00:00Z',
            updatedAt: '2025-10-15T10:00:00Z',
          },
          {
            id: '2',
            roomId: 'room-2',
            room: {
              id: 'room-2',
              name: 'Standard Double Room',
              type: 'Standard',
              capacity: 2,
              pricePerNight: 120,
              amenities: ['WiFi', 'TV', 'Air Conditioning'],
              imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500',
              description: 'Comfortable room perfect for business travelers',
              available: true,
            },
            userId: 'user-1',
            checkIn: '2025-11-10',
            checkOut: '2025-11-12',
            guestCount: 1,
            totalPrice: 240,
            status: BookingStatus.PENDING,
            createdAt: '2025-10-16T14:30:00Z',
            updatedAt: '2025-10-16T14:30:00Z',
          },
          {
            id: '3',
            roomId: 'room-3',
            room: {
              id: 'room-3',
              name: 'Family Suite',
              type: 'Suite',
              capacity: 4,
              pricePerNight: 350,
              amenities: ['Two Bedrooms', 'Kitchen', 'Living Room', 'WiFi'],
              imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500',
              description: 'Spacious suite ideal for families',
              available: true,
            },
            userId: 'user-1',
            checkIn: '2025-12-20',
            checkOut: '2025-12-27',
            guestCount: 4,
            totalPrice: 2450,
            status: BookingStatus.CONFIRMED,
            createdAt: '2025-10-17T09:15:00Z',
            updatedAt: '2025-10-17T09:15:00Z',
          },
        ]

        setBookings(mockBookings)
      } catch (err) {
        setError('Failed to load bookings')
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const handleBookingClick = (bookingId: string) => {
    navigate({ to: `/bookings/${bookingId}` })
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800'
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case BookingStatus.CHECKED_IN:
        return 'bg-blue-100 text-blue-800'
      case BookingStatus.CHECKED_OUT:
        return 'bg-gray-100 text-gray-800'
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return nights
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <svg
            className="h-12 w-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <svg
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-gray-600 font-medium">No bookings found</p>
          <p className="text-gray-500 text-sm mt-2">Your booking history will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <span className="text-sm text-gray-500">{bookings.length} total</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            onClick={() => handleBookingClick(booking.id)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Room Image */}
              <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                {booking.room.imageUrl ? (
                  <img
                    src={booking.room.imageUrl}
                    alt={booking.room.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="h-16 w-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Booking Details */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {booking.room.name}
                    </h3>
                    <p className="text-sm text-gray-600">{booking.room.type}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                {booking.room.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {booking.room.description}
                  </p>
                )}

                {/* Booking Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Check-in</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(booking.checkIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Check-out</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(booking.checkOut)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nights</p>
                    <p className="text-sm font-medium text-gray-900">
                      {calculateNights(booking.checkIn, booking.checkOut)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Guests</p>
                    <p className="text-sm font-medium text-gray-900">{booking.guestCount}</p>
                  </div>
                </div>

                {/* Amenities */}
                {booking.room.amenities.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {booking.room.amenities.slice(0, 4).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                        >
                          {amenity}
                        </span>
                      ))}
                      {booking.room.amenities.length > 4 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                          +{booking.room.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Total Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${booking.totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookingClick(booking.id)
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    View Details
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
