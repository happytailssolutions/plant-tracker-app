import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MapScreen } from '../../src/screens/MapScreen';
import { CrashlyticsTest } from '../../src/components/CrashlyticsTest';

export default function ExploreScreen() {
  const [showTest, setShowTest] = useState(false);

  if (showTest) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setShowTest(false)}
        >
          <Text style={styles.backButtonText}>← Back to Map</Text>
        </TouchableOpacity>
        <CrashlyticsTest />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={() => setShowTest(true)}
      >
        <Text style={styles.testButtonText}>🧪 Test Crashlytics</Text>
      </TouchableOpacity>
      <MapScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  testButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
