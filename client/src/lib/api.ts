import axios from 'axios';

// URL base dell'API
const API_URL = '/api'; // Utilizza path relativo per chiamare l'API sul server corrente

// Creazione del client axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token di autenticazione salvato in memoria
let authToken: string | null = null;

// Interceptor per aggiungere il token a tutte le richieste
apiClient.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Funzione per effettuare il login
export const login = async (username: string, password: string): Promise<any> => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await apiClient.post('/api/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data && response.data.access_token) {
      authToken = response.data.access_token;
      return await getUser(); // Ritorna i dati dell'utente dopo il login
    }
    throw new Error('Login fallito: token non trovato nella risposta');
  } catch (error) {
    console.error('Errore durante il login:', error);
    throw error;
  }
};

// Funzione per ottenere i dati dell'utente corrente
export const getUser = async (): Promise<any> => {
  try {
    if (!isAuthenticated()) {
      throw new Error('Utente non autenticato');
    }
    
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Errore durante il recupero dei dati utente:', error);
    throw error;
  }
};

// Funzione per verificare se è autenticato
export const isAuthenticated = (): boolean => {
  return !!authToken;
};

// Funzione per eseguire il logout
export const logout = async (): Promise<void> => {
  try {
    if (authToken) {
      await apiClient.post('/api/auth/logout', { refresh_token: authToken });
    }
  } catch (error) {
    console.error('Errore durante il logout:', error);
  } finally {
    authToken = null;
  }
};

// Funzione per inviare i dati del form
export const searchAccommodations = async (formData: any): Promise<any> => {
  try {
    // Assicurarsi di essere autenticati prima di inviare la richiesta
    if (!isAuthenticated()) {
      await login();
    }

    const response = await apiClient.post('/api/search', formData);
    return response.data;
  } catch (error) {
    console.error('Errore durante la ricerca:', error);
    throw error;
  }
};

export default apiClient;