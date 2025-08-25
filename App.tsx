import "react-native-gesture-handler";
import { ExpoRoot } from "expo-router";
import { useEffect } from 'react';
import { runDevGraphQLDiagnostics } from './src/services/appInitializationService.dev';

export default function App() {
  useEffect(() => {
    // Development-only diagnostics to avoid noise in production
    if (__DEV__) {
      console.log('🧪 [DEV] App.tsx: useEffect triggered, setting up diagnostics...');
      console.log('🧪 [DEV] App.tsx: Frontend version check - should match backend');
      
      // Wait a bit for Apollo Client and auth to be ready
      const timer = setTimeout(() => {
        console.log('🧪 [DEV] App.tsx: Starting delayed diagnostics...');
        try {
          runDevGraphQLDiagnostics({
            projectId: '1d15873a-1770-4747-b3b2-6b0bab86b999',
          });
        } catch (error) {
          console.error('🧪 [DEV] App.tsx: Error running diagnostics:', error);
        }
      }, 5000); // Increased to 5 seconds

      // Don't clear the timer immediately
      return () => {
        console.log('🧪 [DEV] App.tsx: Component unmounting, clearing timer...');
        clearTimeout(timer);
      };
    } else {
      console.log('🧪 [DEV] App.tsx: Not in dev mode, skipping diagnostics');
    }
  }, []);

  return <ExpoRoot />;
} 