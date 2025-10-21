import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Integrates AWS Amplify authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Fetch the current AWS Amplify session
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (token) {
        // Attach the JWT token from Cognito to the Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // If no session exists, continue without token
      console.warn('No active Amplify session found:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handles authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - redirecting to login');
      
      // Redirect to login page
      // In a React SPA, consider using react-router's navigate instead
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;