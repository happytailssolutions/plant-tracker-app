import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client';

import { colors, typography, spacing, components } from '../styles/theme';
import { MY_PROJECTS_QUERY, MyProjectsQueryResponse, Project } from '../api/queries/projectQueries';
import { ProjectListItem } from '../components/projects';
import { CreateProjectModal } from '../components/common';
import { useMapStore } from '../state/mapStore';
import { useAuthStore } from '../state/authStore';
import { logger } from '../utils/logger';

import { useAuth } from '../hooks/useAuth';

export const ProjectsScreen: React.FC = () => {
  const router = useRouter();
  const { selectedProjectId, setSelectedProject } = useMapStore();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { handleTokenRefresh } = useAuth();
  
  // Log screen navigation and test Crashlytics
  useEffect(() => {
    logger.logNavigation('ProjectsScreen');
    logger.log('ProjectsScreen: Component mounted');
    
    // Log current auth state
    const { token, user, isAuthenticated } = useAuthStore.getState();
    logger.log(`ProjectsScreen: Auth state - isAuthenticated: ${isAuthenticated}, hasToken: ${!!token}, user: ${user?.email || 'none'}`);
    logger.setCustomKey('has_token_on_mount', !!token);
    logger.setCustomKey('is_authenticated_on_mount', isAuthenticated);
    
    // Test Crashlytics is working - this will force a test log
    logger.setCustomKey('projects_screen_mounted', true);
    logger.setCustomKey('projects_screen_mount_time', new Date().toISOString());
    
    // Send a test error to verify Crashlytics is working
    const testError = new Error('CRASHLYTICS_TEST: ProjectsScreen mounted - this is a test error to verify logging works');
    logger.logError(testError, 'ProjectsScreen: Crashlytics connectivity test');
    
    // Also test the logger directly
    logger.log('ProjectsScreen: Testing direct Crashlytics logging');
  }, []);
  
  // Log successful render with project data
  useEffect(() => {
    if (data && !loading) {
      const projects = data?.myProjects || [];
      logger.log(`ProjectsScreen: Successfully rendering ${projects.length} projects`);
      logger.setCustomKey('current_projects_count', projects.length);
      
      if (projects.length === 0) {
        logger.log('ProjectsScreen: User has no projects (empty state will be shown)');
      }
    }
  }, [data, loading]);
  
  const { data, loading, error, refetch } = useQuery<MyProjectsQueryResponse>(MY_PROJECTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    onError: async (error) => {
      // Enhanced error logging with Crashlytics
      logger.log('ProjectsScreen: GraphQL query error occurred');
      logger.logGraphQLError('MY_PROJECTS_QUERY', error);
      
      // Log detailed error information
      logger.setCustomKey('error_message', error.message || 'Unknown error');
      logger.setCustomKey('has_network_error', !!error.networkError);
      logger.setCustomKey('has_graphql_errors', !!error.graphQLErrors?.length);
      logger.setCustomKey('graphql_errors_count', error.graphQLErrors?.length || 0);
      
      // Log network error details if present
      if (error.networkError) {
        logger.setCustomKey('network_error_message', error.networkError.message || 'Unknown network error');
        logger.setCustomKey('network_error_name', error.networkError.name || 'Unknown');
        
        // Log additional network error details
        if ('statusCode' in error.networkError) {
          logger.setCustomKey('network_error_status', (error.networkError as any).statusCode);
        }
        if ('result' in error.networkError) {
          logger.setCustomKey('network_error_result', JSON.stringify((error.networkError as any).result));
        }
      }
      
      // Log GraphQL errors details if present
      if (error.graphQLErrors?.length) {
        error.graphQLErrors.forEach((gqlError, index) => {
          logger.setCustomKey(`graphql_error_${index}_message`, gqlError.message);
          logger.setCustomKey(`graphql_error_${index}_code`, gqlError.extensions?.code || 'NO_CODE');
          logger.setCustomKey(`graphql_error_${index}_path`, JSON.stringify(gqlError.path || []));
        });
      }
      
      // Check if it's an authentication error
      const isAuthError = error.graphQLErrors?.some(
        graphQLError => graphQLError.extensions?.code === 'UNAUTHENTICATED' || 
                        graphQLError.message === 'Unauthorized'
      );
      
      logger.setCustomKey('is_auth_error', isAuthError);
      
      if (isAuthError) {
        logger.log('ProjectsScreen: Authentication error detected, attempting token refresh');
        const refreshSuccess = await handleTokenRefresh();
        
        logger.setCustomKey('token_refresh_success', refreshSuccess);
        
        if (refreshSuccess) {
          logger.log('ProjectsScreen: Token refreshed successfully, retrying query');
          refetch();
        } else {
          logger.log('ProjectsScreen: Token refresh failed, user needs to re-authenticate');
          logger.logError(new Error('Token refresh failed after projects query auth error'), 'ProjectsScreen');
        }
      } else {
        // For non-auth errors, log the full error for debugging
        logger.logError(error, 'ProjectsScreen: Non-authentication error in projects query');
      }
    },
    onCompleted: (data) => {
      // Log successful data load
      const projectCount = data?.myProjects?.length || 0;
      logger.log(`ProjectsScreen: Successfully loaded ${projectCount} projects`);
      logger.setCustomKey('loaded_projects_count', projectCount);
      logger.setCustomKey('last_successful_projects_load', new Date().toISOString());
      logger.setCustomKey('auth_fix_working', true);
    }
  });

  const handleProjectPress = (project: Project) => {
    // Set the project in the map store and navigate to explore (map) tab
    setSelectedProject(project.id);
    router.push('/(tabs)/explore');
  };

  const handleRefresh = async () => {
    logger.log('ProjectsScreen: User initiated manual refresh');
    setRefreshing(true);
    try {
      await refetch();
      logger.log('ProjectsScreen: Manual refresh completed successfully');
    } catch (refreshError) {
      logger.logError(refreshError, 'ProjectsScreen: Manual refresh failed');
    } finally {
      setRefreshing(false);
    }
  };



  const handleCreateProject = () => {
    setIsCreateModalVisible(true);
  };

  const handleModalClose = () => {
    setIsCreateModalVisible(false);
  };

  const handleProjectCreated = () => {
    // The mutation will automatically refetch the projects list
    // Additional success handling can be added here if needed
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Projects Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first tree tracking project to get started
      </Text>
    </View>
  );

  const renderErrorState = () => {
    // Log when error state is rendered
    logger.log('ProjectsScreen: Rendering error state to user');
    logger.setCustomKey('error_state_rendered', true);
    logger.setCustomKey('error_state_rendered_at', new Date().toISOString());
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorSubtitle}>
          Unable to load your projects. Please try again.
        </Text>
      </View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary.darkGreen} />
      <Text style={styles.loadingText}>Loading your projects...</Text>
    </View>
  );

  const renderProjectItem = ({ item }: { item: Project }) => (
    <ProjectListItem project={item} onPress={handleProjectPress} />
  );

  // Show loading state
  if (loading && !data) {
    logger.log('ProjectsScreen: Rendering loading state');
    return renderLoadingState();
  }

  // Show error state
  if (error) {
    logger.log('ProjectsScreen: Rendering error state due to error');
    return renderErrorState();
  }

  const projects = data?.myProjects || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Projects</Text>
        <Text style={styles.subtitle}>
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </Text>
      </View>



      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.darkGreen]}
            tintColor={colors.primary.darkGreen}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateProject}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Project Modal */}
      <CreateProjectModal
        visible={isCreateModalVisible}
        onClose={handleModalClose}
        onSuccess={handleProjectCreated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
  },
  title: {
    ...typography.textStyles.h1,
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.textStyles.h2,
    color: colors.functional.darkGray,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  errorTitle: {
    ...typography.textStyles.h2,
    color: colors.functional.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorSubtitle: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    ...components.button.fab,
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.background.white,
    lineHeight: 28,
  },

}); 