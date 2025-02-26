import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshTokenValue = localStorage.getItem('refreshToken');
        if (!refreshTokenValue) {
          throw new Error('No refresh token available');
        }
        
        // Direct API call to refresh endpoint instead of using authApi
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken: refreshTokenValue }
        );
        
        if (response.data && response.data.accessToken) {
          // Update tokens in storage
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          // Update the authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${response.data.accessToken}` };
          }
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }
    
    // Format error response consistently
    const errorResponse = {
      success: false,
      message: error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data 
        ? error.response.data.message 
        : 'An error occurred',
      status: error.response?.status || 500,
      data: null
    };
    
    return Promise.reject(errorResponse);
  }
);

// Type for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Secure data sanitization before sending to API
export const sanitizeRequestData = <T>(data: T): T => {
  if (!data) return data;
  
  // If data is a string, sanitize it
  if (typeof data === 'string') {
    return data
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim() as unknown as T;
  }
  
  // If data is an object, recursively sanitize all string properties
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      const value = (sanitized as any)[key];
      if (typeof value === 'string') {
        (sanitized as any)[key] = sanitizeRequestData(value);
      } else if (typeof value === 'object' && value !== null) {
        (sanitized as any)[key] = sanitizeRequestData(value);
      }
    });
    return sanitized;
  }
  
  return data;
};

// Enhanced API methods with data sanitization
export default {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data;
  },
  
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const sanitizedData = sanitizeRequestData(data);
    const response = await api.post<ApiResponse<T>>(url, sanitizedData, config);
    return response.data;
  },
  
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const sanitizedData = sanitizeRequestData(data);
    const response = await api.put<ApiResponse<T>>(url, sanitizedData, config);
    return response.data;
  },
  
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}; 