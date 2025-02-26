import axios from 'axios';
import { ApiResponse } from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'customer' | 'provider';
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const login = async (credentials: LoginCredentials): Promise<ApiResponse<TokenResponse>> => {
  return axios.post(`${apiUrl}/auth/login`, credentials);
};

export const register = async (userData: RegisterData): Promise<ApiResponse<TokenResponse>> => {
  return axios.post(`${apiUrl}/auth/register`, userData);
};

export const refreshToken = async (token: string): Promise<ApiResponse<TokenResponse>> => {
  const response = await axios.post(`${apiUrl}/auth/refresh`, { refreshToken: token });
  return response.data;
};

export const logout = async (): Promise<ApiResponse> => {
  return axios.post(`${apiUrl}/auth/logout`);
};

export default {
  login,
  register,
  refreshToken,
  logout
}; 