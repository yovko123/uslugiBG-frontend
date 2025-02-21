// src/core/service/serviceApi.ts
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

export interface ServiceParams {
  keyword?: string;
  categoryId?: string;
  city?: string;
  priceMin?: string;
  priceMax?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

interface ServiceUpdateData {
    isActive?: boolean;
    [key: string]: any;
}

// interface ServiceFilters {
//   categoryId?: string;
//   city?: string;
//   priceMin?: string;
//   priceMax?: string;
//   keyword?: string;
//   page?: number;
//   limit?: number;
//   sortBy?: string;
// }

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

const authAxios = axios.create({
  baseURL: API_URL
});

authAxios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const serviceApi = {
  createService: async (formData: FormData) => {
    const response = await authAxios.post('api/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyServices: async (params?: ServiceParams) => {
    const response = await authAxios.get('api/services/provider', { params });
    return response.data;
  },

  // getAllServices: async (filters?: ServiceFilters) => {
  //   try {
  //     const response = await authAxios.get('/api/services', { 
  //       params: {
  //         ...filters,
  //         isActive: true // We only want active services
  //       }
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching services:', error);
  //     throw error;
  //   }
  // },

  updateService: async (id: number, data: FormData | ServiceUpdateData) => {
    try {
        console.log('Making API request to update service:', id);
        
        // Check if the data is FormData (for full service updates with images)
        if (data instanceof FormData) {
            const response = await authAxios.put(`/api/services/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
            });
            return response.data;
        }
        
        // Handle simple updates (like status changes)
        const response = await authAxios.put(`/api/services/${id}`, data, {
            timeout: 30000,
        });
        return response.data;
    } catch (error) {
        console.error('Service update API error:', error);
        throw error;
    }
  },

  deleteService: async (id: number) => {
    const response = await authAxios.delete(`api/services/${id}`);
    return response.data;
  },
  
  deleteServiceImage: async (imageId: number) => {
    const response = await authAxios.delete(`/api/services/images/${imageId}`);
    return response.data;
  },
  
  getServices: async (params?: {
    keyword?: string;
    categoryId?: string;
    city?: string;
    priceMin?: string;
    priceMax?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) => {
    try {
      const response = await authAxios.get('/api/services', { 
        params: {
          ...params,
          isActive: true // Only fetch active services
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  getService: async (id: number) => {
    const response = await authAxios.get(`api/services/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await authAxios.get('api/categories');
    return response.data;
  }
};