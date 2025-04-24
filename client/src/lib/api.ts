
import axios from 'axios';

// Base URL for API
const API_URL = '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for adding auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth token in response
apiClient.interceptors.response.use(
  (response) => {
    // If we get a token in the response, save it
    if (response.data?.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const login = async (username: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// Travel packages API functions
export const getTravelPackages = async () => {
  try {
    const response = await apiClient.get('/travel-packages');
    return response.data;
  } catch (error) {
    console.error('Get travel packages error:', error);
    throw error;
  }
};

export const getTravelPackageById = async (id: string) => {
  try {
    const response = await apiClient.get(`/travel-packages/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Get travel package ${id} error:`, error);
    throw error;
  }
};

// Bookings API functions
export const createBooking = async (bookingData: any) => {
  try {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    const response = await apiClient.get('/bookings/user');
    return response.data;
  } catch (error) {
    console.error('Get user bookings error:', error);
    throw error;
  }
};

// Preferences API functions
export const savePreferences = async (preferencesData: any) => {
  try {
    const response = await apiClient.post('/preferences', preferencesData);
    return response.data;
  } catch (error) {
    console.error('Save preferences error:', error);
    throw error;
  }
};

export const getRecommendations = async (preferenceId: string) => {
  try {
    const response = await apiClient.get(`/recommendations/${preferenceId}`);
    return response.data;
  } catch (error) {
    console.error('Get recommendations error:', error);
    throw error;
  }
};

export default apiClient;
