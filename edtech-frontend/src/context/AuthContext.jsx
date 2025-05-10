import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuthTokenHandler } from '../services/api'


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    accessToken: null,
    isLoading: false,
    authChecked: false,
    error: null // Added error state
  });

  const isMounted = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();
  const initialized = useRef(false);
  const retryCount = useRef(0); // Track retry attempts

  // Stable API instance
  const api = useRef(
    axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      withCredentials: true
    })
  ).current;

  useEffect(() => {
    setAuthTokenHandler({
      getAccessToken: () => {
        // Return the current token from your auth state
        return localStorage.getItem('accessToken') || null;
      }
    });
  }, []);

  // Safe state updater
  const updateAuth = useCallback((updates) => {
    if (isMounted.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Handle auth success
  const handleAuthSuccess = useCallback(async ({ access, refresh, user }) => {
    if (!isMounted.current) return;

    const userData = {
      ...user,
      initials: (user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()
    };

    localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(userData));

    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    retryCount.current = 0; // Reset retry counter on success

    try {
      await api.post('/auth/verify/', { token: access });
      updateAuth({
        user: userData,
        accessToken: access,
        authChecked: true,
        isLoading: false,
        error: null
      });
      
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      if (isMounted.current) {
        updateAuth({ 
          isLoading: false,
          error: 'Session verification failed'
        });
      }
      throw error;
    }
  }, [api, navigate, updateAuth, location.state]);

  // Register function
  const register = async (userData) => {
    if (!isMounted.current) return;
    
    try {
      updateAuth({ isLoading: true, error: null });
      const { data } = await api.post('/auth/register/', userData);
      await handleAuthSuccess(data);
      return data;
    } catch (error) {
      if (isMounted.current) {
        updateAuth({ 
          isLoading: false,
          error: error.response?.data?.detail || 'Registration failed'
        });
      }
      throw error;
    }
  };

  // Login function with 401 handling
  const login = async (credentials) => {
    if (!isMounted.current) return;
    
    try {
      updateAuth({ isLoading: true, error: null });
      const { data } = await api.post('/auth/login/', credentials);
      await handleAuthSuccess(data);
    } catch (error) {
      if (isMounted.current) {
        const errorMessage = error.response?.status === 401
          ? 'Invalid email or password'
          : error.response?.data?.detail || 'Login failed';
        
        updateAuth({ 
          isLoading: false,
          error: errorMessage
        });
      }
      throw error;
    }
  };

  // Logout function
  const logout = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      updateAuth({ isLoading: true });
      try {
        await api.post('/auth/logout/');
      } catch (e) {
        console.warn('Logout API error:', e);
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      retryCount.current = 0; // Reset retry counter

      updateAuth({
        user: null,
        accessToken: null,
        isLoading: false,
        authChecked: true,
        error: null
      });

      navigate('/login');
    } catch (error) {
      if (isMounted.current) {
        updateAuth({ isLoading: false });
      }
    }
  }, [api, navigate, updateAuth]);

  // Initial auth check with retry limit
  const checkAuth = useCallback(async () => {
    if (!isMounted.current || initialized.current) return;
    initialized.current = true;

    const accessToken = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!accessToken || !user) {
      return updateAuth({ 
        user: null, 
        accessToken: null, 
        authChecked: true, 
        isLoading: false 
      });
    }

    try {
      updateAuth({ isLoading: true });
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      await api.post('/auth/verify/', { token: accessToken });
      
      updateAuth({
        user: {
          ...user,
          initials: (user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()
        },
        accessToken,
        authChecked: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      if (isMounted.current) {
        await logout();
      }
    }
  }, [api, updateAuth, logout]);

  // Response interceptor with retry limits
  useEffect(() => {
    isMounted.current = true;
    checkAuth();

    const interceptor = api.interceptors.response.use(
      response => response,
      async error => {
        if (!isMounted.current) return Promise.reject(error);

        const originalRequest = error.config;
        
        // Only handle 401 errors and limit retries
        if (error.response?.status === 401 && !originalRequest._retry && retryCount.current < 3) {
          originalRequest._retry = true;
          retryCount.current += 1;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('No refresh token');
            
            const { data } = await api.post('/auth/token/refresh/', { 
              refresh: refreshToken 
            });
            
            localStorage.setItem('accessToken', data.access);
            originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
            return api(originalRequest);
          } catch (refreshError) {
            if (isMounted.current) {
              await logout();
            }
            return Promise.reject(refreshError);
          }
        }
        
        // Clear error if max retries reached
        if (retryCount.current >= 3) {
          updateAuth({ error: 'Session expired. Please login again.' });
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      isMounted.current = false;
      api.interceptors.response.eject(interceptor);
    };
  }, [api, checkAuth, logout, updateAuth]);

  return (
    <AuthContext.Provider value={{
      ...state,
      isAuthenticated: !!state.user,
      api,
      login,
      logout,
      register,
      clearError: () => updateAuth({ error: null }) // Method to clear errors
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};