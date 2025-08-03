import { useState, useCallback } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../state/authStore';
import { supabase } from '../api/supabase';
import Constants from 'expo-constants';

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
  iosClientId: Constants.expoConfig?.extra?.EXPO_PUBLIC_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
});

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
        console.log('useAuth: Restoring session for user:', user.email);
        setToken(storedToken, user);
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

  return {
    signInWithGoogle,
    signOut,
    initializeAuth,
    isLoading,
    error,
    isAuthenticated,
  };
};
