import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useQuery, useMutation } from '@apollo/client';
import { PINS_QUERY, PINS_BY_PROJECT_QUERY, PinsInBoundsQueryResponse, PinsByProjectQueryResponse, MapBounds, Pin } from '../api/queries/pinQueries';
import { MY_PROJECTS_QUERY, MyProjectsQueryResponse } from '../api/queries/projectQueries';
import { CREATE_PIN_MUTATION, CreatePinMutationResponse, CreatePinMutationVariables } from '../api/mutations/pinMutations';
import { MapMarker, PreviewPinMarker, PreviewPinControls } from '../components/map';
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
  const previewCoordinateTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mapRef = useRef<MapView>(null);
  
  // Map store state
  const selectedProjectId = useMapStore((state) => state.selectedProjectId);
  const selectedPinId = useMapStore((state) => state.selectedPinId);
  const autoCenterMode = useMapStore((state) => state.autoCenterMode);
  const isCentering = useMapStore((state) => state.isCentering);
  const previewPinMode = useMapStore((state) => state.previewPinMode);
  const previewPinCoordinates = useMapStore((state) => state.previewPinCoordinates);
  const lastUsedPinType = useMapStore((state) => state.lastUsedPinType);
  const setSelectedPin = useMapStore((state) => state.setSelectedPin);
  const setAutoCenterMode = useMapStore((state) => state.setAutoCenterMode);
  const setCentering = useMapStore((state) => state.setCentering);
  const enterPreviewMode = useMapStore((state) => state.enterPreviewMode);
  const exitPreviewMode = useMapStore((state) => state.exitPreviewMode);
  const setPreviewPinCoordinates = useMapStore((state) => state.setPreviewPinCoordinates);
  const setLastUsedPinType = useMapStore((state) => state.setLastUsedPinType);
  
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

  // GraphQL mutation for creating pins
  const [createPin] = useMutation<CreatePinMutationResponse, CreatePinMutationVariables>(
    CREATE_PIN_MUTATION,
    {
      onCompleted: () => {
        // Refetch pins after creation
        refetch();
      },
      onError: (error) => {
        Alert.alert('Error', `Failed to create pin: ${error.message}`);
      },
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
    
    // Update preview pin coordinates if in preview mode (debounced)
    if (previewPinMode) {
      if (previewCoordinateTimeoutRef.current) {
        clearTimeout(previewCoordinateTimeoutRef.current);
      }
      
      previewCoordinateTimeoutRef.current = setTimeout(() => {
        setPreviewPinCoordinates({
          latitude: newRegion.latitude,
          longitude: newRegion.longitude,
        });
      }, 100); // Shorter debounce for preview updates
    }
  }, [debouncedFetchPins, previewPinMode, setPreviewPinCoordinates]);

  // Handle marker press
  const handleMarkerPress = useCallback((pin: Pin) => {
    // Disable pin selection during preview mode
    if (previewPinMode) return;
    setSelectedPin(pin.id);
  }, [setSelectedPin, previewPinMode]);

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
    
    // Enter preview mode with current map center coordinates
    enterPreviewMode({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  }, [projectsData, region, enterPreviewMode]);

  // Handle preview pin confirmation
  const handlePreviewPinConfirm = useCallback((coordinates: { latitude: number; longitude: number }, pinType: string) => {
    setLastUsedPinType(pinType);
    exitPreviewMode();
    setIsPinEditorVisible(true);
  }, [setLastUsedPinType, exitPreviewMode]);

  // Handle quick add pin
  const handleQuickAddPin = useCallback(async (coordinates: { latitude: number; longitude: number }, pinType: string) => {
    if (!projectsData?.myProjects || projectsData.myProjects.length === 0) {
      Alert.alert('No Projects', 'You need to create a project first before adding pins.');
      return;
    }

    // Use the first project for quick add
    const projectId = projectsData.myProjects[0].id;
    
    try {
      // Create pin with minimal data
      const pinData = {
        name: `New ${pinType}`,
        description: `Quickly added ${pinType}`,
        pinType,
        status: 'active',
        projectId,
        isPublic: false,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };

      console.log('Creating quick add pin with data:', pinData);

      // Call the create pin mutation
      const result = await createPin({
        variables: {
          input: pinData,
        },
      });

      console.log('Quick add pin created successfully:', result);

      // Small delay to ensure database transaction is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Explicitly refetch pins to ensure the new pin appears on the map
      await refetch({
        mapBounds: {
          ...mapBounds,
          projectId: selectedProjectId,
        },
      });

      console.log('Refetched pins after quick add');

      Alert.alert('Success', `Quickly added ${pinType} at the selected location!`);
      setLastUsedPinType(pinType);
      exitPreviewMode();
    } catch (error) {
      console.error('Quick add pin error:', error);
      Alert.alert('Error', 'Failed to create pin. Please try again.');
    }
  }, [projectsData, setLastUsedPinType, exitPreviewMode, createPin, refetch, mapBounds, selectedProjectId]);

  // Handle preview pin cancel
  const handlePreviewPinCancel = useCallback(() => {
    exitPreviewMode();
  }, [exitPreviewMode]);

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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (previewCoordinateTimeoutRef.current) {
        clearTimeout(previewCoordinateTimeoutRef.current);
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
        onPress={previewPinMode ? (event) => {
          // Tap to place preview pin
          const { coordinate } = event.nativeEvent;
          setPreviewPinCoordinates({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          });
        } : undefined}
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
        
        {/* Preview Pin Marker */}
        {previewPinMode && previewPinCoordinates && (
          <PreviewPinMarker
            coordinates={previewPinCoordinates}
            pinType={lastUsedPinType}
          />
        )}
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

      {/* Preview Pin Controls */}
      {previewPinMode && previewPinCoordinates && (
        <PreviewPinControls
          coordinates={previewPinCoordinates}
          onConfirm={handlePreviewPinConfirm}
          onQuickAdd={handleQuickAddPin}
          onCancel={handlePreviewPinCancel}
          initialPinType={lastUsedPinType}
        />
      )}

      {/* Pin Editor Modal */}
      <PinEditorForm
        visible={isPinEditorVisible}
        onClose={handlePinEditorClose}
        projects={projectsData?.myProjects || []}
        mode="create"
        latitude={previewPinCoordinates?.latitude || region.latitude}
        longitude={previewPinCoordinates?.longitude || region.longitude}
        initialData={previewPinCoordinates ? { pinType: lastUsedPinType } : undefined}
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