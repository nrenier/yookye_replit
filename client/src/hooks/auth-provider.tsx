import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { login, getUser, logout as apiLogout } from '@/lib/api';

// Define the shape of the user object
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

// Create the context with an initial undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (isAuthenticated()) { // isAuthenticated function needs to be defined elsewhere and imported
        try {
          const userData = await getUser();
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
          console.error('Errore durante la verifica dell\'autenticazione:', error);
          // In caso di errore, rimuoviamo il token non valido
          await apiLogout(); // using apiLogout from import
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const loginUser = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await login(username, password);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Errore durante il login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logoutUser = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Value to be provided by the context
  const value = {
    user,
    isLoading,
    login: loginUser,
    logout: logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Placeholder for isAuthenticated - needs to be implemented elsewhere and imported.
const isAuthenticated = () => {
    // Implement your authentication check here.  e.g., check for a token in local storage.
    return false; //Replace with your actual authentication logic
};