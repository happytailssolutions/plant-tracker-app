import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { logger } from '../utils/logger';

export const CrashlyticsTest: React.FC = () => {
  const testLogging = () => {
    logger.log('Test log message from CrashlyticsTest component');
    logger.setCustomKey('test_timestamp', new Date().toISOString());
    Alert.alert('Success', 'Test log sent to Crashlytics!');
  };

  const testError = () => {
    const testError = new Error('Test error from CrashlyticsTest component');
    logger.logError(testError, 'Manual test error');
    Alert.alert('Success', 'Test error sent to Crashlytics!');
  };

  const testCrash = () => {
    Alert.alert(
      'Test Crash',
      'This will cause the app to crash for testing purposes. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Crash',
          style: 'destructive',
          onPress: () => {
            logger.log('About to crash the app for testing');
            // This will cause a crash
            throw new Error('Test crash from CrashlyticsTest component');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crashlytics Test</Text>
      <Text style={styles.description}>
        Use these buttons to test Crashlytics integration
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={testLogging}>
        <Text style={styles.buttonText}>Test Logging</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testError}>
        <Text style={styles.buttonText}>Test Error</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={testCrash}>
        <Text style={styles.buttonText}>Test Crash</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 200,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
