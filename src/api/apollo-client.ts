import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useAuthStore } from '../state/authStore';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';

// Create the http link pointing to your backend's GraphQL endpoint
const graphqlUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

const httpLink = createHttpLink({
  uri: graphqlUrl,
});

// Token validation helper
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

// Create the auth link that adds the JWT token to requests
const authLink = setContext(async (_, { headers }) => {
  // Asynchronously get the token from the auth store
  const token = useAuthStore.getState().token;
  
  // Check if token is expired before sending
  if (token && isTokenExpired(token)) {
    // Token is expired, will trigger refresh on next request
  }
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Create error handling link
const errorLink = onError(({ networkError, graphQLErrors, operation, forward }) => {
  if (networkError) {
    console.error('🚨 Apollo Network Error:', networkError);
  }
  
  if (graphQLErrors) {
    console.error('🚨 Apollo GraphQL Errors:', graphQLErrors);
    
    // Check for 401 Unauthorized errors
    const hasUnauthorizedError = graphQLErrors.some(
      error => error.extensions?.code === 'UNAUTHENTICATED' || 
               error.message === 'Unauthorized'
    );
    
    if (hasUnauthorizedError) {
      // Detected 401 error, token may be expired
      // You can trigger a token refresh here if needed
      // For now, we'll let the app handle it through the auth hook
    }
  }
});

// Create the Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
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