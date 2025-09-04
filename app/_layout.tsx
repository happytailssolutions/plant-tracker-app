import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ApolloProvider } from '@apollo/client';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '../hooks/useColorScheme';
import { client as apolloClient } from '../src/api/apollo-client';
import { useAuth } from '../src/hooks/useAuth';
import { useEffect } from 'react';
import { useAuthStore } from '../src/state/authStore';
import { logger } from '../src/utils/logger';
import { analytics } from '../src/utils/analytics';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { setupGlobalErrorHandling } from '../src/utils/errorHandler';
import { initializeFirebase } from '../src/utils/firebaseInit';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initializeAuth } = useAuth();
  const { isAuthenticated, isAuthInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Log font loading status
  useEffect(() => {
    try {
      if (loaded) {
        logger.log('Fonts loaded successfully');
      } else {
        logger.log('Fonts still loading...');
      }
    } catch (error) {
      console.error('Font loading error:', error);
    }
  }, [loaded]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Starting app initialization...');
        
        // Initialize Firebase first
        const firebaseReady = await initializeFirebase();
        console.log('[App] Firebase initialization result:', firebaseReady);
        
        // Setup global error handling
        setupGlobalErrorHandling();
        
        // Initialize logger and log app startup
        await logger.log('App starting up');
        await analytics.trackAppMetrics();
        
        await logger.log('Starting auth initialization');
        await initializeAuth();
        await logger.log('Auth initialization started successfully');
        
        console.log('[App] App initialization completed');
      } catch (error) {
        console.error('[App] Failed to initialize app:', error);
        // Don't call logger.logError here as it might not be initialized yet
      }
    };
    
    initializeApp();
    
    // Cleanup on app exit
    return () => {
      analytics.endSession();
    };
  }, [initializeAuth]);

  useEffect(() => {
    if (!loaded || !isAuthInitialized) return;

    const handleNavigation = async () => {
      const inAuthGroup = segments[0] === '(auth)';
      
      try {
        await logger.log(`Navigation check - isAuthenticated: ${isAuthenticated}, inAuthGroup: ${inAuthGroup}, segments: ${JSON.stringify(segments)}`);
        
        if (isAuthenticated && inAuthGroup) {
          // User is authenticated but in auth group, redirect to tabs
          await logger.log('Redirecting authenticated user to tabs');
          setTimeout(() => router.replace('/(tabs)'), 0);
        } else if (!isAuthenticated && !inAuthGroup) {
          // User is not authenticated and not in auth group, redirect to login
          await logger.log('Redirecting unauthenticated user to login');
          setTimeout(() => router.replace('/(auth)/login'), 0);
        }
      } catch (error) {
        console.error('[App] Navigation error:', error);
        // Don't call logger.logError here as it might cause issues
      }
    };
    
    handleNavigation();
  }, [isAuthenticated, segments, loaded, isAuthInitialized, router]);

  return (
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {!loaded || !isAuthInitialized ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          )}
          <StatusBar style="auto" />
        </ThemeProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}


