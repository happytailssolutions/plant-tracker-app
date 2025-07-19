import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useAuthStore } from '../state/authStore';
import Constants from 'expo-constants';

// Create the http link pointing to your backend's GraphQL endpoint
const httpLink = createHttpLink({
  uri: Constants.expoConfig?.extra?.EXPO_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
});

// Create the auth link that adds the JWT token to requests
const authLink = setContext(async (_, { headers }) => {
  // Asynchronously get the token from the auth store
  const token = useAuthStore.getState().token;
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Create the Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Export a function to reset the client cache (useful for logout)
export const resetApolloCache = () => {
  apolloClient.resetStore();
}; 