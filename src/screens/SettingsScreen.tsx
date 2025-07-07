import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useQuery } from '@apollo/client';
import { colors, typography, spacing, components } from '../styles/theme';
import { useAuthStore } from '../state/authStore';
import { useAuth } from '../hooks/useAuth';
import { ME_QUERY, MeQueryResponse } from '../api/queries/userQueries';
import { resetApolloCache } from '../api/apollo-client';

export const SettingsScreen: React.FC = () => {
  const { clearAuth, user: localUser } = useAuthStore();
  const { signOut, isLoading } = useAuth();

  // Fetch user data from GraphQL API
  const { data, loading, error } = useQuery<MeQueryResponse>(ME_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const user = data?.me || localUser;

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              resetApolloCache();
              clearAuth();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading user information...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Settings</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load user information. Using local data.
          </Text>
        </View>
      )}
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.sectionTitle}>User Information</Text>
          
          {user.name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          
          {data?.me?.createdAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member since:</Text>
              <Text style={styles.infoValue}>
                {new Date(data.me.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity
          style={[styles.signOutButton, isLoading && styles.disabledButton]}
          onPress={handleSignOut}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutButtonText}>
            {isLoading ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.textStyles.h1,
    color: colors.primary.darkGreen,
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.textStyles.bodyLarge,
    color: colors.functional.darkGray,
  },
  errorContainer: {
    backgroundColor: colors.secondary.greenPale,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.textStyles.body,
    color: colors.functional.error,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.textStyles.h2,
    color: colors.primary.darkGreen,
    marginBottom: spacing.md,
  },
  userInfo: {
    backgroundColor: colors.background.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    shadowColor: colors.primary.darkGreen,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
  },
  infoLabel: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    flex: 1,
    textAlign: 'right',
  },
  signOutButton: {
    ...components.button.secondary,
    backgroundColor: colors.functional.error,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signOutButtonText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
}); 