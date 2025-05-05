import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    accessToken: null,
    isLoading: true, // Start with loading true
    authChecked: false
  });

  const isMounted = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Stable API instance with CSRF handling
  const api = useRef(
    axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  ).current;

  // Safe state updater
  const updateAuth = useCallback((updates) => {
    if (isMounted.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Handle auth success - simplified and more robust
  const handleAuthSuccess = useCallback(async (authData) => {
    if (!isMounted.current) return;

    const { access, refresh, user } = authData;
    if (!access) {
      throw new Error('Authentication failed: No access token received');
    }

    const userData = {
      ...user,
      initials: (user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()
    };

    // Store tokens and user data
    localStorage.setItem('accessToken', access);
    if (refresh) {
      localStorage.setItem('refreshToken', refresh);
    }
    localStorage.setItem('user', JSON.stringify(userData));

    // Set default auth header
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    updateAuth({
      user: userData,
      accessToken: access,
      authChecked: true,
      isLoading: false
    });

    // Navigate after state update
    navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  }, [api, navigate, updateAuth, location.state]);

  // Register function
  const register = async (userData) => {
    if (!isMounted.current) return;
    
    try {
      updateAuth({ isLoading: true });
      const { data } = await api.post('/auth/register/', userData);
      await handleAuthSuccess(data);
      return data;
    } catch (error) {
      updateAuth({ isLoading: false });
      throw error;
    }
  };

  // Login function - more robust with error handling
  const login = async (credentials) => {
    if (!isMounted.current) return;
    
    try {
      updateAuth({ isLoading: true });
      
      // Clear previous tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];

      const { data } = await api.post('/auth/login/', credentials);
      
      if (!data.access) {
        throw new Error('Login failed: No access token in response');
      }

      await handleAuthSuccess(data);
      return data;
    } catch (error) {
      // Clean up on failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      updateAuth({
        user: null,
        accessToken: null,
        isLoading: false,
        authChecked: true
      });

      throw error;
    }
  };

  // Logout function - more resilient
  const logout = useCallback(async () => {
    try {
      // Get the refresh token before we remove it
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Clear frontend state immediately
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      updateAuth({
        user: null,
        accessToken: null,
        isLoading: false,
        authChecked: true
      });
  
      // Only attempt backend logout if we have a refresh token
      if (refreshToken) {
        try {
          await api.post('/auth/logout/', { refresh: refreshToken });
        } catch (err) {
          console.warn('Logout API error:', err);
          // Even if backend logout fails, continue with frontend logout
        }
      }
  
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure we always clear local state even if something fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      navigate('/login');
    }
  }, [api, navigate, updateAuth]);

  // Initial auth check - simplified
  const checkAuth = useCallback(async () => {
    if (!isMounted.current || state.authChecked) return;

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
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Simple verification request
      await api.get('/auth/check/');
      
      updateAuth({
        user: user,
        accessToken: accessToken,
        authChecked: true,
        isLoading: false
      });
    } catch (error) {
      // If verification fails, logout
      await logout();
    }
  }, [api, logout, state.authChecked, updateAuth]);

  // Response interceptor for token refresh
  const setupInterceptors = useCallback(() => {
    return api.interceptors.response.use(
      response => response,
      async error => {
        if (!isMounted.current) return Promise.reject(error);

        const originalRequest = error.config;
        
        // Skip interception for auth endpoints
        if (originalRequest.url.includes('/auth/')) {
          return Promise.reject(error);
        }
        
        // Handle 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            await logout();
            return Promise.reject(new Error('Session expired'));
          }
          
          try {
            const { data } = await api.post('/auth/token/refresh/', { 
              refresh: refreshToken 
            });
            
            if (!data.access) {
              throw new Error('Invalid refresh response');
            }
            
            localStorage.setItem('accessToken', data.access);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
            originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
            
            return api(originalRequest);
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }, [api, logout]);

  // Setup and cleanup
  useEffect(() => {
    isMounted.current = true;
    
    // Initial auth check
    checkAuth();
    
    // Setup interceptors
    const interceptor = setupInterceptors();

    return () => {
      isMounted.current = false;
      api.interceptors.response.eject(interceptor);
    };
  }, [api, checkAuth, setupInterceptors]);

  // Render loading state while initializing
  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      isAuthenticated: !!state.user,
      api,
      login,
      logout,
      register,
      updateAuth
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