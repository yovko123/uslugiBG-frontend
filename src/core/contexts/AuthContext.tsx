// src/core/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    sessionWarningTimer?: ReturnType<typeof setTimeout>;
    sessionLogoutTimer?: ReturnType<typeof setTimeout>;
  }
}

// Keep your existing interfaces
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  lastPasswordChange?: string;
  userType: 'provider' | 'customer';
  bio?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  gender?: string;
  dateOfBirth?: Date;
  createdAt?: string;
  language?: string;
  providerProfile?: {
    id: number;
    companyName?: string | null;
    description?: string | null;
  } | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'provider' | 'customer';
  providerProfile?: {
    companyName?: string;
    description?: string;
  };
}

interface TokenPayload {
  userId: number;
  exp: number;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [sessionWarningVisible, setSessionWarningVisible] = useState(false);
  const navigate = useNavigate();

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await axios.post('http://localhost:3005/api/auth/refresh-token', {
        refreshToken
      });

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
    }
  };

  const checkTokenExpiration = (token: string) => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Validate current user session
          const response = await axios.get('http://localhost:3005/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.data.success) {
            handleLogout();
            return;
          }
  
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          startSessionTimer();
        } catch (error) {
          handleLogout();
        }
      }
      setLoading(false);
    };
  
    validateSession();
  }, []);

  useEffect(() => {
    const setupAxiosInterceptors = () => {
      const interceptor = axios.interceptors.response.use(
        response => response,
        async (error) => {
          if (error.response?.status === 401) {
            // Try refresh token first
            const refreshSuccess = await refreshToken();
            if (!refreshSuccess) {
              // Just call logout without any notifications
              handleLogout(false);
              // Single notification for session expiry
              toast.error('Session expired. Please login again.');
            } else {
              // If refresh successful, retry original request
              const token = localStorage.getItem('token');
              if (token && error.config) {
                error.config.headers['Authorization'] = `Bearer ${token}`;
                return axios.request(error.config);
              }
            }
          }
          return Promise.reject(error);
        }
      );
  
      return () => {
        axios.interceptors.response.eject(interceptor);
      };
    };
  
    setupAxiosInterceptors();
  }, []);
  

  const startSessionTimer = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      const warningTime = 2 * 60 * 1000; // 2 minutes warning
  
      // Clear any existing timers
      if (window.sessionWarningTimer) {
        clearTimeout(window.sessionWarningTimer);
      }
      if (window.sessionLogoutTimer) {
        clearTimeout(window.sessionLogoutTimer);
      }
  
      if (timeUntilExpiry <= 0) {
        refreshToken();
        return;
      }
  
      // Warning timer
      if (timeUntilExpiry > warningTime) {
        window.sessionWarningTimer = setTimeout(() => {
          setSessionWarningVisible(true);
        }, timeUntilExpiry - warningTime);
      }
  
      // Refresh timer
      window.sessionLogoutTimer = setTimeout(async () => {
        const success = await refreshToken();
        if (!success) {
          handleLogout();
        }
      }, timeUntilExpiry);
  
    } catch (error) {
      console.error('Timer setup error:', error);
      handleLogout();
    }
  };

  const handleLogout = (showNotification = false) => {
    // Clear all timers if they exist
    if (window.sessionWarningTimer) {
      clearTimeout(window.sessionWarningTimer);
    }
    if (window.sessionLogoutTimer) {
      clearTimeout(window.sessionLogoutTimer);
    }
  
    // Clear all storage and states
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setSessionWarningVisible(false);
  
    // Show notification only for manual logout
    if (showNotification) {
      toast.info('You have been logged out.');
    }
  
    navigate('/login');
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:3005/api/auth/login', {
        email,
        password
      });

      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setUser(user);
        startSessionTimer();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post('http://localhost:3005/api/auth/register', userData);

      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setUser(user);
        startSessionTimer();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const SessionWarningModal = () => {
    if (!sessionWarningVisible) return null;
  
    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Session Expiring Soon</h5>
            </div>
            <div className="modal-body">
              <p>Your session will expire in 2 minutes. Would you like to extend your session?</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-light" 
                onClick={() => {
                  setSessionWarningVisible(false);
                  // Manual logout from warning modal
                  handleLogout(true);
                }}
              >
                Logout
              </button>
              <button 
                className="btn btn-dark" 
                onClick={async () => {
                  const success = await refreshToken();
                  if (success) {
                    setSessionWarningVisible(false);
                    startSessionTimer();
                  } else {
                    // Session expired during refresh attempt
                    handleLogout(false);
                    toast.error('Session expired. Please login again.');
                  }
                }}
              >
                Extend Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout: handleLogout,
        loading
      }}
    >
      {children}
      <SessionWarningModal />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { User, RegisterData };