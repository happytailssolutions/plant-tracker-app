import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, components, spacing } from '../../styles/theme';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, isLoading, error } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.light} />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>TreeLocator</Text>
        <Text style={styles.subtitle}>
          Discover and track trees in your area
        </Text>
      </View>

      {/* Logo/Illustration Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🌳</Text>
        </View>
      </View>

      {/* Sign In Section */}
      <View style={styles.signInSection}>
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.googleButtonText}>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.functional.darkGray,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  appName: {
    ...typography.textStyles.h1,
    color: colors.primary.darkGreen,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.textStyles.bodyLarge,
    color: colors.functional.neutral,
    textAlign: 'center',
    maxWidth: 280,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary.greenPale,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.1,
    shadowColor: colors.primary.darkGreen,
    elevation: 4,
  },
  logoText: {
    fontSize: 48,
  },
  signInSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl * 2,
  },
  googleButton: {
    ...components.button.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
  errorText: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  termsText: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
    textAlign: 'center',
    lineHeight: 18,
  },
}); 