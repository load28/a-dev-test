import React, { useState, FormEvent } from 'react';
import {
  roomBookingService,
  RoomBookingRequest,
  RoomBookingResponse,
  ApiError,
} from '../../services/roomBooking.service';

interface FormData {
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  specialRequests: string;
}

interface FormErrors {
  [key: string]: string;
}

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

const RoomBookingForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    roomType: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [apiError, setApiError] = useState<string>('');
  const [bookingResponse, setBookingResponse] = useState<RoomBookingResponse | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.roomType) {
      newErrors.roomType = 'Room type is required';
    }

    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }

    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    }

    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);

      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = 'Check-out date must be after check-in date';
      }
    }

    if (formData.guests < 1) {
      newErrors.guests = 'At least 1 guest is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) || 1 : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset previous submission state
    setApiError('');
    setBookingResponse(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set loading state
    setSubmissionState('loading');

    try {
      // Prepare request data
      const bookingRequest: RoomBookingRequest = {
        roomType: formData.roomType,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialRequests: formData.specialRequests || undefined,
      };

      // Submit booking
      const response = await roomBookingService.createBooking(bookingRequest);

      // Set success state
      setSubmissionState('success');
      setBookingResponse(response);

      // Reset form
      setFormData({
        roomType: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        name: '',
        email: '',
        phone: '',
        specialRequests: '',
      });
    } catch (error) {
      // Set error state
      setSubmissionState('error');
      const apiErr = error as ApiError;
      setApiError(apiErr.message || 'Failed to create booking. Please try again.');

      // Handle validation errors from API
      if (apiErr.details) {
        const newErrors: FormErrors = {};
        Object.entries(apiErr.details).forEach(([field, messages]) => {
          newErrors[field] = messages[0];
        });
        setErrors(newErrors);
      }
    }
  };

  const resetForm = () => {
    setSubmissionState('idle');
    setApiError('');
    setBookingResponse(null);
    setErrors({});
  };

  return (
    <div className="room-booking-form-container">
      <h2>Book Your Room</h2>

      {/* Success Message */}
      {submissionState === 'success' && bookingResponse && (
        <div className="alert alert-success">
          <h3>Booking Confirmed!</h3>
          <p>Your booking has been successfully created.</p>
          <p>
            <strong>Booking ID:</strong> {bookingResponse.id}
          </p>
          <p>
            <strong>Status:</strong> {bookingResponse.status}
          </p>
          <p>
            <strong>Total Price:</strong> ${bookingResponse.totalPrice}
          </p>
          <button type="button" onClick={resetForm} className="btn btn-primary">
            Make Another Booking
          </button>
        </div>
      )}

      {/* Error Message */}
      {submissionState === 'error' && apiError && (
        <div className="alert alert-error">
          <h3>Booking Failed</h3>
          <p>{apiError}</p>
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      )}

      {/* Booking Form */}
      {(submissionState === 'idle' || submissionState === 'loading') && (
        <form onSubmit={handleSubmit} className="booking-form">
          {/* Room Type */}
          <div className="form-group">
            <label htmlFor="roomType">Room Type *</label>
            <select
              id="roomType"
              name="roomType"
              value={formData.roomType}
              onChange={handleInputChange}
              disabled={submissionState === 'loading'}
              className={errors.roomType ? 'error' : ''}
            >
              <option value="">Select a room type</option>
              <option value="standard">Standard Room</option>
              <option value="deluxe">Deluxe Room</option>
              <option value="suite">Suite</option>
              <option value="presidential">Presidential Suite</option>
            </select>
            {errors.roomType && <span className="error-message">{errors.roomType}</span>}
          </div>

          {/* Check-in Date */}
          <div className="form-group">
            <label htmlFor="checkIn">Check-in Date *</label>
            <input
              type="date"
              id="checkIn"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleInputChange}
              disabled={submissionState === 'loading'}
              className={errors.checkIn ? 'error' : ''}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.checkIn && <span className="error-message">{errors.checkIn}</span>}
          </div>

          {/* Check-out Date */}
          <div className="form-group">
            <label htmlFor="checkOut">Check-out Date *</label>
            <input
              type="date"
              id="checkOut"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleInputChange}
              disabled={submissionState === 'loading'}
              className={errors.checkOut ? 'error' : ''}
              min={formData.checkIn || new Date().toISOString().split('T')[0]}
            />
            {errors.checkOut && <span className="error-message">{errors.checkOut}</span>}
          </div>

          {/* Number of Guests */}
          <div className="form-group">
            <label htmlFor="guests">Number of Guests *</label>
            <input
              type="number"
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleInputChange}
              disabled={submissionState === 'loading'}
              className={errors.guests ? 'error' : ''}
              min="1"
              max="10"
            />
            {errors.guests && <span className="error-message">{errors.guests}</span>}
          </div>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={submissionState === 'loading'}
              className={errors.name ? 'error' : ''}
              placeholder="John Doe"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={submissionState === 'loading'}
              className={errors.email ? 'error' : ''}
              placeholder="john.doe@example.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={submissionState === 'loading'}
              className={errors.phone ? 'error' : ''}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          {/* Special Requests */}
          <div className="form-group">
            <label htmlFor="specialRequests">Special Requests (Optional)</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              disabled={submissionState === 'loading'}
              rows={4}
              placeholder="Any special requirements or requests..."
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={submissionState === 'loading'}
              className="btn btn-primary"
            >
              {submissionState === 'loading' ? 'Processing...' : 'Book Now'}
            </button>
          </div>

          {/* Loading Indicator */}
          {submissionState === 'loading' && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Processing your booking...</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default RoomBookingForm;
