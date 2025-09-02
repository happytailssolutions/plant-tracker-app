import Constants from 'expo-constants';

const ENV = {
  development: {
    GRAPHQL_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_GRAPHQL_URL,
    SUPABASE_URL: Constants.expoConfig?.extra?.supabaseUrl,
    SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.supabaseAnonKey,
    GOOGLE_WEB_CLIENT_ID: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    GOOGLE_MAPS_API_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  production: {
    GRAPHQL_URL: 'https://us-central1-plant-tracker-cb1ab.cloudfunctions.net/api/graphql',
    SUPABASE_URL: Constants.expoConfig?.extra?.supabaseUrl,
    SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.supabaseAnonKey,
    GOOGLE_WEB_CLIENT_ID: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    GOOGLE_MAPS_API_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  }
};

export const getEnvironment = () => {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export const config = getEnvironment();
