export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string[];
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  title: string;
  description?: string;
  attendees?: string[];
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface CreateBookingRequest {
  userId: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  title: string;
  description?: string;
  attendees?: string[];
}

export interface CreateBookingResponse {
  success: boolean;
  booking?: Booking;
  error?: string;
}

export interface CancelBookingRequest {
  bookingId: string;
  userId: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface BookingValidationError {
  code: string;
  message: string;
}
