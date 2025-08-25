import { apolloClient } from '../api/apollo-client';
import { PINS_BY_PROJECT_QUERY } from '../api/queries/pinQueries';
import { REMINDERS_BY_PLANT_QUERY } from '../api/queries/reminderQueries';

/**
 * Development-only helpers to quickly verify backend connectivity
 * and print useful data to console without opening GraphQL playground.
 */
export async function runDevGraphQLDiagnostics(options?: {
  projectId?: string;
  plantId?: string;
}): Promise<void> {
  if (!__DEV__) {
    console.log('🧪 [DEV] Skipping diagnostics (not in dev mode)');
    return;
  }

  console.log('🧪 [DEV] ==========================================');
  console.log('🧪 [DEV] STARTING GRAPHQL DIAGNOSTICS');
  console.log('🧪 [DEV] ==========================================');
  console.log('🧪 [DEV] Options:', JSON.stringify(options, null, 2));
  console.log('🧪 [DEV] Apollo Client ready state:', apolloClient.cache.extract() ? 'READY' : 'NOT_READY');

  try {
    // Test basic connectivity first
    console.log('🧪 [DEV] Testing basic GraphQL connectivity...');
    
    if (options?.projectId) {
      console.log('🧪 [DEV] Querying pinsByProject for project:', options.projectId);
      console.log('🧪 [DEV] Using query:', PINS_BY_PROJECT_QUERY.loc?.source.body);
      
      const pinsResult = await apolloClient.query({
        query: PINS_BY_PROJECT_QUERY,
        variables: { projectId: options.projectId },
        fetchPolicy: 'network-only', // Force network request
      });
      
      console.log('🧪 [DEV] ✅ pinsByProject SUCCESS!');
      console.log('🧪 [DEV] Result:', JSON.stringify(pinsResult.data, null, 2));
      
      // If we got pins and no plantId was provided, use the first pin
      if (pinsResult.data?.pinsByProject?.length > 0 && !options.plantId) {
        const firstPin = pinsResult.data.pinsByProject[0];
        console.log('🧪 [DEV] Using first pin for reminders query:', firstPin.id);
        
        console.log('🧪 [DEV] Querying remindersByPlant for plant:', firstPin.id);
        console.log('🧪 [DEV] Using query:', REMINDERS_BY_PLANT_QUERY.loc?.source.body);
        
        const remindersResult = await apolloClient.query({
          query: REMINDERS_BY_PLANT_QUERY,
          variables: { plantId: firstPin.id },
          fetchPolicy: 'network-only',
        });
        
        console.log('🧪 [DEV] ✅ remindersByPlant SUCCESS!');
        console.log('🧪 [DEV] Result:', JSON.stringify(remindersResult.data, null, 2));
      }
    } else {
      console.log('🧪 [DEV] No projectId provided, skipping pins query');
    }
    
  } catch (error) {
    console.error('🧪 [DEV] ❌ GraphQL diagnostics FAILED!');
    console.error('🧪 [DEV] Error type:', error.constructor.name);
    console.error('🧪 [DEV] Error message:', error.message);
    console.error('🧪 [DEV] Full error:', JSON.stringify(error, null, 2));
    
    // Check if it's a network error
    if (error.networkError) {
      console.error('🧪 [DEV] Network error details:', error.networkError);
    }
    
    // Check if it's a GraphQL error
    if (error.graphQLErrors) {
      console.error('🧪 [DEV] GraphQL errors:', error.graphQLErrors);
    }
  }
  
  console.log('🧪 [DEV] ==========================================');
  console.log('🧪 [DEV] GRAPHQL DIAGNOSTICS COMPLETED');
  console.log('🧪 [DEV] ==========================================');
}


