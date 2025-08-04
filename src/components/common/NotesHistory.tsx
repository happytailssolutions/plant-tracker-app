import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

interface NoteEntry {
  text: string;
  timestamp: string;
  userId?: string;
}

interface NotesHistoryProps {
  notes: NoteEntry[];
  onAddNote: (text: string) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
}

export const NotesHistory: React.FC<NotesHistoryProps> = ({
  notes = [],
  onAddNote,
  isEditing,
  onToggleEdit,
}) => {
  const [newNoteText, setNewNoteText] = useState('');

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleAddNote = () => {
    const trimmedText = newNoteText.trim();
    if (!trimmedText) {
      Alert.alert('Empty Note', 'Please enter some text for your note.');
      return;
    }

    if (trimmedText.length > 500) {
      Alert.alert('Note Too Long', 'Notes cannot exceed 500 characters.');
      return;
    }

    onAddNote(trimmedText);
    setNewNoteText('');
  };

  const handleCancel = () => {
    setNewNoteText('');
    onToggleEdit();
  };

  const renderNoteEntry = (entry: NoteEntry, index: number) => (
    <View key={index} style={styles.noteEntry}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTimestamp}>{formatDate(entry.timestamp)}</Text>
      </View>
      <Text style={styles.noteText}>{entry.text}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add notes to track your plant's progress and observations
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity onPress={onToggleEdit}>
          <Text style={styles.editButton}>
            {isEditing ? 'Cancel' : 'Add Note'}
          </Text>
        </TouchableOpacity>
      </View>

      {notes.length === 0 && !isEditing ? (
        renderEmptyState()
      ) : (
        <ScrollView style={styles.notesContainer} showsVerticalScrollIndicator={false}>
          {notes.map(renderNoteEntry)}
        </ScrollView>
      )}

      {isEditing && (
        <View style={styles.addNoteContainer}>
          <TextInput
            style={styles.noteInput}
            value={newNoteText}
            onChangeText={setNewNoteText}
            placeholder="Add a new note..."
            placeholderTextColor={colors.functional.neutral}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <View style={styles.inputFooter}>
            <Text style={styles.characterCount}>
              {newNoteText.length}/500
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !newNoteText.trim() && styles.addButtonDisabled
                ]}
                onPress={handleAddNote}
                disabled={!newNoteText.trim()}
              >
                <Text style={styles.addButtonText}>Add Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.functional.darkGray,
  },
  editButton: {
    ...typography.textStyles.body,
    color: colors.primary.darkGreen,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.background.white,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary.greenPale,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.textStyles.h3,
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    textAlign: 'center',
  },
  notesContainer: {
    maxHeight: 300,
  },
  noteEntry: {
    backgroundColor: colors.background.white,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary.greenPale,
  },
  noteHeader: {
    marginBottom: spacing.xs,
  },
  noteTimestamp: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
    fontWeight: '500',
  },
  noteText: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    lineHeight: 20,
  },
  addNoteContainer: {
    backgroundColor: colors.background.white,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.darkGreen,
  },
  noteInput: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    borderWidth: 1,
    borderColor: colors.secondary.greenPale,
    borderRadius: spacing.xs,
    padding: spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  characterCount: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    backgroundColor: colors.functional.neutral,
  },
  cancelButtonText: {
    ...typography.textStyles.caption,
    color: colors.background.white,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    backgroundColor: colors.primary.darkGreen,
  },
  addButtonDisabled: {
    backgroundColor: colors.functional.neutral,
  },
  addButtonText: {
    ...typography.textStyles.caption,
    color: colors.background.white,
    fontWeight: '600',
  },
}); 