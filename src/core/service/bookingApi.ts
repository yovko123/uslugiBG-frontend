// src/core/service/bookingApi.ts
import api, { ApiResponse } from '../../services/api';

// Define service-related types for frontend
export interface ServiceImage {
  id: number;
  imageUrl: string;
}

export interface ServiceProvider {
  id: number;
  user?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  priceType: 'FIXED' | 'HOURLY';
  rating?: number;
  reviews?: any[];
  serviceImages?: ServiceImage[];
  providerId: number;
  provider?: ServiceProvider;
  bookingType: 'DIRECT' | 'INQUIRY';
}

// Define booking-related types
export interface BookingStatus {
  id: number;
  previousStatus: string;
  newStatus: string;
  changedBy: number;
  changedAt: string;
  reason?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  // Add other relevant customer fields
}

export interface BookingReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  serviceId: number;
  customerId: number;
  bookingDate: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  completedByCustomer: boolean;
  completedByProvider: boolean;
  autoCompletedAt?: string;
  hasDispute: boolean;
  disputeReason?: string;
  disputeStatus?: string;
  disputeResolvedAt?: string;
  reviewEligible: boolean;
  reviewEligibleUntil?: string;
  cancelledBy?: number;
  cancellationReason?: string;
  cancellationTime?: string;
  statusHistory: BookingStatus[];
  service: Service;
  customer: Customer;
  review?: BookingReview;
}

export interface BookingParams {
  status?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'newest' | 'oldest';
}

export interface CompletionRequest {
  completedByCustomer?: boolean;
  completedByProvider?: boolean;
}

export interface DisputeRequest {
  disputeReason: string;
}

export interface CreateBookingRequest {
  serviceId: number;
  bookingDate: string;
  additionalNotes?: string;
  // Add other relevant booking creation fields
}

// Booking API methods
export const bookingApi = {
  // Get all bookings for the current user
  getMyBookings: async (params?: BookingParams): Promise<ApiResponse<Booking[]>> => {
    try {
      const response = await api.get<Booking[]>('/bookings/my-bookings', { params });
      return {
        success: true,
        data: response.data,
        message: 'Bookings retrieved successfully',
      };
    } catch (error) {
      console.error('Error fetching my bookings:', error);
      throw error;
    }
  },

  // Get a specific booking by ID
  getBookingById: async (id: string | number): Promise<ApiResponse<Booking>> => {
    const parsedId = Number(id);
    if (!Number.isSafeInteger(parsedId) || parsedId < 0) {
      throw new Error('Invalid booking ID format');
    }
    try {
      const response = await api.get<Booking>(`/bookings/${parsedId}`);
      return {
        success: true,
        data: response.data,
        message: 'Booking retrieved successfully',
      };
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw error;
    }
  },

  // Create a new booking
  createBooking: async (data: CreateBookingRequest): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.post<Booking>('/bookings', data);
      return {
        success: true,
        data: response.data,
        message: 'Booking created successfully',
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (
    id: string | number,
    status: string,
    reason?: string
  ): Promise<ApiResponse<Booking>> => {
    const parsedId = Number(id);
    if (!Number.isSafeInteger(parsedId) || parsedId < 0) {
      throw new Error('Invalid booking ID format');
    }
    try {
      const response = await api.put<Booking>(`/bookings/${parsedId}/status`, {
        status,
        statusChangeReason: reason,
      });
      return {
        success: true,
        data: response.data,
        message: `Booking status updated to ${status}`,
      };
    } catch (error) {
      console.error(`Error updating booking ${id} status:`, error);
      throw error;
    }
  },

  // Mark booking as completed
  markBookingCompletion: async (
    id: string | number,
    data: CompletionRequest
  ): Promise<ApiResponse<Booking>> => {
    const parsedId = Number(id);
    if (!Number.isSafeInteger(parsedId) || parsedId < 0) {
      throw new Error('Invalid booking ID format');
    }
    try {
      const response = await api.put<Booking>(`/bookings/${parsedId}/complete`, data);
      return {
        success: true,
        data: response.data,
        message: 'Booking completion status updated',
      };
    } catch (error) {
      console.error(`Error marking booking ${id} completion:`, error);
      throw error;
    }
  },

  // Create a dispute for a booking
  createDispute: async (
    id: string | number,
    data: DisputeRequest
  ): Promise<ApiResponse<Booking>> => {
    const parsedId = Number(id);
    if (!Number.isSafeInteger(parsedId) || parsedId < 0) {
      throw new Error('Invalid booking ID format');
    }
    try {
      const response = await api.post<Booking>(`/bookings/${parsedId}/dispute`, data);
      return {
        success: true,
        data: response.data,
        message: 'Dispute created successfully',
      };
    } catch (error) {
      console.error(`Error creating dispute for booking ${id}:`, error);
      throw error;
    }
  },

  // Resolve a dispute
  resolveDispute: async (
    id: string | number,
    resolution: string,
    notes?: string
  ): Promise<ApiResponse<Booking>> => {
    const parsedId = Number(id);
    if (!Number.isSafeInteger(parsedId) || parsedId < 0) {
      throw new Error('Invalid booking ID format');
    }
    try {
      const response = await api.put<Booking>(`/bookings/${parsedId}/resolve-dispute`, {
        resolution,
        resolutionNotes: notes,
      });
      return {
        success: true,
        data: response.data,
        message: 'Dispute resolved successfully',
      };
    } catch (error) {
      console.error(`Error resolving dispute for booking ${id}:`, error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (
    id: string | number,
    reason?: string
  ): Promise<ApiResponse<Booking>> => {
    const parsedId = Number(id);
    if (!Number.isSafeInteger(parsedId) || parsedId < 0) {
      throw new Error('Invalid booking ID format');
    }
    try {
      const response = await api.put<Booking>(`/bookings/${parsedId}/status`, {
        status: 'cancelled',
        statusChangeReason: reason,
      });
      return {
        success: true,
        data: response.data,
        message: 'Booking cancelled successfully',
      };
    } catch (error) {
      console.error(`Error cancelling booking ${id}:`, error);
      throw error;
    }
  },
};

export default bookingApi;