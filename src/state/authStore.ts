import { create } from 'zustand';

// Types for authentication state
interface User {
  id: string;
  email: string;
  name?: string;
  // Add more user properties as needed
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isAuthInitialized: boolean;
  
  // Actions
  setToken: (token: string, user?: User) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setAuthInitialized: (isInitialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  token: null,
  isAuthInitialized: false,
  
  // Actions
  setToken: (token: string, user?: User) => 
    set((state) => ({
      token,
      isAuthenticated: true,
      user: user || state.user,
    })),
    
  clearAuth: () => 
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    }),
    
  setUser: (user: User) => 
    set((state) => ({
      user,
      isAuthenticated: !!state.token, // Only authenticated if we have a token
    })),

  setAuthInitialized: (isInitialized: boolean) =>
    set({
      isAuthInitialized: isInitialized,
    }),
})); 