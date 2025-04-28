import axios from 'axios';

// Base URL for internal API
const API_URL = '/api';

// Base URL for external REST API (from .env)
const REST_API_URL = import.meta.env.VITE_REST_API_URL;

const REST_API_USERNAME = import.meta.env.VITE_REST_API_USERNAME;
const REST_API_PASSWORD = import.meta.env.VITE_REST_API_PASSWORD;

// Create axios instance for internal API
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for external REST API
const restApiClient = axios.create({
  baseURL: REST_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// External API auth token storage
let externalAuthToken: string | null = null;

// Get auth token for external API
const getExternalAuthToken = async (): Promise<string> => {
  if (externalAuthToken) {
    return externalAuthToken;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('username', REST_API_USERNAME);
    formData.append('password', REST_API_PASSWORD);

    const response = await axios.post(`${REST_API_URL}/api/auth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.access_token) {
      externalAuthToken = response.data.access_token;
      // Store refresh token for later use
      if (response.data.refresh_token) {
        localStorage.setItem('ext_refresh_token', response.data.refresh_token);
      }
      return externalAuthToken;
    } else {
      throw new Error('Token non ricevuto');
    }
  } catch (error) {
    console.error('Errore autenticazione API esterna:', error);
    throw new Error('Impossibile autenticarsi con il servizio esterno');
  }
};

// External API interceptor to add token
restApiClient.interceptors.request.use(
  async (config) => {
    const token = await getExternalAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle external API 401 errors
restApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token to force re-authentication
      externalAuthToken = null;
      // Try the request again
      const originalRequest = error.config;
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        const token = await getExternalAuthToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return restApiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// Interceptor for adding auth token to internal requests
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

// Handle internal auth token in response
apiClient.interceptors.response.use(
  (response) => {
    // If we get a token in the response, save it
    if (response.data?.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      if (response.data?.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      console.log('Errore 401: Token non valido o sessione scaduta');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      // Puoi aggiungere un reindirizzamento alla pagina di login se necessario
      // window.location.href = '/login';
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
    // Verifica se c'è un token prima di fare la richiesta
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('Nessun token disponibile per getUser');
      throw new Error('No auth token available');
    }
    
    const response = await apiClient.get('/auth/me');
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.error('Risposta HTML ricevuta invece di JSON:', response.data.substring(0, 100) + '...');
      throw new Error('Invalid JSON response (HTML received)');
    }
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

// External API search functions
export const searchAccommodations = async (searchData: any) => {
  try {
    const response = await restApiClient.post('/api/search', searchData);
    return response.data;
  } catch (error) {
    console.error('Search accommodations error:', error);
    throw error;
  }
};

export const getJobStatus = async (jobId: string) => {
  try {
    const response = await restApiClient.get(`/api/search/${jobId}`);
    return response.data;
  } catch (error) {
    console.error(`Get job status for ${jobId} error:`, error);
    throw error;
  }
};

export const getJobResult = async (jobId: string) => {
  try {
    const response = await restApiClient.get(`/api/search/${jobId}/result`);
    return response.data;
  } catch (error) {
    console.error(`Get job result for ${jobId} error:`, error);
    throw error;
  }
};

export default apiClient;