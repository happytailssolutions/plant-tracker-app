import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { PIN_BY_ID_QUERY, PinByIdQueryResponse } from '../../api/queries/pinQueries';
import { DELETE_PIN_MUTATION, DeletePinMutationResponse, DeletePinMutationVariables } from '../../api/mutations/pinMutations';
import { colors, typography, spacing, components } from '../../styles/theme';
import { PinEditorForm } from './PinEditorForm';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

interface PinDetailSheetProps {
  pinId: string | null;
  onClose: () => void;
  projects: Array<{ id: string; name: string; description?: string }>;
  onPinDeleted?: () => void;
  onPinUpdated?: () => void;
}

export const PinDetailSheet: React.FC<PinDetailSheetProps> = ({ 
  pinId, 
  onClose, 
  projects,
  onPinDeleted,
  onPinUpdated 
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data, loading, error, refetch } = useQuery<PinByIdQueryResponse>(PIN_BY_ID_QUERY, {
    variables: { id: pinId },
    skip: !pinId,
    fetchPolicy: 'cache-and-network',
  });

  const [deletePin] = useMutation<DeletePinMutationResponse, DeletePinMutationVariables>(
    DELETE_PIN_MUTATION,
    {
      onCompleted: () => {
        setDeleteLoading(false);
        setShowDeleteDialog(false);
        Alert.alert('Success', 'Pin deleted successfully!');
        onPinDeleted?.();
        onClose();
      },
      onError: (error) => {
        setDeleteLoading(false);
        Alert.alert('Error', `Failed to delete pin: ${error.message}`);
      },
    }
  );

  const pin = data?.pin;

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching pin details:', error);
      Alert.alert(
        'Error',
        'Failed to load pin details. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [error]);

  const handleEditPin = () => {
    setShowEditForm(true);
  };

  const handleDeletePin = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!pinId) return;
    
    setDeleteLoading(true);
    await deletePin({
      variables: { id: pinId },
    });
  };

  const handleEditFormClose = () => {
    setShowEditForm(false);
    // Refetch pin data to show updated information
    refetch();
    onPinUpdated?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return colors.functional.success;
      case 'inactive':
        return colors.functional.error;
      case 'pending':
        return colors.accent.amber;
      default:
        return colors.functional.neutral;
    }
  };

  const getPinTypeColor = (pinType: string) => {
    switch (pinType.toLowerCase()) {
      case 'tree':
        return colors.primary.darkGreen;
      case 'plant':
        return colors.secondary.greenLight;
      case 'seedling':
        return colors.accent.amber;
      case 'flower':
        return colors.accent.teal;
      default:
        return colors.primary.darkGreen;
    }
  };

  if (!pinId) {
    return null;
  }

  return (
    <>
      <Modal
        visible={!!pinId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pin Details</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.darkGreen} />
                <Text style={styles.loadingText}>Loading pin details...</Text>
              </View>
            ) : pin ? (
              <>
                {/* Pin Name and Type */}
                <View style={styles.section}>
                  <Text style={styles.pinName}>{pin.name}</Text>
                  <View style={styles.typeContainer}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: getPinTypeColor(pin.pinType) },
                      ]}
                    >
                      <Text style={styles.typeText}>{pin.pinType}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(pin.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{pin.status}</Text>
                    </View>
                  </View>
                </View>

                {/* Description */}
                {pin.description && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{pin.description}</Text>
                  </View>
                )}

                {/* Location */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <Text style={styles.locationText}>{pin.location}</Text>
                  <Text style={styles.coordinatesText}>
                    {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}
                  </Text>
                </View>

                {/* Project */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Project</Text>
                  <Text style={styles.projectName}>{pin.project.name}</Text>
                  {pin.project.description && (
                    <Text style={styles.projectDescription}>
                      {pin.project.description}
                    </Text>
                  )}
                </View>

                {/* Created By */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Created By</Text>
                  <Text style={styles.creatorName}>{pin.createdBy.name}</Text>
                  <Text style={styles.creatorEmail}>{pin.createdBy.email}</Text>
                </View>

                {/* Dates */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Timeline</Text>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Created:</Text>
                    <Text style={styles.dateValue}>{formatDate(pin.createdAt)}</Text>
                  </View>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Updated:</Text>
                    <Text style={styles.dateValue}>{formatDate(pin.updatedAt)}</Text>
                  </View>
                </View>

                {/* Metadata */}
                {pin.metadata && Object.keys(pin.metadata).length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Info</Text>
                    <Text style={styles.metadataText}>
                      {JSON.stringify(pin.metadata, null, 2)}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsSection}>
                  <TouchableOpacity style={styles.actionButton} onPress={handleEditPin}>
                    <Text style={styles.actionButtonText}>Edit Pin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]} 
                    onPress={handleDeletePin}
                  >
                    <Text style={styles.deleteButtonText}>Delete Pin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]}>
                    <Text style={styles.secondaryActionText}>View on Map</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Pin not found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Form Modal */}
      {pin && (
        <PinEditorForm
          visible={showEditForm}
          onClose={handleEditFormClose}
          mode="edit"
          pinId={pin.id}
          projects={projects}
          initialData={{
            name: pin.name,
            description: pin.description || '',
            pinType: pin.pinType,
            status: pin.status,
            projectId: pin.projectId,
            tags: (pin.metadata as any)?.tags || [],
            photos: (pin.metadata as any)?.photos || [],
            isPublic: pin.isPublic,
          }}
          latitude={pin.latitude}
          longitude={pin.longitude}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        visible={showDeleteDialog}
        title="Delete Pin"
        message={`Are you sure you want to delete "${pin?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor={colors.functional.error}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.greenPale,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.functional.neutral,
    fontWeight: '600',
  },
  headerTitle: {
    ...typography.textStyles.h3,
    color: colors.primary.darkGreen,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.greenPale,
  },
  pinName: {
    ...typography.textStyles.h2,
    color: colors.primary.darkGreen,
    marginBottom: spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  typeText: {
    ...typography.textStyles.caption,
    color: colors.background.white,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  statusText: {
    ...typography.textStyles.caption,
    color: colors.background.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    ...typography.textStyles.h3,
    color: colors.functional.darkGray,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    lineHeight: 22,
  },
  locationText: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
  },
  coordinatesText: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    fontFamily: 'monospace',
  },
  projectName: {
    ...typography.textStyles.body,
    color: colors.primary.darkGreen,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  projectDescription: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
  },
  creatorName: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  creatorEmail: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  dateLabel: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
  },
  dateValue: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.darkGray,
    fontWeight: '500',
  },
  metadataText: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    fontFamily: 'monospace',
    backgroundColor: colors.background.white,
    padding: spacing.sm,
    borderRadius: spacing.xs,
  },
  actionsSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  actionButton: {
    ...components.button.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
  deleteButton: {
    backgroundColor: colors.functional.error,
  },
  deleteButtonText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
  secondaryAction: {
    ...components.button.secondary,
  },
  secondaryActionText: {
    ...typography.textStyles.button,
    color: colors.primary.darkGreen,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  errorText: {
    ...typography.textStyles.body,
    color: colors.functional.error,
  },
}); 