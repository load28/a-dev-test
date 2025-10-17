/**
 * RoomList Component
 * Displays a list of available rooms with booking information
 */

import { Room } from '../../types/room'

interface RoomListProps {
  rooms: Room[]
  onRoomClick?: (room: Room) => void
  isLoading?: boolean
}

export function RoomList({ rooms, onRoomClick, isLoading = false }: RoomListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-300" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-300 rounded w-full" />
              <div className="h-4 bg-gray-300 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <svg
          className="h-24 w-24 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rooms Available</h3>
        <p className="text-gray-600 text-center max-w-md">
          There are currently no rooms available for booking. Please check back later or contact
          support for assistance.
        </p>
      </div>
    )
  }

  // Room list
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onClick={() => onRoomClick?.(room)} />
      ))}
    </div>
  )
}

interface RoomCardProps {
  room: Room
  onClick?: () => void
}

function RoomCard({ room, onClick }: RoomCardProps) {
  const { name, description, capacity, floor, amenities, imageUrl, pricePerHour } = room

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
    >
      {/* Room Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
            <svg
              className="h-16 w-16 text-white opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        )}

        {/* Price Badge */}
        {pricePerHour && (
          <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-md">
            <span className="text-sm font-semibold text-gray-900">
              ${pricePerHour}
              <span className="text-xs text-gray-600">/hr</span>
            </span>
          </div>
        )}
      </div>

      {/* Room Details */}
      <div className="p-6">
        {/* Room Name */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Room Info */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
          {/* Capacity */}
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>{capacity} people</span>
          </div>

          {/* Floor */}
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>Floor {floor}</span>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Action Indicator */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-medium">View Details</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
