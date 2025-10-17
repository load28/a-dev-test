/**
 * ReservationForm Component
 * Restaurant reservation form with date/time selection and guest count
 */

import { useState } from 'react'

interface ReservationFormProps {
  onSubmit?: (data: ReservationData) => void
}

export interface ReservationData {
  date: string
  time: string
  guests: number
}

export function ReservationForm({ onSubmit }: ReservationFormProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState(2)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !time) {
      alert('Please select date and time')
      return
    }

    const reservationData: ReservationData = {
      date,
      time,
      guests,
    }

    if (onSubmit) {
      onSubmit(reservationData)
    }
  }

  const incrementGuests = () => {
    if (guests < 20) {
      setGuests(guests + 1)
    }
  }

  const decrementGuests = () => {
    if (guests > 1) {
      setGuests(guests - 1)
    }
  }

  // Generate time slots (e.g., 11:00, 11:30, 12:00, etc.)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 11; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Reservation</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        {/* Time Selection */}
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
            Select Time
          </label>
          <select
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          >
            <option value="">Choose a time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        {/* Guest Count */}
        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Guests
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={decrementGuests}
              disabled={guests <= 1}
              className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>

            <div className="flex-1 text-center">
              <input
                type="number"
                id="guests"
                value={guests}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (value >= 1 && value <= 20) {
                    setGuests(value)
                  }
                }}
                min="1"
                max="20"
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={incrementGuests}
              disabled={guests >= 20}
              className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">Maximum 20 guests per reservation</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-md"
        >
          Reserve Table
        </button>
      </form>

      {/* Info Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start space-x-2 text-sm text-gray-600">
          <svg
            className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-medium text-gray-900">Reservation Policy</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Reservations are held for 15 minutes</li>
              <li>Please arrive on time</li>
              <li>Cancellations accepted up to 2 hours before</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
