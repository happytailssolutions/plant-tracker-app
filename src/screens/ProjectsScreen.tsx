import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client';
import { IconSymbol } from '../components/ui/IconSymbol';
import { colors, typography, spacing, components } from '../styles/theme';
import { MY_PROJECTS_QUERY, MyProjectsQueryResponse, Project } from '../api/queries/projectQueries';
import { ProjectListItem } from '../components/projects';
import { CreateProjectModal } from '../components/common';
import { useMapStore } from '../state/mapStore';
import { testSupabaseConnection, diagnoseBucketIssue, testDirectUpload } from '../api/utils/imageUpload';

export const ProjectsScreen: React.FC = () => {
  const router = useRouter();
  const { selectedProjectId, setSelectedProject } = useMapStore();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { data, loading, error, refetch } = useQuery<MyProjectsQueryResponse>(MY_PROJECTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('🚨 Projects query error:', error);
      console.error('🚨 Error message:', error.message);
      console.error('🚨 Error networkError:', error.networkError);
      console.error('🚨 Error graphQLErrors:', error.graphQLErrors);
    },
    onCompleted: (data) => {
      console.log('✅ Projects query completed:', data);
    },
  });

  const handleProjectPress = (project: Project) => {
    // Set the project in the map store and navigate to explore (map) tab
    setSelectedProject(project.id);
    router.push('/(tabs)/explore');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Temporary test function for Supabase
  const handleTestSupabase = async () => {
    try {
      console.log('🧪 Testing Supabase connection...');
      await testSupabaseConnection();
      Alert.alert('Test Complete', 'Check the console logs for results');
    } catch (error) {
      console.error('Test failed:', error);
      Alert.alert('Test Failed', 'Check console for details');
    }
  };

  // Detailed bucket diagnostic function
  const handleDiagnoseBucket = async () => {
    try {
      console.log('🔍 Starting bucket diagnosis...');
      await diagnoseBucketIssue();
      Alert.alert('Diagnosis Complete', 'Check the console logs for detailed results');
    } catch (error) {
      console.error('Diagnosis failed:', error);
      Alert.alert('Diagnosis Failed', 'Check console for details');
    }
  };

  // Direct upload test function
  const handleDirectUpload = async () => {
    try {
      console.log('🚀 Starting direct upload test...');
      await testDirectUpload();
      Alert.alert('Direct Upload Test Complete', 'Check the console logs for results');
    } catch (error) {
      console.error('Direct upload test failed:', error);
      Alert.alert('Direct Upload Test Failed', 'Check console for details');
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

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorSubtitle}>
        Unable to load your projects. Please try again.
      </Text>
    </View>
  );

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

      {/* Temporary test buttons */}
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.accent.blue }]}
          onPress={handleTestSupabase}
        >
          <Text style={[styles.testButtonText, { color: colors.functional.white }]}>
            Test Supabase
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.accent.amber }]}
          onPress={handleDiagnoseBucket}
        >
          <Text style={[styles.testButtonText, { color: colors.functional.white }]}>
            Diagnose Bucket
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.accent.teal }]}
          onPress={handleDirectUpload}
        >
          <Text style={[styles.testButtonText, { color: colors.functional.white }]}>
            Direct Upload
          </Text>
        </TouchableOpacity>
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
  testButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  testButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    minWidth: 120,
    alignItems: 'center',
  },
  testButtonText: {
    ...typography.textStyles.body,
    fontWeight: '600',
  },
}); 