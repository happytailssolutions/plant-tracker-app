import { useState, useCallback, useEffect } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../state/authStore';
import { supabase } from '../api/supabase';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
  iosClientId: Constants.expoConfig?.extra?.EXPO_PUBLIC_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
});

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
    console.log('🔄 Attempting to refresh token...');
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
    
    if (data.session?.access_token) {
      console.log('🔄 Token refreshed successfully');
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
    console.log('useAuth: Starting auth initialization.');
    try {
      const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      console.log('useAuth: Got token from SecureStore:', storedToken ? 'found' : 'not found');
      
      const storedUserData = await SecureStore.getItemAsync(USER_DATA_KEY);
      console.log('useAuth: Got user data from SecureStore:', storedUserData ? 'found' : 'not found');
      
      if (storedToken && storedUserData) {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          console.log('useAuth: Stored token is expired, attempting refresh...');
          const refreshedToken = await refreshToken();
          
          if (refreshedToken) {
            const user = JSON.parse(storedUserData);
            console.log('useAuth: Token refreshed, restoring session for user:', user.email);
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, refreshedToken);
            setToken(refreshedToken, user);
          } else {
            console.log('useAuth: Token refresh failed, clearing auth...');
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_DATA_KEY);
            clearAuth();
          }
        } else {
          const user = JSON.parse(storedUserData);
          console.log('useAuth: Token is valid, restoring session for user:', user.email);
          setToken(storedToken, user);
        }
      } else {
        console.log('useAuth: No stored token or user data.');
        clearAuth();
      }
    } catch (err) {
      console.error('useAuth: Failed to initialize auth from storage:', err);
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      clearAuth();
    } finally {
      setAuthInitialized(true);
      console.log('useAuth: Auth initialization finished.');
    }
  }, [setToken, clearAuth, setAuthInitialized]);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log('useAuth: Starting Google Sign-In process.');
    
    try {
      console.log('useAuth: Checking for Google Play Services.');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('useAuth: Google Play Services are available.');
      
      console.log('useAuth: Initiating Google Sign-In prompt.');
      const { user: googleUser } = await GoogleSignin.signIn();
      console.log('useAuth: Google Sign-In successful. User:', googleUser.email);
      
      console.log('useAuth: Getting tokens from Google.');
      const { idToken } = await GoogleSignin.getTokens();
      
      if (!idToken) {
        console.error('useAuth: Failed to get ID token from Google.');
        throw new Error('Failed to get ID token from Google Sign-In');
      }
      console.log('useAuth: Successfully received ID token from Google.');

      const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
      console.log(`useAuth: Attempting to sign in to Supabase at ${supabaseUrl}`);
      const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (supabaseError) {
        console.error('useAuth: Supabase sign-in error:', JSON.stringify(supabaseError, null, 2));
        throw supabaseError;
      }
      console.log('useAuth: Supabase sign-in successful.');

      if (!data.session || !data.user) {
        console.error('useAuth: No session or user data returned from Supabase.');
        throw new Error('No session or user data returned from Supabase');
      }
      console.log('useAuth: Supabase returned session and user data.');

      const userData = {
        id: data.user.id,
        email: data.user.email || googleUser.email || '',
        name: data.user.user_metadata?.full_name || googleUser.name || '',
      };
      console.log('useAuth: Constructed user data:', userData);

      console.log('useAuth: Storing auth token and user data in SecureStore.');
      console.log('useAuth: Access token type:', typeof data.session.access_token);
      console.log('useAuth: Access token length:', data.session.access_token?.length);
      console.log('useAuth: Access token preview:', data.session.access_token?.substring(0, 20) + '...');
      
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.session.access_token);
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
      console.log('useAuth: Storage successful.');
      
      console.log('useAuth: Updating auth store state.');
      setToken(data.session.access_token, userData);
      console.log('useAuth: Google Sign-In process completed successfully.');

    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      console.error('Full Google Sign-In error object:', JSON.stringify(err, null, 2));
      
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign-in was cancelled');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError('Sign-in is already in progress');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Play Services are not available');
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
      console.log('🔄 No token to refresh');
      return false;
    }
    
    if (isTokenExpired(currentToken)) {
      console.log('🔄 Token is expired, refreshing...');
      const refreshedToken = await refreshToken();
      
      if (refreshedToken) {
        const user = useAuthStore.getState().user;
        if (user) {
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, refreshedToken);
          setToken(refreshedToken, user);
          console.log('🔄 Token refreshed and updated');
          return true;
        }
      } else {
        console.log('🔄 Token refresh failed, signing out...');
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
