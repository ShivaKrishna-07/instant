import axios from 'axios';
import { getSession } from 'next-auth/react';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/api`,
  timeout: 10000,
});

// Request interceptor to attach NextAuth session token
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      // Try to get token from NextAuth session
      try {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (error) {
        console.error('Failed to get session:', error);
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
    
    // Handle 401 errors - redirect to login
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear storage and redirect to login
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/onboarding') {
          localStorage.clear();
          try {
            // Use NextAuth signOut
            const { signOut } = await import('next-auth/react');
            await signOut({ redirect: false });
            window.location.replace('/login');
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