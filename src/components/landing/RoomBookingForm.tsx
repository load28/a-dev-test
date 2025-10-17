import React, { useState } from 'react';

// Room types definition
export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  amenities: string[];
  hourlyRate: number;
}

// Available room types
const ROOM_TYPES: RoomType[] = [
  {
    id: 'small',
    name: 'Small Meeting Room',
    capacity: 4,
    amenities: ['Whiteboard', 'TV Screen'],
    hourlyRate: 20,
  },
  {
    id: 'medium',
    name: 'Medium Conference Room',
    capacity: 8,
    amenities: ['Whiteboard', 'TV Screen', 'Video Conference'],
    hourlyRate: 40,
  },
  {
    id: 'large',
    name: 'Large Conference Room',
    capacity: 16,
    amenities: ['Whiteboard', 'TV Screen', 'Video Conference', 'Projector'],
    hourlyRate: 60,
  },
  {
    id: 'executive',
    name: 'Executive Boardroom',
    capacity: 12,
    amenities: ['Whiteboard', 'TV Screen', 'Video Conference', 'Projector', 'Premium Audio'],
    hourlyRate: 80,
  },
];

// Form data interface
export interface BookingFormData {
  roomType: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  purpose: string;
  requesterName: string;
  requesterEmail: string;
}

// Validation errors interface
interface ValidationErrors {
  roomType?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  attendees?: string;
  purpose?: string;
  requesterName?: string;
  requesterEmail?: string;
}

export const RoomBookingForm: React.FC = () => {
  const [formData, setFormData] = useState<BookingFormData>({
    roomType: '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: 1,
    purpose: '',
    requesterName: '',
    requesterEmail: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get minimum date (today)
  const getMinDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum time based on selected date
  const getMinTime = (): string => {
    if (formData.date === getMinDate()) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(Math.ceil(now.getMinutes() / 30) * 30).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '00:00';
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Room type validation
    if (!formData.roomType) {
      newErrors.roomType = 'Please select a room type';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else if (formData.date < getMinDate()) {
      newErrors.date = 'Date cannot be in the past';
    }

    // Start time validation
    if (!formData.startTime) {
      newErrors.startTime = 'Please select a start time';
    }

    // End time validation
    if (!formData.endTime) {
      newErrors.endTime = 'Please select an end time';
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    // Check minimum booking duration (30 minutes)
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

      if (diffMinutes < 30) {
        newErrors.endTime = 'Minimum booking duration is 30 minutes';
      } else if (diffMinutes > 480) {
        newErrors.endTime = 'Maximum booking duration is 8 hours';
      }
    }

    // Attendees validation
    if (formData.attendees < 1) {
      newErrors.attendees = 'At least 1 attendee is required';
    } else if (formData.roomType) {
      const selectedRoom = ROOM_TYPES.find(room => room.id === formData.roomType);
      if (selectedRoom && formData.attendees > selectedRoom.capacity) {
        newErrors.attendees = `Selected room has a maximum capacity of ${selectedRoom.capacity}`;
      }
    }

    // Purpose validation
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Please provide a purpose for the booking';
    } else if (formData.purpose.trim().length < 5) {
      newErrors.purpose = 'Purpose must be at least 5 characters';
    } else if (formData.purpose.trim().length > 200) {
      newErrors.purpose = 'Purpose must not exceed 200 characters';
    }

    // Requester name validation
    if (!formData.requesterName.trim()) {
      newErrors.requesterName = 'Please enter your name';
    } else if (formData.requesterName.trim().length < 2) {
      newErrors.requesterName = 'Name must be at least 2 characters';
    }

    // Requester email validation
    if (!formData.requesterEmail.trim()) {
      newErrors.requesterEmail = 'Please enter your email';
    } else if (!isValidEmail(formData.requesterEmail)) {
      newErrors.requesterEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'attendees' ? parseInt(value) || 0 : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Calculate total cost
  const calculateTotalCost = (): number => {
    if (!formData.roomType || !formData.startTime || !formData.endTime) {
      return 0;
    }

    const selectedRoom = ROOM_TYPES.find(room => room.id === formData.roomType);
    if (!selectedRoom) return 0;

    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return Math.ceil(hours * selectedRoom.hourlyRate);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Log booking data (in real app, this would be an API call)
      console.log('Booking submitted:', {
        ...formData,
        totalCost: calculateTotalCost(),
      });

      setSubmitSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          roomType: '',
          date: '',
          startTime: '',
          endTime: '',
          attendees: 1,
          purpose: '',
          requesterName: '',
          requesterEmail: '',
        });
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Booking submission error:', error);
      setErrors({ roomType: 'Failed to submit booking. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoom = ROOM_TYPES.find(room => room.id === formData.roomType);
  const totalCost = calculateTotalCost();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Book a Meeting Room</h2>

        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <strong>Success!</strong> Your booking has been submitted successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ROOM_TYPES.map(room => (
                <label
                  key={room.id}
                  className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.roomType === room.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="roomType"
                    value={room.id}
                    checked={formData.roomType === room.id}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-gray-900">{room.name}</span>
                    <span className="text-sm text-blue-600 font-medium">
                      ${room.hourlyRate}/hr
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Capacity: {room.capacity} people
                  </div>
                  <div className="text-xs text-gray-500">
                    {room.amenities.join(', ')}
                  </div>
                </label>
              ))}
            </div>
            {errors.roomType && (
              <p className="mt-1 text-sm text-red-600">{errors.roomType}</p>
            )}
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                min={getMinTime()}
                step="1800"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                step="1800"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Attendees *
            </label>
            <input
              type="number"
              id="attendees"
              name="attendees"
              value={formData.attendees}
              onChange={handleChange}
              min="1"
              max={selectedRoom?.capacity || 100}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.attendees ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.attendees && (
              <p className="mt-1 text-sm text-red-600">{errors.attendees}</p>
            )}
            {selectedRoom && (
              <p className="mt-1 text-sm text-gray-500">
                Maximum capacity: {selectedRoom.capacity} people
              </p>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Meeting *
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows={3}
              maxLength={200}
              placeholder="Brief description of the meeting purpose..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.purpose ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.purpose ? (
                <p className="text-sm text-red-600">{errors.purpose}</p>
              ) : (
                <span className="text-sm text-gray-500">
                  {formData.purpose.length}/200 characters
                </span>
              )}
            </div>
          </div>

          {/* Requester Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="requesterName"
                name="requesterName"
                value={formData.requesterName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.requesterName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.requesterName && (
                <p className="mt-1 text-sm text-red-600">{errors.requesterName}</p>
              )}
            </div>

            <div>
              <label htmlFor="requesterEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email *
              </label>
              <input
                type="email"
                id="requesterEmail"
                name="requesterEmail"
                value={formData.requesterEmail}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.requesterEmail ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.requesterEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.requesterEmail}</p>
              )}
            </div>
          </div>

          {/* Cost Summary */}
          {totalCost > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">Booking Summary</h3>
                  {selectedRoom && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedRoom.name} - {formData.date} ({formData.startTime} - {formData.endTime})
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">${totalCost}</p>
                  <p className="text-sm text-gray-500">Total Cost</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  roomType: '',
                  date: '',
                  startTime: '',
                  endTime: '',
                  attendees: 1,
                  purpose: '',
                  requesterName: '',
                  requesterEmail: '',
                });
                setErrors({});
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Book Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomBookingForm;
