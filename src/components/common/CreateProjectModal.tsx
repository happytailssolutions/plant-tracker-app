import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { colors, typography, spacing, components } from '../../styles/theme';
import {
  CREATE_PROJECT_MUTATION,
  CreateProjectInput,
  CreateProjectMutationResponse,
  CreateProjectMutationVariables,
} from '../../api/mutations/projectMutations';
import { MY_PROJECTS_QUERY } from '../../api/queries/projectQueries';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateProjectInput>({
    name: '',
    description: '',
    location: '',
    projectType: '',
    status: 'active',
    isPublic: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createProject, { loading }] = useMutation<
    CreateProjectMutationResponse,
    CreateProjectMutationVariables
  >(CREATE_PROJECT_MUTATION, {
    refetchQueries: [{ query: MY_PROJECTS_QUERY }],
    onCompleted: () => {
      Alert.alert('Success', 'Project created successfully!');
      handleClose();
      onSuccess?.();
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to create project');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (formData.name.trim().length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createProject({
        variables: {
          input: {
            ...formData,
            name: formData.name.trim(),
            description: formData.description?.trim() || undefined,
            location: formData.location?.trim() || undefined,
            projectType: formData.projectType?.trim() || undefined,
          },
        },
      });
    } catch {
      // Error is handled by onError callback
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      projectType: '',
      status: 'active',
      isPublic: false,
    });
    setErrors({});
    onClose();
  };

  const updateField = (field: keyof CreateProjectInput, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Project</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.createButton, loading && styles.createButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.background.white} />
            ) : (
              <Text style={styles.createText}>Create</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Project Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Project Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="Enter project name"
                placeholderTextColor={colors.functional.neutral}
                maxLength={100}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="Describe your project"
                placeholderTextColor={colors.functional.neutral}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            {/* Location */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => updateField('location', value)}
                placeholder="Enter project location"
                placeholderTextColor={colors.functional.neutral}
                maxLength={200}
              />
            </View>

            {/* Project Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Project Type</Text>
              <TextInput
                style={styles.input}
                value={formData.projectType}
                onChangeText={(value) => updateField('projectType', value)}
                placeholder="e.g., Reforestation, Urban Forestry"
                placeholderTextColor={colors.functional.neutral}
                maxLength={100}
              />
            </View>

            {/* Status */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusContainer}>
                {['active', 'planning', 'completed', 'on-hold'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      formData.status === status && styles.statusButtonActive,
                    ]}
                    onPress={() => updateField('status', status)}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        formData.status === status && styles.statusTextActive,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Public/Private Toggle */}
            <View style={styles.fieldContainer}>
              <View style={styles.toggleContainer}>
                <Text style={styles.label}>Public Project</Text>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    formData.isPublic && styles.toggleActive,
                  ]}
                  onPress={() => updateField('isPublic', !formData.isPublic)}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      formData.isPublic && styles.toggleThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                Public projects are visible to all users
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.functional.darkGray,
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
  },
  createButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  input: {
    ...components.input,
  },
  inputError: {
    borderColor: colors.functional.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  errorText: {
    ...typography.textStyles.caption,
    color: colors.functional.error,
    marginTop: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.functional.neutral,
    backgroundColor: colors.background.white,
  },
  statusButtonActive: {
    backgroundColor: colors.primary.darkGreen,
    borderColor: colors.primary.darkGreen,
  },
  statusText: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.darkGray,
  },
  statusTextActive: {
    color: colors.background.white,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.functional.neutral,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary.darkGreen,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  helperText: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
  },
}); 