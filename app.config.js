if (process.env.EAS_BUILD !== 'true') {
  require('dotenv').config();
}

// Add a warning about cleartext traffic for production builds
console.warn(
  'WARNING: The `usesCleartextTraffic` flag is enabled for Android in `app.config.js`. This is insecure and intended for development only. Remember to set this to `false` before creating a production build.'
);

// Debug: log environment variables
console.log('Environment variables check:');
console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

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
      usesCleartextTraffic: true
    },
    ios: {
      bundleIdentifier: "com.planttracker"
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
      EXPO_PUBLIC_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_IOS_CLIENT_ID
    },
    plugins: [
      [
        "@react-native-google-signin/google-signin",
        {
          "webClientId": "788884586325-uc212icuhtv5vqg5bq2e3va8oa35j40g.apps.googleusercontent.com",
          "googleServicesFile": "./google-services.json"
        }
      ],
      "expo-router"
    ]
  }
};
