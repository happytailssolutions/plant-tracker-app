import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapScreen } from '../../src/screens/MapScreen';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <MapScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
