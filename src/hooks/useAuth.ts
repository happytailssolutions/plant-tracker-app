import { useState, useCallback, useEffect } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../state/authStore';
import { supabase } from '../api/supabase';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';
import { analytics } from '../utils/analytics';

// Initialize Google Sign-In
try {
  const webClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_IOS_CLIENT_ID;
  
  if (!webClientId) {
    console.warn('Google Sign-In: webClientId not found in configuration');
  }
  
  GoogleSignin.configure({
    webClientId,
    offlineAccess: true,
    iosClientId,
  });
} catch (error) {
  console.error('Failed to configure Google Sign-In:', error);
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Token validation helper
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

// Token refresh helper
const refreshToken = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
    
    if (data.session?.access_token) {
      return data.session.access_token;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setToken, clearAuth, isAuthenticated, setAuthInitialized } = useAuthStore();

  const initializeAuth = useCallback(async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      
      const storedUserData = await SecureStore.getItemAsync(USER_DATA_KEY);
      
      if (storedToken && storedUserData) {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          const refreshedToken = await refreshToken();
          
          if (refreshedToken) {
            const user = JSON.parse(storedUserData);
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, refreshedToken);
            setToken(refreshedToken, user);
          } else {
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_DATA_KEY);
            clearAuth();
          }
        } else {
          const user = JSON.parse(storedUserData);
          setToken(storedToken, user);
        }
      } else {
        clearAuth();
      }
    } catch (err) {
      console.error('useAuth: Failed to initialize auth from storage:', err);
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      clearAuth();
    } finally {
      setAuthInitialized(true);
    }
  }, [setToken, clearAuth, setAuthInitialized]);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Starting Google Sign-In process...');
      
      // Track authentication attempt
      analytics.trackLoginAttempt('google', true);
      
      // Log configuration
      const webClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      console.log('🔐 Web Client ID configured:', webClientId ? 'Yes' : 'No');
      
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('🔐 Play Services check passed');
      
      const { user: googleUser } = await GoogleSignin.signIn();
      console.log('🔐 Google Sign-In successful, user:', googleUser.email);
      
      const { idToken } = await GoogleSignin.getTokens();
      console.log('🔐 ID Token obtained:', idToken ? 'Yes' : 'No');
      
      if (!idToken) {
        console.error('useAuth: Failed to get ID token from Google.');
        throw new Error('Failed to get ID token from Google Sign-In');
      }

      const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (supabaseError) {
        console.error('useAuth: Supabase sign-in error:', JSON.stringify(supabaseError, null, 2));
        throw supabaseError;
      }

      if (!data.session || !data.user) {
        console.error('useAuth: No session or user data returned from Supabase.');
        throw new Error('No session or user data returned from Supabase');
      }

      const userData = {
        id: data.user.id,
        email: data.user.email || googleUser.email || '',
        name: data.user.user_metadata?.full_name || googleUser.name || '',
      };
      
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.session.access_token);
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
      
      setToken(data.session.access_token, userData);
      
      // Track successful authentication
      analytics.trackAuthEvent('login_completed', true, {
        method: 'google',
        user_id: userData.id,
        user_email: userData.email
      });

    } catch (err: any) {
      console.error('🔐 Google Sign-In error:', err);
      console.error('🔐 Error code:', err.code);
      console.error('🔐 Error message:', err.message);
      console.error('🔐 Full error object:', JSON.stringify(err, null, 2));
      
      // Track failed authentication
      analytics.trackLoginAttempt('google', false, err.code);
      analytics.categorizeError(err, 'Google Sign-In failed');
      
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign-in was cancelled');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError('Sign-in is already in progress');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Play Services are not available');
      } else if (err.code === statusCodes.DEVELOPER_ERROR) {
        console.error('🔐 DEVELOPER_ERROR - This usually means OAuth configuration issue');
        console.error('🔐 Check your Google Cloud Console OAuth configuration');
        setError('Authentication configuration error. Please contact support.');
      } else {
        setError(err.message || 'An unexpected error occurred during sign-in');
      }
    } finally {
      setIsLoading(false);
    }
  }, [setToken]);

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      clearAuth();
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError('Failed to sign out completely. Please try again.');
    }
  }, [clearAuth]);

  // Function to handle token refresh when needed
  const handleTokenRefresh = useCallback(async (): Promise<boolean> => {
    const currentToken = useAuthStore.getState().token;
    
    if (!currentToken) {
      return false;
    }
    
    if (isTokenExpired(currentToken)) {
      const refreshedToken = await refreshToken();
      
      if (refreshedToken) {
        const user = useAuthStore.getState().user;
        if (user) {
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, refreshedToken);
          setToken(refreshedToken, user);
          return true;
        }
      } else {
        await signOut();
        return false;
      }
    }
    
    return true;
  }, [setToken, signOut]);

  return {
    signInWithGoogle,
    signOut,
    initializeAuth,
    handleTokenRefresh,
    isLoading,
    error,
    isAuthenticated,
  };
};
