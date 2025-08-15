import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { colors, typography, spacing, components } from '../../styles/theme';
import {
  UPDATE_PROJECT_MUTATION,
  UpdateProjectInput,
  UpdateProjectMutationResponse,
  UpdateProjectMutationVariables,
} from '../../api/mutations/projectMutations';
import { MY_PROJECTS_QUERY, Project } from '../../api/queries/projectQueries';

interface RenameProjectModalProps {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RenameProjectModal: React.FC<RenameProjectModalProps> = ({
  visible,
  project,
  onClose,
  onSuccess,
}) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const [updateProject, { loading }] = useMutation<
    UpdateProjectMutationResponse,
    UpdateProjectMutationVariables
  >(UPDATE_PROJECT_MUTATION, {
    refetchQueries: [{ query: MY_PROJECTS_QUERY }],
    onCompleted: () => {
      Alert.alert('Success', 'Project renamed successfully!');
      handleClose();
      onSuccess?.();
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to rename project');
    },
  });

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      setNewName(project.name);
      setError('');
    }
  }, [project]);

  const validateForm = (): boolean => {
    if (!newName.trim()) {
      setError('Project name is required');
      return false;
    }

    if (newName.trim().length < 3) {
      setError('Project name must be at least 3 characters');
      return false;
    }

    if (newName.trim() === project?.name) {
      setError('New name must be different from current name');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!project || !validateForm()) {
      return;
    }

    try {
      const input: UpdateProjectInput = {
        id: project.id,
        name: newName.trim(),
      };

      await updateProject({
        variables: {
          input,
        },
      });
    } catch {
      // Error is handled by onError callback
    }
  };

  const handleClose = () => {
    setNewName('');
    setError('');
    onClose();
  };

  const handleNameChange = (value: string) => {
    setNewName(value);
    if (error) {
      setError('');
    }
  };

  if (!project) {
    return null;
  }

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
          <Text style={styles.title}>Rename Project</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.background.white} />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.form}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Current Name</Text>
              <Text style={styles.currentName}>{project.name}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>New Name *</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={newName}
                onChangeText={handleNameChange}
                placeholder="Enter new project name"
                placeholderTextColor={colors.functional.neutral}
                maxLength={100}
                autoFocus
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </View>
        </View>
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
  saveButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
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
  currentName: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.background.light,
  },
  input: {
    ...components.input,
  },
  inputError: {
    borderColor: colors.functional.error,
  },
  errorText: {
    ...typography.textStyles.caption,
    color: colors.functional.error,
    marginTop: spacing.xs,
  },
}); 