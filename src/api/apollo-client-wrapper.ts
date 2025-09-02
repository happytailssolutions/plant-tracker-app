import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { logger } from '../utils/logger';

const httpLink = new HttpLink({
  uri: process.env.EXPO_PUBLIC_GRAPHQL_URL
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
      
      logger.logError(new Error(message), `GraphQL Error: ${JSON.stringify(errorInfo)}`);
    });
  }

  if (networkError) {
    logger.logError(networkError, `Network Error for operation: ${operation.operationName}`);
  }
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});
