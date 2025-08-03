import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../styles/theme';
import { PINS_BY_PROJECT_QUERY, PinsByProjectQueryResponse, Pin } from '../api/queries/pinQueries';
import { MY_PROJECTS_QUERY, MyProjectsQueryResponse } from '../api/queries/projectQueries';
import { PinListItem } from '../components/pins/PinListItem';
import { PinDetailSheet } from '../components/pins/PinDetailSheet';
import { useMapStore } from '../state/mapStore';

export const PlantsScreen: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [showPinDetail, setShowPinDetail] = useState(false);
  const router = useRouter();
  
  // Map store for project selection and tag navigation
  const selectedProjectId = useMapStore((state) => state.selectedProjectId);
  const setTagAndNavigate = useMapStore((state) => state.setTagAndNavigate);

  const { data: pinsData, loading: pinsLoading, error: pinsError, refetch: refetchPins } = useQuery<PinsByProjectQueryResponse>(
    PINS_BY_PROJECT_QUERY,
    {
      variables: { projectId: selectedProjectId || '' },
      skip: !selectedProjectId,
      fetchPolicy: 'cache-and-network',
    }
  );

  const { data: projectsData, loading: projectsLoading, error: projectsError } = useQuery<MyProjectsQueryResponse>(MY_PROJECTS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const handlePinPress = (pin: Pin) => {
    setSelectedPin(pin);
    setShowPinDetail(true);
  };

  const handleTagPress = (tag: string) => {
    setTagAndNavigate(tag);
    router.push('/(tabs)/explore');
  };

  const handlePinDetailClose = () => {
    setShowPinDetail(false);
    setSelectedPin(null);
  };

  const handlePinDeleted = () => {
    refetchPins();
  };

  const handlePinUpdated = () => {
    refetchPins();
  };

  const handleSelectProject = () => {
    router.push('/(tabs)/');
  };

  const renderPinItem = ({ item }: { item: Pin }) => (
    <PinListItem
      pin={item}
      onPress={handlePinPress}
      onTagPress={handleTagPress}
    />
  );

  const renderNoProjectSelected = () => (
    <View style={styles.noProjectContainer}>
      <Text style={styles.noProjectTitle}>No Project Selected</Text>
      <Text style={styles.noProjectSubtitle}>
        Please select a project to view its plants
      </Text>
      <TouchableOpacity style={styles.selectProjectButton} onPress={handleSelectProject}>
        <Text style={styles.selectProjectButtonText}>Select Project</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Plants Found</Text>
      <Text style={styles.emptySubtitle}>
        This project doesn't have any plants yet. Start by adding some plants to your project.
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Error Loading Plants</Text>
      <Text style={styles.errorSubtitle}>
        {pinsError?.message || 'Something went wrong. Please try again.'}
      </Text>
    </View>
  );

  // If no project is selected, show the no project message
  if (!selectedProjectId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Plants</Text>
          <Text style={styles.headerSubtitle}>Select a project to view plants</Text>
        </View>
        {renderNoProjectSelected()}
      </View>
    );
  }

  // Get the selected project name for display
  const selectedProject = projectsData?.myProjects.find(p => p.id === selectedProjectId);

  if (pinsLoading && !pinsData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.darkGreen} />
        <Text style={styles.loadingText}>Loading plants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plants</Text>
        <Text style={styles.headerSubtitle}>
          {selectedProject ? `${pinsData?.pinsByProject.length || 0} plants in "${selectedProject.name}"` : 'Loading project...'}
        </Text>
      </View>

      {/* Content */}
      <FlatList
        data={pinsData?.pinsByProject || []}
        renderItem={renderPinItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={pinsLoading}
            onRefresh={refetchPins}
            colors={[colors.primary.darkGreen]}
            tintColor={colors.primary.darkGreen}
          />
        }
        ListEmptyComponent={pinsError ? renderErrorState : renderEmptyState}
      />

      {/* Pin Detail Sheet */}
      {selectedPin && (
        <PinDetailSheet
          pinId={selectedPin.id}
          onClose={handlePinDetailClose}
          projects={projectsData?.myProjects || []}
          onPinDeleted={handlePinDeleted}
          onPinUpdated={handlePinUpdated}
        />
      )}
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
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.greenPale,
  },
  headerTitle: {
    ...typography.textStyles.h1,
    color: colors.primary.darkGreen,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.light,
  },
  loadingText: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    marginTop: spacing.md,
  },
  noProjectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  noProjectTitle: {
    ...typography.textStyles.h2,
    color: colors.functional.darkGray,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noProjectSubtitle: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  selectProjectButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
  },
  selectProjectButtonText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.textStyles.h3,
    color: colors.functional.darkGray,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  errorTitle: {
    ...typography.textStyles.h3,
    color: colors.functional.error,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    textAlign: 'center',
  },
}); 