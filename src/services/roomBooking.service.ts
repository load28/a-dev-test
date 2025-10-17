import apiClient from '../config/apiClient';

export interface RoomBookingRequest {
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface RoomBookingResponse {
  id: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

class RoomBookingService {
  private readonly endpoint = '/bookings';

  async createBooking(data: RoomBookingRequest): Promise<RoomBookingResponse> {
    try {
      const response = await apiClient.post<RoomBookingResponse>(this.endpoint, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to create booking',
          code: error.response.data.code,
          details: error.response.data.details,
        } as ApiError;
      }
      throw {
        message: error.message || 'An unexpected error occurred',
      } as ApiError;
    }
  }

  async getBooking(id: string): Promise<RoomBookingResponse> {
    try {
      const response = await apiClient.get<RoomBookingResponse>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to get booking',
          code: error.response.data.code,
        } as ApiError;
      }
      throw {
        message: error.message || 'An unexpected error occurred',
      } as ApiError;
    }
  }

  async cancelBooking(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to cancel booking',
          code: error.response.data.code,
        } as ApiError;
      }
      throw {
        message: error.message || 'An unexpected error occurred',
      } as ApiError;
    }
  }
}

export const roomBookingService = new RoomBookingService();
