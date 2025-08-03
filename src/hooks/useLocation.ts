import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

interface UseLocationReturn {
  location: LocationState | null;
  loading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<LocationState | null>;
  requestPermissions: () => Promise<boolean>;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission denied');
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to center the map on your current location when a project has no pins.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch (err) {
      setError('Failed to request location permissions');
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<LocationState | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check if we have permission
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          setLoading(false);
          return null;
        }
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const locationData: LocationState = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
      };

      setLocation(locationData);
      setLoading(false);
      return locationData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current location';
      setError(errorMessage);
      setLoading(false);
      
      Alert.alert(
        'Location Error',
        'Unable to get your current location. The map will show a default region.',
        [{ text: 'OK' }]
      );
      
      return null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setLocation(null);
      setError(null);
    };
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    requestPermissions,
  };
}; 