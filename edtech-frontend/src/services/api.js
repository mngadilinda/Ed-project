import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth token management system
let authTokenHandler = {
  getToken: () => null,
  onUnauthorized: () => {}
};

// Export this function to be called from AuthContext
export const setAuthTokenHandler = (handler) => {
  authTokenHandler = {
    getToken: handler.getToken || (() => null),
    onUnauthorized: handler.onUnauthorized || (() => {})
  };
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Skip auth header for auth routes
    if (config.url.includes('/auth/')) {
      return config;
    }

    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add trailing slash for Django if needed
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
        if (!config.url.endsWith('/')) {
          config.url += '/';
        }
      }
  
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      authTokenHandler.onUnauthorized();
    }

    // Format consistent error response
    const formattedError = {
      message: error.response?.data?.message || 
              error.message || 
              'An unexpected error occurred',
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    };

    console.error('API Error:', formattedError);
    return Promise.reject(formattedError);
  }
);

// Content API Service
export const contentAPI = {
  createModule: (moduleData) => api.post('/modules', moduleData),
  
  addTopics: (moduleId, topics) => {
    const formData = new FormData();
    formData.append('moduleId', moduleId);
    formData.append('topics', JSON.stringify(topics.map(t => ({ name: t.name }))));
    
    topics.forEach((topic, index) => {
      topic.materials.forEach(file => {
        formData.append(`topic_${index}_files`, file);
      });
    });

    return api.post('/topics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  addAssessments: (moduleId, assessments) => 
    api.post('/assessments', { moduleId, assessments }),

  completeUpload: (moduleId) => 
    api.patch(`/modules/${moduleId}/`, { is_completed: true }),

  getModules: () => api.get('/modules'),
  getModule: (moduleId) => api.get(`/modules/${moduleId}`),
  deleteModule: (moduleId) => api.delete(`/modules/${moduleId}`)
};

// Auth API Service
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout')
};

export default api;