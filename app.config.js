if (process.env.EAS_BUILD !== 'true') {
  require('dotenv').config();
}

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
      usesCleartextTraffic: true,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
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
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
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
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#4CAF50",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ],
      "expo-background-fetch",
      "expo-task-manager",
      "expo-router"
    ]
  }
};
