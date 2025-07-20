import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ApolloProvider } from '@apollo/client';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { apolloClient } from '@/src/api/apollo-client';
import { useAuth } from '@/src/hooks/useAuth';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/state/authStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initializeAuth } = useAuth();
  const { isAuthenticated, isAuthInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!loaded || !isAuthInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // User is authenticated but in auth group, redirect to tabs
      setTimeout(() => router.replace('/(tabs)'), 0);
    } else if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth group, redirect to login
      setTimeout(() => router.replace('/(auth)/login'), 0);
    }
  }, [isAuthenticated, segments, loaded, isAuthInitialized, router]);

  return (
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
  );
}
