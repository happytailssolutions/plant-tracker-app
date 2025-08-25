import "react-native-gesture-handler";
import { ExpoRoot } from "expo-router";
import { useEffect } from 'react';
import { runDevGraphQLDiagnostics } from './src/services/appInitializationService.dev';

export default function App() {
  useEffect(() => {
    // Development-only diagnostics to avoid noise in production
    if (__DEV__) {
      // Provide a known projectId from your logs to get pins, or leave undefined to skip
      // If provided and pins are found, the first pin id will be used for reminders query
      runDevGraphQLDiagnostics({
        projectId: '1d15873a-1770-4747-b3b2-6b0bab86b999',
      });
    }
  }, []);

  return <ExpoRoot />;
} 