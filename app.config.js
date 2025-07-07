require('dotenv').config();

export default {
  expo: {
    name: "Plant Tracker",
    slug: "plant-tracker-app",
    owner: "nadavroz",
    scheme: "com.planttracker",
    version: "1.0.0",
    orientation: "portrait",
    android: {
      package: "com.planttracker",
      googleServicesFile: "./google-services.json",
      config: {
        googleSignIn: {
          apiKey: process.env.GOOGLE_SIGN_IN_API_KEY
        }
      }
    },
    ios: {
      bundleIdentifier: "com.planttracker",
      googleServicesFile: "./GoogleService-Info.plist"
    },
    extra: {
      eas: {
        projectId: "51b53275-8950-4214-a50a-f645384abc10",
        owner: "nadavroz"
      },
      owner: "nadavroz",
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_GRAPHQL_URL: process.env.EXPO_PUBLIC_GRAPHQL_URL,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    },
    plugins: [
      "@react-native-google-signin/google-signin",
      "expo-router"
    ]
  }
};