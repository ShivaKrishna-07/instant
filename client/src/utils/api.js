import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true, // send cookies
});

// Redirect to login when the server returns 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        // Emit a global event so app can perform client-side navigation
        try { window.dispatchEvent(new CustomEvent('api:unauthorized')); } catch (e) { window.location.replace('/login'); }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;