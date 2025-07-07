# Environment Setup

This app requires Supabase configuration for image uploads and authentication.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Getting Supabase Credentials

1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to Settings > API in your Supabase dashboard
3. Copy the "Project URL" and "anon public" key
4. Replace the placeholder values in your `.env` file

## Supabase Storage Setup

For image uploads to work, you need to:

1. Create a storage bucket named `images` in your Supabase project
2. Set the bucket's privacy settings to allow authenticated uploads
3. Configure CORS policies if needed

## GraphQL API

The app also requires a GraphQL API endpoint. Make sure your backend API is running and accessible. 

## Important Note on Android Redirect URIs

When setting up Google OAuth for Android, the redirect URI scheme is directly tied to the `android.package` name in your `app.config.js`. The `AuthSession.makeRedirectUri` call in `src/hooks/useAuth.ts` must use this package name as the scheme. For example, if your package name is `com.planttracker`, the scheme should also be `com.planttracker`.

### 5. Start the Application

```bash
npm start
``` 