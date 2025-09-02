const getEnvVars = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    EXPO_PUBLIC_GRAPHQL_URL: process.env.EXPO_PUBLIC_GRAPHQL_URL,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    APP_ENV: isProduction ? 'production' : 'development'
  };
};

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
      ...getEnvVars(),
      eas: {
        projectId: "51b53275-8950-4214-a50a-f645384abc10",
        owner: "nadavroz"
      }
    },
    plugins: [
      [
        "@react-native-google-signin/google-signin",
        {
          "webClientId": "788884586325-uc212icuhtv5vqg5bq2e3va8oa35j40g.apps.googleusercontent.com",
          "googleServicesFile": "./google-services.json"
        }
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics",
      "expo-background-fetch",
      "expo-task-manager",
      "expo-router"
    ]
  }
};