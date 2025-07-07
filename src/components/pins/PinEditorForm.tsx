import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client';
import { colors, typography, spacing, components } from '../../styles/theme';
import { ImagePicker } from '../common/ImagePicker';
import { 
  CREATE_PIN_MUTATION, 
  UPDATE_PIN_MUTATION,
  CreatePinInput, 
  CreatePinMutationResponse, 
  CreatePinMutationVariables,
  UpdatePinInput,
  UpdatePinMutationResponse,
  UpdatePinMutationVariables
} from '../../api/mutations/pinMutations';
import { uploadImagesToStorage } from '../../api/utils/imageUpload';

// Types for the form data
interface PinFormData {
  name: string;
  description: string;
  pinType: string;
  status: string;
  projectId: string;
  tags: string[];
  photos: string[];
  isPublic: boolean;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface PinEditorFormProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (data: PinFormData) => void;
  initialData?: Partial<PinFormData>;
  projects: Project[];
  loading?: boolean;
  mode: 'create' | 'edit';
  latitude?: number;
  longitude?: number;
  pinId?: string; // Add pinId for edit mode
}

export const PinEditorForm: React.FC<PinEditorFormProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  projects,
  loading = false,
  mode,
  latitude,
  longitude,
  pinId,
}) => {
  const [formData, setFormData] = useState<PinFormData>({
    name: '',
    description: '',
    pinType: 'plant',
    status: 'active',
    projectId: '',
    tags: [],
    photos: [],
    isPublic: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveStage, setSaveStage] = useState<'idle' | 'uploading' | 'creating' | 'updating'>('idle');

  // GraphQL mutation for creating pins
  const [createPin] = useMutation<CreatePinMutationResponse, CreatePinMutationVariables>(
    CREATE_PIN_MUTATION,
    {
      onCompleted: () => {
        setSaveLoading(false);
        setSaveStage('idle');
        Alert.alert('Success', 'Pin created successfully!');
        onClose();
        // Optionally refresh the map data
        // You might want to add a callback to refresh the map
      },
      onError: (error) => {
        setSaveLoading(false);
        setSaveStage('idle');
        Alert.alert('Error', `Failed to create pin: ${error.message}`);
      },
    }
  );

  // GraphQL mutation for updating pins
  const [updatePin] = useMutation<UpdatePinMutationResponse, UpdatePinMutationVariables>(
    UPDATE_PIN_MUTATION,
    {
      onCompleted: () => {
        setSaveLoading(false);
        setSaveStage('idle');
        Alert.alert('Success', 'Pin updated successfully!');
        onClose();
        // Optionally refresh the map data
        // You might want to add a callback to refresh the map
      },
      onError: (error) => {
        setSaveLoading(false);
        setSaveStage('idle');
        Alert.alert('Error', `Failed to update pin: ${error.message}`);
      },
    }
  );

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (visible && initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    } else if (visible && mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        pinType: 'plant',
        status: 'active',
        projectId: projects.length > 0 ? projects[0].id : '',
        tags: [],
        photos: [],
        isPublic: false,
      });
    }
    setErrors({});
  }, [visible, initialData, mode, projects]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Pin name is required';
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Pin name must be at least 2 characters';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Please select a project';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (mode === 'create') {
      await handleCreatePin();
    } else {
      await handleUpdatePin();
    }
  };

  const handleCreatePin = async () => {
    try {
      setSaveLoading(true);
      setSaveStage('uploading');

      // Step 1: Upload images to Supabase Storage
      let imageUrls: string[] = [];
      if (formData.photos.length > 0) {
        try {
          const uploadedImages = await uploadImagesToStorage(formData.photos);
          imageUrls = uploadedImages.map(img => img.url);
        } catch (error) {
          Alert.alert('Error', 'Failed to upload images. Please try again.');
          setSaveLoading(false);
          setSaveStage('idle');
          return;
        }
      }

      setSaveStage('creating');

      // Step 2: Create pin with GraphQL mutation
      const pinInput: CreatePinInput = {
        name: formData.name,
        description: formData.description || undefined,
        pinType: formData.pinType,
        status: formData.status,
        latitude: latitude || 0, // Use provided coordinates or default
        longitude: longitude || 0,
        projectId: formData.projectId,
        isPublic: formData.isPublic,
        metadata: {
          tags: formData.tags,
          photos: imageUrls,
        },
      };

      await createPin({
        variables: {
          input: pinInput,
        },
      });
    } catch (error) {
      setSaveLoading(false);
      setSaveStage('idle');
      Alert.alert('Error', `Failed to create pin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdatePin = async () => {
    if (!pinId) {
      Alert.alert('Error', 'Pin ID is required for updating');
      return;
    }

    try {
      setSaveLoading(true);
      setSaveStage('uploading');

      // Step 1: Upload new images to Supabase Storage
      let imageUrls: string[] = [];
      if (formData.photos.length > 0) {
        try {
          const uploadedImages = await uploadImagesToStorage(formData.photos);
          imageUrls = uploadedImages.map(img => img.url);
        } catch (error) {
          Alert.alert('Error', 'Failed to upload images. Please try again.');
          setSaveLoading(false);
          setSaveStage('idle');
          return;
        }
      }

      setSaveStage('updating');

      // Step 2: Update pin with GraphQL mutation
      const pinInput: UpdatePinInput = {
        id: pinId,
        name: formData.name,
        description: formData.description || undefined,
        pinType: formData.pinType,
        status: formData.status,
        projectId: formData.projectId,
        isPublic: formData.isPublic,
        metadata: {
          tags: formData.tags,
          photos: imageUrls,
        },
      };

      await updatePin({
        variables: {
          input: pinInput,
        },
      });
    } catch (error) {
      setSaveLoading(false);
      setSaveStage('idle');
      Alert.alert('Error', `Failed to update pin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      pinType: 'plant',
      status: 'active',
      projectId: '',
      tags: [],
      photos: [],
      isPublic: false,
    });
    setErrors({});
    setTagInput('');
    onClose();
  };

  const updateField = (field: keyof PinFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      updateField('tags', [...formData.tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputSubmit = () => {
    addTag();
  };

  const pinTypes = [
    { value: 'plant', label: 'Plant' },
    { value: 'tree', label: 'Tree' },
    { value: 'flower', label: 'Flower' },
    { value: 'shrub', label: 'Shrub' },
    { value: 'herb', label: 'Herb' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'dormant', label: 'Dormant' },
    { value: 'harvested', label: 'Harvested' },
    { value: 'removed', label: 'Removed' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {mode === 'create' ? 'Create Pin' : 'Edit Pin'}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || saveLoading}
            style={[styles.saveButton, (loading || saveLoading) && styles.saveButtonDisabled]}
          >
            {(loading || saveLoading) ? (
              <View style={styles.saveButtonContent}>
                <ActivityIndicator size="small" color={colors.background.white} />
                <Text style={styles.saveText}>
                  {saveStage === 'uploading' ? 'Uploading...' : 
                   saveStage === 'creating' ? 'Creating...' : 
                   saveStage === 'updating' ? 'Updating...' : 'Saving...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Pin Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Pin Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="Enter pin name"
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
                placeholder="Describe this pin"
                placeholderTextColor={colors.functional.neutral}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            {/* Project Selection */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Project *</Text>
              <View style={[styles.pickerContainer, errors.projectId && styles.inputError]}>
                <Text style={styles.pickerText}>
                  {formData.projectId 
                    ? projects.find(p => p.id === formData.projectId)?.name || 'Select Project'
                    : 'Select Project'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.functional.neutral} />
              </View>
              {errors.projectId && <Text style={styles.errorText}>{errors.projectId}</Text>}
            </View>

            {/* Pin Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Pin Type</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {pinTypes.find(t => t.value === formData.pinType)?.label || 'Plant'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.functional.neutral} />
              </View>
            </View>

            {/* Status */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {statusOptions.find(s => s.value === formData.status)?.label || 'Active'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.functional.neutral} />
              </View>
            </View>

            {/* Tags */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Add a tag"
                  placeholderTextColor={colors.functional.neutral}
                  onSubmitEditing={handleTagInputSubmit}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={addTag}
                  disabled={!tagInput.trim()}
                >
                  <Ionicons 
                    name="add" 
                    size={20} 
                    color={tagInput.trim() ? colors.primary.darkGreen : colors.functional.neutral} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Display Tags */}
              {formData.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {formData.tags.map((tag, index) => (
                    <View key={index} style={styles.tagItem}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity
                        onPress={() => removeTag(tag)}
                        style={styles.removeTagButton}
                      >
                        <Ionicons name="close" size={16} color={colors.functional.neutral} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Photos */}
            <ImagePicker
              images={formData.photos}
              onImagesChange={(photos) => updateField('photos', photos)}
              maxImages={5}
            />

            {/* Public Toggle */}
            <View style={styles.fieldContainer}>
              <View style={styles.toggleContainer}>
                <Text style={styles.label}>Make Public</Text>
                <TouchableOpacity
                  style={[styles.toggle, formData.isPublic && styles.toggleActive]}
                  onPress={() => updateField('isPublic', !formData.isPublic)}
                >
                  <View style={[styles.toggleThumb, formData.isPublic && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.toggleDescription}>
                Public pins are visible to all users
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
  },
  cancelButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  cancelText: {
    ...typography.textStyles.body,
    color: colors.primary.darkGreen,
    fontWeight: typography.fontWeight.medium,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.functional.darkGray,
    fontWeight: typography.fontWeight.semibold,
  },
  saveButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.functional.neutral,
  },
  saveText: {
    ...typography.textStyles.body,
    color: colors.background.white,
    fontWeight: typography.fontWeight.medium,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: spacing.md,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
  },
  input: {
    ...components.input,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  inputError: {
    borderColor: colors.functional.error,
  },
  errorText: {
    ...typography.textStyles.caption,
    color: colors.functional.error,
    marginTop: spacing.xs,
  },
  pickerContainer: {
    ...components.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    flex: 1,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tagInput: {
    flex: 1,
    ...components.input,
    marginRight: spacing.sm,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.functional.neutral,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary.greenPale,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  tagText: {
    ...typography.textStyles.caption,
    color: colors.primary.darkGreen,
    marginRight: spacing.xs,
  },
  removeTagButton: {
    padding: 2,
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
  toggleDescription: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
  },
});

export default PinEditorForm; 