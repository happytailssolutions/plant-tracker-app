import "react-native-gesture-handler";
import { ExpoRoot } from "expo-router";
import { useEffect } from 'react';
import { runDevGraphQLDiagnostics } from './src/services/appInitializationService.dev';

export default function App() {
  useEffect(() => {
    // Development-only diagnostics to avoid noise in production
    if (__DEV__) {
      // Wait a bit for Apollo Client and auth to be ready
      const timer = setTimeout(() => {
        console.log('🧪 [DEV] App.tsx: Starting delayed diagnostics...');
        runDevGraphQLDiagnostics({
          projectId: '1d15873a-1770-4747-b3b2-6b0bab86b999',
        });
      }, 3000); // Wait 3 seconds for everything to initialize

      return () => clearTimeout(timer);
    }
  }, []);

  return <ExpoRoot />;
} 