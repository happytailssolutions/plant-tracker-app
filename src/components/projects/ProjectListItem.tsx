import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, typography, spacing, components } from '../../styles/theme';
import { Project, MY_PROJECTS_QUERY } from '../../api/queries/projectQueries';
import { RenameProjectModal } from '../common/RenameProjectModal';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import { useMutation } from '@apollo/client';
import {
  DELETE_PROJECT_MUTATION,
  DeleteProjectMutationResponse,
  DeleteProjectMutationVariables,
} from '../../api/mutations/projectMutations';

interface ProjectListItemProps {
  project: Project;
  onPress: (project: Project) => void;
  onLongPress?: (project: Project) => void;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({ 
  project, 
  onPress,
  onLongPress 
}) => {
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [deleteProject, { loading: deleteLoading }] = useMutation<
    DeleteProjectMutationResponse,
    DeleteProjectMutationVariables
  >(DELETE_PROJECT_MUTATION, {
    refetchQueries: [{ query: MY_PROJECTS_QUERY }],
    onCompleted: () => {
      Alert.alert('Success', 'Project deleted successfully!');
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to delete project');
    },
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return colors.functional.success;
      case 'completed':
        return colors.accent.teal;
      case 'pending':
        return colors.accent.amber;
      default:
        return colors.functional.neutral;
    }
  };

  const getStatusText = (status?: string) => {
    return status || 'No status';
  };

  const handleLongPress = () => {
    onLongPress?.(project);
    showContextMenu();
  };

  const showContextMenu = () => {
    Alert.alert(
      'Project Options',
      'What would you like to do with this project?',
      [
        {
          text: 'Rename',
          onPress: () => setShowRenameModal(true),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setShowDeleteDialog(true),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleDelete = async () => {
    try {
      await deleteProject({
        variables: {
          id: project.id,
        },
      });
    } catch {
      // Error is handled by onError callback
    }
  };

  const handleRenameSuccess = () => {
    setShowRenameModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress(project)}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {project.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
            <Text style={styles.statusText}>
              {getStatusText(project.status)}
            </Text>
          </View>
        </View>

        {project.description && (
          <Text style={styles.description} numberOfLines={2}>
            {project.description}
          </Text>
        )}

        <View style={styles.details}>
          {project.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {project.location}
              </Text>
            </View>
          )}

          {project.projectType && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {project.projectType}
              </Text>
            </View>
          )}

          {project.area && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Area:</Text>
              <Text style={styles.detailValue}>
                {project.area} {project.areaUnit || 'units'}
              </Text>
            </View>
          )}

          {project.startDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(project.startDate)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.statsInfo}>
            {/* Show members count only for public projects */}
            {project.isPublic && (
              <Text style={styles.statsText}>
                {project.members.length} member{project.members.length !== 1 ? 's' : ''}
              </Text>
            )}
            {/* Show plants/pins count */}
            <Text style={styles.statsText}>
              {project.pinsCount} plant{project.pinsCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.visibility}>
            <Text style={styles.visibilityText}>
              {project.isPublic ? 'Public' : 'Private'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Rename Modal */}
      <RenameProjectModal
        visible={showRenameModal}
        project={project}
        onClose={() => setShowRenameModal(false)}
        onSuccess={handleRenameSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        visible={showDeleteDialog}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...components.card,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.textStyles.h3,
    color: colors.functional.darkGray,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    ...typography.textStyles.caption,
    color: colors.background.white,
    fontWeight: '600',
  },
  description: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  details: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    fontWeight: '500',
    width: 80,
  },
  detailValue: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.darkGray,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.background.light,
  },
  statsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statsText: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
  },
  visibility: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.secondary.greenPale,
    borderRadius: 8,
  },
  visibilityText: {
    ...typography.textStyles.caption,
    color: colors.primary.darkGreen,
    fontWeight: '500',
  },
}); 