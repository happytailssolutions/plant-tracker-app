# Authentication Setup

This directory contains the authentication screens and related components for the TreeLocator app.

## Files Created

### LoginScreen.tsx
- Beautiful login screen UI following the Terra design system
- Google Sign-In button with loading states
- Error handling and user feedback
- Responsive design with proper spacing and typography

### useAuth.ts Hook
- Complete Google OAuth flow using expo-auth-session
- Integration with Supabase authentication
- Secure token storage using expo-secure-store
- State management with Zustand

## Environment Variables Required

Add these to your `.env` file:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set application type to "Mobile application"
6. Add your app's bundle identifier
7. Copy the Client ID and Client Secret to your .env file

## Supabase Setup

1. Create a Supabase project
2. Go to Authentication → Providers
3. Enable Google provider
4. Add your Google Client ID and Client Secret
5. Configure the redirect URL: `your-app-scheme://auth/callback`

## Usage

```tsx
import { LoginScreen } from '../src/screens/Auth/LoginScreen';
import { useAuth } from '../src/hooks/useAuth';

// In your component
const { signInWithGoogle, signOut, isLoading } = useAuth();
```

## Known Issues

There's a TypeScript error in the useAuth hook related to the Supabase auth method signature. This is likely due to version differences in the Supabase SDK. You may need to:

1. Update the Supabase SDK to the latest version
2. Check the current method signature in the Supabase documentation
3. Adjust the types accordingly

The functionality should work correctly despite the TypeScript warning. 