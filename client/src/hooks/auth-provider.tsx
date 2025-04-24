
import { createContext, useState, useEffect, ReactNode } from 'react';
import { login, getUser } from '@/lib/api';

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
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const userData = await getUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
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
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logoutUser = async () => {
    setIsLoading(true);
    try {
      // Implement your logout logic here
      setUser(null);
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
