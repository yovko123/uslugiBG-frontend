// src/core/service/serviceApi.ts
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

interface ServiceParams {
    isActive?: boolean;
    sortBy?: string;
  }

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005/api';

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
    const response = await authAxios.post('/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyServices: async (params?: ServiceParams) => {
    const response = await authAxios.get('/services/provider', { params });
    return response.data;
  },

  updateService: async (id: number, data: any) => {
    const response = await authAxios.put(`/services/${id}`, data);
    return response.data;
  },

  deleteService: async (id: number) => {
    const response = await authAxios.delete(`/services/${id}`);
    return response.data;
  },

//   getServices: async (params?: {
//     categoryId?: string;
//     city?: string;
//     priceMin?: number;
//     priceMax?: number;
//   }) => {
//     const response = await authAxios.get('/services', { params });
//     return response.data;
//   },

getService: async (id: number) => {
    const response = await authAxios.get(`/services/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await authAxios.get('/categories');
    return response.data;
  }
};