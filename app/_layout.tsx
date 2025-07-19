import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ApolloProvider } from '@apollo/client';

import { useColorScheme } from '@/hooks/useColorScheme';
import { apolloClient } from '@/src/api/apollo-client';
import { useAuth } from '@/src/hooks/useAuth';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/state/authStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initializeAuth } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!loaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && !inAuthGroup) {
      router.replace('/(tabs)/');
    } else if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments, loaded]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ApolloProvider>
  );
}
