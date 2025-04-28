import React, { createContext, ReactNode, useContext } from "react";
import { login as apiLogin, logout as apiLogout, getUser } from '@/lib/api';
import { useMutation } from "@tanstack/react-query";

// Define the shape of the user object
export interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loginMutation: any;
  registerMutation: any;
}

// Create the context with a default undefined value
export const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  console.log('AuthProvider rendering');

  React.useEffect(() => {
    // Check if user is already logged in on component mount
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (err) {
        console.error("Authentication check failed:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiLogin(username, password);
      const userData = response.data.user || response.data;
      setUser(userData);
      return userData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Login failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Logout failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mutations per login e registrazione
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return login(credentials.username, credentials.password);
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      // Qui dovrebbe esserci una chiamata API per la registrazione
      // Per ora, facciamo finta di chiamare login dopo una registrazione con successo
      return login(userData.username, userData.password);
    }
  });

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    loginMutation,
    registerMutation
  };

  console.log('AuthContext value:', value);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  console.log('useAuth context from use-auth.tsx:', context); // Log migliorato
  if (!context) {
    console.error("AuthContext not found - AuthProvider might not be wrapping this component");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}