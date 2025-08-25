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

  console.log('🧪 [DEV] Starting GraphQL diagnostics...');
  console.log('🧪 [DEV] Options:', options);

  try {

    if (options?.projectId) {
      console.log('🧪 [DEV] Querying pinsByProject for project:', options.projectId);
      const pinsResult = await apolloClient.query({
        query: PINS_BY_PROJECT_QUERY,
        variables: { projectId: options.projectId },
        fetchPolicy: 'no-cache',
      });
      console.log('🧪 [DEV] pinsByProject result:', JSON.stringify(pinsResult.data, null, 2));

      // If we didn't get a plantId but have pins, use the first one's id
      if (!options.plantId && pinsResult.data?.pinsByProject?.length > 0) {
        const firstPinId = pinsResult.data.pinsByProject[0].id;
        console.log('🧪 [DEV] Using first pin id for remindersByPlant:', firstPinId);
        options = { ...options, plantId: firstPinId };
      }
    } else {
      console.log('🧪 [DEV] Skipping pinsByProject (no projectId provided)');
    }

    if (options?.plantId) {
      console.log('🧪 [DEV] Querying remindersByPlant for plant:', options.plantId);
      const remindersResult = await apolloClient.query({
        query: REMINDERS_BY_PLANT_QUERY,
        variables: { plantId: options.plantId },
        fetchPolicy: 'no-cache',
      });
      console.log('🧪 [DEV] remindersByPlant result:', JSON.stringify(remindersResult.data, null, 2));
    } else {
      console.log('🧪 [DEV] Skipping remindersByPlant (no plantId provided)');
    }
  } catch (error) {
    console.error('🧪 [DEV] GraphQL diagnostics error:', error);
    console.error('🧪 [DEV] Error details:', JSON.stringify(error, null, 2));
  }
  
  console.log('🧪 [DEV] GraphQL diagnostics completed');
}


