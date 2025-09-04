import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { logger } from '../utils/logger';
import { analytics } from '../utils/analytics';
import { useAuthStore } from '../state/authStore';
import Constants from 'expo-constants';

const httpLink = new HttpLink({
  uri: Constants.expoConfig?.extra?.EXPO_PUBLIC_GRAPHQL_URL
});

// Authentication link - adds Bearer token to requests
const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().token;
  
  logger.log(`Apollo: Setting auth headers, token present: ${!!token}`);
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      const errorInfo = {
        message,
        locations,
        path,
        operationName: operation.operationName,
      };
      
      analytics.trackGraphQLError(operation.operationName, new Error(message));
    });
  }

  if (networkError) {
    analytics.categorizeError(networkError, `Network Error for operation: ${operation.operationName}`);
  }
});

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});