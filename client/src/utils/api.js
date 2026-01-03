import axios from 'axios';
import { auth } from '@/config/firebase';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to attach token from localStorage
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    
    // Handle 401 errors - try to refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Get fresh Firebase token
          const freshToken = await currentUser.getIdToken(true);
          if (freshToken) {
            localStorage.setItem('authToken', freshToken);
            originalRequest.headers.Authorization = `Bearer ${freshToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // Clear storage and redirect to login
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/onboarding') {
          localStorage.clear();
          try {
            window.dispatchEvent(new CustomEvent('api:unauthorized'));
          } catch (e) {
            window.location.replace('/login');
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;