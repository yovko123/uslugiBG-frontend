//src\core\utils\auth.ts


import axios from 'axios';
import { User } from '../contexts/AuthContext';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Token management
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  delete axios.defaults.headers.common['Authorization'];
};

// User management
export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Combined functions
export const setAuth = (token: string, user: User): void => {
  setAuthToken(token);
  setUser(user);
};

export const clearAuth = (): void => {
  removeAuthToken();
  removeUser();
};

// Helper functions
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getUser();
};

export const getUserType = (): 'provider' | 'customer' | null => {
  const user = getUser();
  return user ? user.userType : null;
};