import { useState, useCallback } from 'react';
import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../state/authStore';
import { supabase } from '../api/supabase';
import Constants from 'expo-constants';

// Initialize Google Sign-In
GoogleSignin.configure({
  // Your web client ID from Google Cloud Console
  webClientId: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  // Enable offline access
  offlineAccess: true,
  // For iOS only
  iosClientId: Constants.expoConfig?.extra?.EXPO_PUBLIC_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
});

// Debug: Log the configuration values
console.log('GoogleSignin Configuration:');
console.log('webClientId:', Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
console.log('iosClientId:', Constants.expoConfig?.extra?.EXPO_PUBLIC_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_IOS_CLIENT_ID);

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

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
        const user = JSON.parse(storedUserData);
        setToken(storedToken, user);
      } else {
        console.log('useAuth: No stored token or user data.');
        clearAuth();
      }
    } catch (err) {
      console.error('useAuth: Failed to initialize:', err);
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      clearAuth();
    } finally {
      setAuthInitialized(true);
    }
    console.log('useAuth: Auth initialization finished.');
  }, [setToken]);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Sign in with Google
      const { user: googleUser } = await GoogleSignin.signIn();
      
      // Get tokens
      const { accessToken, idToken } = await GoogleSignin.getTokens();
      
      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign-In');
      }

      // Sign in to Supabase with the Google ID token
      const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data.session || !data.user) {
        throw new Error('No session or user data returned from Supabase');
      }

      // Construct user data object
      const userData = {
        id: data.user.id,
        email: data.user.email || googleUser.email || '',
        name: data.user.user_metadata?.full_name || 
              googleUser.name || 
              '',
      };

      // Store authentication data
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.session.access_token);
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
      
      // Update auth store
      setToken(data.session.access_token, userData);

    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      
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
      // Sign out from Google
      await GoogleSignin.signOut();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear stored credentials
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      
      // Clear auth store
      clearAuth();
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError('Failed to sign out completely. Please try again.');
    }
  }, [clearAuth]);

  return {
    signInWithGoogle,
    signOut,
    initializeAuth,
    isLoading,
    error,
    isAuthenticated,
  };
}; 