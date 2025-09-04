import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client';

import { colors, typography, spacing, components } from '../styles/theme';
import { MY_PROJECTS_QUERY, MyProjectsQueryResponse, Project } from '../api/queries/projectQueries';
import { CREATE_PROJECT_MUTATION, CreateProjectMutationResponse, CreateProjectMutationVariables } from '../api/mutations/projectMutations';
import { ProjectListItem } from '../components/projects/ProjectListItem';
import { CreateProjectModal } from '../components/common/CreateProjectModal';
import { useMapStore } from '../state/mapStore';
import { useAuth } from '../hooks/useAuth';
import { analytics } from '../utils/analytics';

export const ProjectsScreen: React.FC = () => {
  const router = useRouter();
  const { selectedProjectId, setSelectedProject } = useMapStore();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { handleTokenRefresh } = useAuth();
  
  // Track screen navigation for user journey monitoring
  useEffect(() => {
    analytics.trackScreenLoad('ProjectsScreen');
  }, []);
  
  const { data, loading, error, refetch } = useQuery<MyProjectsQueryResponse>(MY_PROJECTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    onError: async (error) => {
      // Track GraphQL error
      analytics.trackGraphQLError('MY_PROJECTS_QUERY', error);
      analytics.categorizeError(error, 'ProjectsScreen: Projects query failed');
    },
    onCompleted: (data) => {
      // Track successful project loading
      const projectCount = data?.myProjects?.length || 0;
      analytics.trackFeatureUsage('projects_loading', 'completed', {
        project_count: projectCount
      });
    }
  });

  const handleProjectPress = (project: Project) => {
    // Set the project in the map store and navigate to explore (map) tab
    setSelectedProject(project.id);
    router.push('/(tabs)/explore');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      analytics.trackFeatureUsage('projects_refresh', 'completed');
    } catch (refreshError) {
      analytics.categorizeError(refreshError as Error, 'ProjectsScreen: Manual refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateProject = () => {
    setIsCreateModalVisible(true);
    analytics.trackFeatureUsage('project_creation', 'initiated');
  };

  const handleModalClose = () => {
    setIsCreateModalVisible(false);
  };

  const handleProjectCreated = () => {
    // The mutation will automatically refetch the projects list
    analytics.trackFeatureUsage('project_creation', 'completed');
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
    return renderLoadingState();
  }

  // Show error state
  if (error) {
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