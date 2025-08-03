import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useQuery } from '@apollo/client';
import { PINS_QUERY, PINS_BY_PROJECT_QUERY, PinsInBoundsQueryResponse, PinsByProjectQueryResponse, MapBounds, Pin } from '../api/queries/pinQueries';
import { MY_PROJECTS_QUERY, MyProjectsQueryResponse } from '../api/queries/projectQueries';
import { MapMarker } from '../components/map';
import { PinEditorForm, PinDetailSheet } from '../components/pins';
import { colors, spacing, components } from '../styles/theme';
import { useMapStore } from '../state/mapStore';
import { useLocation } from '../hooks/useLocation';
import { calculateBoundsFromPins, createRegionFromCoordinates, validateRegion, DEFAULT_REGION } from '../utils/mapUtils';

// Debounce delay for map region changes (in milliseconds)
const DEBOUNCE_DELAY = 500;

export const MapScreen: React.FC = () => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [isPinEditorVisible, setIsPinEditorVisible] = useState(false);
  const [mapBounds, setMapBounds] = useState<MapBounds>({
    north: region.latitude + region.latitudeDelta / 2,
    south: region.latitude - region.latitudeDelta / 2,
    east: region.longitude + region.longitudeDelta / 2,
    west: region.longitude - region.longitudeDelta / 2,
  });

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mapRef = useRef<MapView>(null);
  
  // Map store state
  const selectedProjectId = useMapStore((state) => state.selectedProjectId);
  const selectedPinId = useMapStore((state) => state.selectedPinId);
  const autoCenterMode = useMapStore((state) => state.autoCenterMode);
  const isCentering = useMapStore((state) => state.isCentering);
  const setSelectedPin = useMapStore((state) => state.setSelectedPin);
  const setAutoCenterMode = useMapStore((state) => state.setAutoCenterMode);
  const setCentering = useMapStore((state) => state.setCentering);
  
  // Location hook
  const { getCurrentLocation, loading: locationLoading } = useLocation();

  // GraphQL query for fetching user's projects
  const { data: projectsData } = useQuery<MyProjectsQueryResponse>(MY_PROJECTS_QUERY);

  // GraphQL query for fetching pins within map bounds
  const { data, loading, error, refetch } = useQuery<PinsInBoundsQueryResponse>(
    PINS_QUERY,
    {
      variables: {
        mapBounds: {
          ...mapBounds,
          projectId: selectedProjectId,
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  // GraphQL query for fetching all pins of the selected project (for centering)
  const { data: projectPinsData, loading: projectPinsLoading } = useQuery<PinsByProjectQueryResponse>(
    PINS_BY_PROJECT_QUERY,
    {
      variables: { projectId: selectedProjectId! },
      skip: !selectedProjectId || autoCenterMode !== 'project-pins',
      fetchPolicy: 'cache-and-network',
    }
  );

  // Debounced function to update map bounds and fetch pins
  const debouncedFetchPins = useCallback((newRegion: Region) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const newBounds: MapBounds = {
        north: newRegion.latitude + newRegion.latitudeDelta / 2,
        south: newRegion.latitude - newRegion.latitudeDelta / 2,
        east: newRegion.longitude + newRegion.longitudeDelta / 2,
        west: newRegion.longitude - newRegion.longitudeDelta / 2,
      };

      setMapBounds(newBounds);
    }, DEBOUNCE_DELAY);
  }, []);

  // Handle map region changes
  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
    debouncedFetchPins(newRegion);
  }, [debouncedFetchPins]);

  // Handle marker press
  const handleMarkerPress = useCallback((pin: Pin) => {
    setSelectedPin(pin.id);
  }, [setSelectedPin]);

  // Handle FAB press to create new pin
  const handleCreatePin = useCallback(() => {
    if (!projectsData?.myProjects || projectsData.myProjects.length === 0) {
      Alert.alert(
        'No Projects',
        'You need to create a project first before adding pins.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    setIsPinEditorVisible(true);
  }, [projectsData]);

  // Handle pin editor close
  const handlePinEditorClose = useCallback(() => {
    setIsPinEditorVisible(false);
  }, []);

  // Handle pin detail sheet close
  const handlePinDetailClose = useCallback(() => {
    setSelectedPin(null);
  }, [setSelectedPin]);

  // Center map on project pins
  const centerMapOnProjectPins = useCallback(async (pins: Pin[]) => {
    if (!mapRef.current || pins.length === 0) {
      // No pins, center on user location
      setAutoCenterMode('user-location');
      return;
    }

    const newRegion = calculateBoundsFromPins(pins);
    
    if (validateRegion(newRegion)) {
      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
    
    setCentering(false);
    setAutoCenterMode(null);
  }, [setAutoCenterMode, setCentering]);

  // Center map on user location
  const centerMapOnUserLocation = useCallback(async () => {
    const location = await getCurrentLocation();
    
    if (location) {
      const newRegion = createRegionFromCoordinates(location.latitude, location.longitude);
      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } else {
      // Fallback to default region
      setRegion(DEFAULT_REGION);
      if (mapRef.current) {
        mapRef.current.animateToRegion(DEFAULT_REGION, 1000);
      }
    }
    
    setCentering(false);
    setAutoCenterMode(null);
  }, [getCurrentLocation, setCentering, setAutoCenterMode]);

  // Handle auto-centering based on mode
  useEffect(() => {
    if (!isCentering || !autoCenterMode) return;

    if (autoCenterMode === 'project-pins') {
      if (projectPinsData?.pinsByProject) {
        centerMapOnProjectPins(projectPinsData.pinsByProject);
      }
    } else if (autoCenterMode === 'user-location') {
      centerMapOnUserLocation();
    }
  }, [isCentering, autoCenterMode, projectPinsData, centerMapOnProjectPins, centerMapOnUserLocation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Refetch pins when selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      refetch({
        mapBounds: {
          ...mapBounds,
          projectId: selectedProjectId,
        },
      });
    }
  }, [selectedProjectId, mapBounds, refetch]);

  // Handle query errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching pins:', error);
      Alert.alert(
        'Error',
        'Failed to load map data. Please check your connection and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [error]);

  const pins = data?.pinsInBounds || [];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
      >
        {pins.map((pin) => (
          <MapMarker
            key={pin.id}
            pin={pin}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {/* Loading indicator */}
      {(loading || isCentering || locationLoading) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.darkGreen} />
          {isCentering && (
            <Text style={styles.loadingText}>
              {autoCenterMode === 'project-pins' ? 'Centering on project pins...' : 'Getting your location...'}
            </Text>
          )}
        </View>
      )}

      {/* Pin count indicator */}
      {pins.length > 0 && (
        <View style={styles.pinCountContainer}>
          <View style={styles.pinCountBadge}>
            <Text style={styles.pinCountText}>{pins.length} pins</Text>
          </View>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePin}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Pin Editor Modal */}
      <PinEditorForm
        visible={isPinEditorVisible}
        onClose={handlePinEditorClose}
        projects={projectsData?.myProjects || []}
        mode="create"
        latitude={region.latitude}
        longitude={region.longitude}
      />

      {/* Pin Detail Sheet */}
      <PinDetailSheet
        pinId={selectedPinId}
        onClose={handlePinDetailClose}
        projects={projectsData?.myProjects || []}
        onPinDeleted={() => {
          // Refetch pins after deletion
          refetch();
        }}
        onPinUpdated={() => {
          // Refetch pins after update
          refetch();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.background.white,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    shadowColor: colors.functional.neutral,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.functional.darkGray,
    fontSize: 12,
    fontWeight: '500',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  pinCountContainer: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
  },
  pinCountBadge: {
    backgroundColor: colors.primary.darkGreen,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pinCountText: {
    color: colors.background.white,
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    ...components.button.fab,
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.background.white,
    lineHeight: 28,
  },
}); 