import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'expo-router';
import { PINS_QUERY, PINS_BY_PROJECT_QUERY, PinsInBoundsQueryResponse, PinsByProjectQueryResponse, MapBounds, Pin } from '../api/queries/pinQueries';
import { MY_PROJECTS_QUERY, MyProjectsQueryResponse } from '../api/queries/projectQueries';
import { CREATE_PIN_MUTATION, CreatePinMutationResponse, CreatePinMutationVariables } from '../api/mutations/pinMutations';
import { MapMarker, LayerSwitcher, CenterPinIcon, PinCreationControls } from '../components/map';
import { PinEditorForm, PinDetailSheet } from '../components/pins';
import { TagBubble, TagSelectionModal } from '../components/common';
import { colors, spacing, components, typography } from '../styles/theme';
import { useMapStore } from '../state/mapStore';
import { useLocation } from '../hooks/useLocation';
import { calculateBoundsFromPins, createRegionFromCoordinates, validateRegion, DEFAULT_REGION } from '../utils/mapUtils';
import { filterPinsByTags, extractUniqueTags } from '../utils/tagUtils';

// Debounce delay for map region changes (in milliseconds)
const DEBOUNCE_DELAY = 500;

export const MapScreen: React.FC = () => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  

  const [isPinEditorVisible, setIsPinEditorVisible] = useState(false);
  const [showPinCreationControls, setShowPinCreationControls] = useState(false);
  const [selectedPinTypeForEditor, setSelectedPinTypeForEditor] = useState<string>('tree');
  const [selectedStatusForEditor, setSelectedStatusForEditor] = useState<string>('Growing');
  const [mapBounds, setMapBounds] = useState<MapBounds>({
    north: region.latitude + region.latitudeDelta / 2,
    south: region.latitude - region.latitudeDelta / 2,
    east: region.longitude + region.longitudeDelta / 2,
    west: region.longitude - region.longitudeDelta / 2,
  });

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  
  // Map store state
  const selectedProjectId = useMapStore((state) => state.selectedProjectId);
  const selectedPinId = useMapStore((state) => state.selectedPinId);
  const selectedTags = useMapStore((state) => state.selectedTags);
  const autoCenterMode = useMapStore((state) => state.autoCenterMode);
  const isCentering = useMapStore((state) => state.isCentering);
  const pinCreationMode = useMapStore((state) => state.pinCreationMode);
  const lastUsedPinType = useMapStore((state) => state.lastUsedPinType);
  const isTagSelectionOpen = useMapStore((state) => state.isTagSelectionOpen);
  const availableTags = useMapStore((state) => state.availableTags);
  const setSelectedPin = useMapStore((state) => state.setSelectedPin);
  const addSelectedTag = useMapStore((state) => state.addSelectedTag);
  const removeSelectedTag = useMapStore((state) => state.removeSelectedTag);
  const clearSelectedTags = useMapStore((state) => state.clearSelectedTags);
  const setTagAndNavigate = useMapStore((state) => state.setTagAndNavigate);
  const setAutoCenterMode = useMapStore((state) => state.setAutoCenterMode);
  const setCentering = useMapStore((state) => state.setCentering);
  const enterPinCreation = useMapStore((state) => state.enterPinCreation);
  const exitPinCreation = useMapStore((state) => state.exitPinCreation);
  const setLastUsedPinType = useMapStore((state) => state.setLastUsedPinType);
  const openTagSelection = useMapStore((state) => state.openTagSelection);
  const closeTagSelection = useMapStore((state) => state.closeTagSelection);
  const setAvailableTags = useMapStore((state) => state.setAvailableTags);
  const mapType = useMapStore((state) => state.mapType);
  const setMapType = useMapStore((state) => state.setMapType);
  
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

  // GraphQL query for fetching all pins of the selected project (for centering and tag extraction)
  const { data: projectPinsData, loading: projectPinsLoading } = useQuery<PinsByProjectQueryResponse>(
    PINS_BY_PROJECT_QUERY,
    {
      variables: { projectId: selectedProjectId! },
      skip: !selectedProjectId,
      fetchPolicy: 'cache-and-network',
    }
  );

  // Extract available tags from project pins
  useEffect(() => {
    if (projectPinsData?.pinsByProject) {
      const tags = extractUniqueTags(projectPinsData.pinsByProject);
      setAvailableTags(tags);
    }
  }, [projectPinsData, setAvailableTags]);

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
    
    // No need to update preview coordinates in the new flow
  }, [debouncedFetchPins]);

  // Handle marker press
  const handleMarkerPress = useCallback((pin: Pin) => {
    // Disable pin selection during pin creation mode
    if (pinCreationMode) return;
    setSelectedPin(pin.id);
  }, [setSelectedPin, pinCreationMode]);

  // Handle FAB press to start pin creation
  const handleCreatePin = useCallback(() => {
    if (!projectsData?.myProjects || projectsData.myProjects.length === 0) {
      Alert.alert(
        'No Projects',
        'You need to create a project first before adding pins.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    // Enter pin creation mode - shows center pin icon and changes FAB to ADD
    enterPinCreation();
  }, [projectsData, enterPinCreation]);

  // Handle ADD button press to show pin creation controls
  const handleAddPin = useCallback(() => {
    // Show the PinCreationControls with current map center
    setShowPinCreationControls(true);
  }, []);



  // Handle quick add pin - UNUSED, will be removed
  const handleQuickAddPin = useCallback(async (coordinates: { latitude: number; longitude: number }, pinType: string) => {
    if (!selectedProjectId) {
      Alert.alert('No Project Selected', 'Please select a project first before adding pins.');
      return;
    }

    if (!projectsData?.myProjects || projectsData.myProjects.length === 0) {
      Alert.alert('No Projects', 'You need to create a project first before adding pins.');
      return;
    }

    console.log('Quick add using project ID:', selectedProjectId);
    
    try {
      // Find the selected project to inherit its isPublic setting
      const selectedProject = projectsData.myProjects.find(p => p.id === selectedProjectId);
      const isPublic = selectedProject?.isPublic || false;

      // Create pin with minimal data
      const pinData = {
        name: `New ${pinType}`,
        description: `Quickly added ${pinType}`,
        pinType,
        status: 'active',
        projectId: selectedProjectId,
        isPublic: isPublic, // Inherit from project settings
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
      exitPinCreation();
    } catch (error) {
      console.error('Quick add pin error:', error);
      Alert.alert('Error', 'Failed to create pin. Please try again.');
    }
  }, [selectedProjectId, projectsData, setLastUsedPinType, exitPinCreation, createPin, refetch, mapBounds]);

  // Handle pin creation cancel
  const handlePinCreationCancel = useCallback(() => {
    setShowPinCreationControls(false);
    exitPinCreation();
  }, [exitPinCreation]);

  // Handle pin creation confirm - opens full editor
  const handlePinCreationConfirm = useCallback((coordinates: { latitude: number; longitude: number }, pinType: string, status: string) => {
    setLastUsedPinType(pinType);
    setSelectedPinTypeForEditor(pinType);
    setSelectedStatusForEditor(status);
    setShowPinCreationControls(false);
    setIsPinEditorVisible(true);
  }, [setLastUsedPinType]);

  // Handle pin creation quick add
  const handlePinCreationQuickAdd = useCallback(async (coordinates: { latitude: number; longitude: number }, pinType: string, status: string) => {
    if (!selectedProjectId) {
      Alert.alert('No Project Selected', 'Please select a project first before adding pins.');
      return;
    }

    if (!projectsData?.myProjects || projectsData.myProjects.length === 0) {
      Alert.alert('No Projects', 'You need to create a project first before adding pins.');
      return;
    }

    try {
      // Find the selected project to inherit its isPublic setting
      const selectedProject = projectsData.myProjects.find(p => p.id === selectedProjectId);
      const isPublic = selectedProject?.isPublic || false;

      // Create pin with minimal data
      const pinData = {
        name: `New ${pinType}`,
        description: `Quickly added ${pinType}`,
        pinType,
        status,
        projectId: selectedProjectId,
        isPublic: isPublic, // Inherit from project settings
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };

      // Call the create pin mutation
      const result = await createPin({
        variables: {
          input: pinData,
        },
      });

      // Small delay to ensure database transaction is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Explicitly refetch pins to ensure the new pin appears on the map
      await refetch({
        mapBounds: {
          ...mapBounds,
          projectId: selectedProjectId,
        },
      });

      Alert.alert('Success', `Quickly added ${pinType} at the selected location!`);
      setLastUsedPinType(pinType);
      setShowPinCreationControls(false);
      exitPinCreation();
    } catch (error) {
      console.error('Quick add pin error:', error);
      Alert.alert('Error', 'Failed to create pin. Please try again.');
    }
  }, [selectedProjectId, projectsData, setLastUsedPinType, exitPinCreation, createPin, refetch, mapBounds]);

  // Handle pin editor close
  const handlePinEditorClose = useCallback(() => {
    setIsPinEditorVisible(false);
    exitPinCreation(); // Exit creation mode when closing editor
  }, [exitPinCreation]);

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

    // If there's a tag filter, use the filtered pins for centering
    const pinsToCenter = selectedTags.length > 0 ? filterPinsByTags(pins, selectedTags) : pins;
    
    if (pinsToCenter.length === 0) {
      // No pins match the tag filter, center on user location
      setAutoCenterMode('user-location');
      return;
    }

    const newRegion = calculateBoundsFromPins(pinsToCenter);
    
    if (validateRegion(newRegion)) {
      // For single pins, use a more reasonable zoom level
      const adjustedRegion = pinsToCenter.length === 1 ? {
        ...newRegion,
        latitudeDelta: 0.05, // Zoom out more to see the pin clearly
        longitudeDelta: 0.05,
      } : newRegion;
      
      // Set the region state first
      setRegion(adjustedRegion);
      
      // Then animate to the region with a delay to ensure mapRef is ready
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateToRegion(adjustedRegion, 1500);
        }
      }, 100);
    }
    
    setCentering(false);
    setAutoCenterMode(null);
  }, [setAutoCenterMode, setCentering, selectedTags]);

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
  }, [isCentering, autoCenterMode, projectPinsData, centerMapOnProjectPins, centerMapOnUserLocation, selectedTags]);

  // Cleanup timeouts on unmount
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

  const handleSelectProject = () => {
    router.push('/(tabs)/');
  };

  const renderNoProjectSelected = () => (
    <View style={styles.noProjectContainer}>
      <Text style={styles.noProjectTitle}>No Project Selected</Text>
      <Text style={styles.noProjectSubtitle}>
        Please select a project to view its map
      </Text>
      <TouchableOpacity style={styles.selectProjectButton} onPress={handleSelectProject}>
        <Text style={styles.selectProjectButtonText}>Select Project</Text>
      </TouchableOpacity>
    </View>
  );

  // If no project is selected, show the no project message
  if (!selectedProjectId) {
    return (
      <View style={styles.container}>
        {renderNoProjectSelected()}
      </View>
    );
  }

  const allPins = data?.pinsInBounds || [];
  const pins = filterPinsByTags(allPins, selectedTags);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={pinCreationMode ? (event) => {
          // In creation mode, map taps are allowed for repositioning
          // The center pin icon shows the selected location
        } : undefined}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType={mapType}
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
            <Text style={styles.pinCountText}>
              {selectedTags.length > 0 
                ? `${pins.length} pins with ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`
                : `${pins.length} pins`
              }
            </Text>
          </View>
        </View>
      )}

      {/* Tag filter bar - always visible */}
      {selectedProjectId && (
        <View style={styles.tagFilterContainer}>
          <View style={styles.tagFilterBadge}>
            {selectedTags.map((tag, index) => (
              <TagBubble
                key={`${tag}-${index}`}
                tag={tag}
                selected={true}
                removable={true}
                onRemove={() => removeSelectedTag(tag)}
              />
            ))}
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={openTagSelection}
            >
              <Text style={styles.addTagButtonText}>Add Tag</Text>
            </TouchableOpacity>
            {selectedTags.length > 0 && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={clearSelectedTags}
              >
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Layer Switcher */}
      <LayerSwitcher
        currentMapType={mapType}
        onMapTypeChange={setMapType}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={pinCreationMode ? handleAddPin : handleCreatePin}
        activeOpacity={0.8}
      >
        <Text style={pinCreationMode ? styles.fabTextAdd : styles.fabText}>
          {pinCreationMode ? 'ADD' : '+'}
        </Text>
      </TouchableOpacity>

      {/* Center Pin Icon - shows when in creation mode */}
      <CenterPinIcon visible={pinCreationMode} />

      {/* Pin Creation Controls */}
      {showPinCreationControls && (
        <PinCreationControls
          coordinates={{
            latitude: region.latitude,
            longitude: region.longitude
          }}
          onConfirm={handlePinCreationConfirm}
          onQuickAdd={handlePinCreationQuickAdd}
          onCancel={handlePinCreationCancel}
          initialPinType={lastUsedPinType}
          initialStatus="Growing"
        />
      )}

             {/* Pin Editor Modal */}
       <PinEditorForm
         visible={isPinEditorVisible}
         onClose={handlePinEditorClose}
         projects={projectsData?.myProjects || []}
         mode="create"
         latitude={region.latitude}
         longitude={region.longitude}
         initialData={{
            pinType: selectedPinTypeForEditor,
            status: selectedStatusForEditor,
            projectId: selectedProjectId || undefined,
            isPublic: projectsData?.myProjects?.find(p => p.id === selectedProjectId)?.isPublic || false
          }}
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

      {/* Tag Selection Modal */}
      <TagSelectionModal
        visible={isTagSelectionOpen}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagSelect={setTagAndNavigate}
        onClose={closeTagSelection}
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
    top: spacing.xl + 48, // Move below tags bar (xl + estimated tag bar height)
    left: spacing.lg,
  },
  pinCountBadge: {
    backgroundColor: colors.primary.darkGreen,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pinCountText: {
    ...typography.textStyles.caption, // 12px/16px, Medium, Letter spacing 0.2px - same as tags
    color: colors.background.white,
    fontWeight: typography.fontWeight.medium, // 500 - consistent with tags and buttons
  },
  tagFilterContainer: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
  },
  tagFilterBadge: {
    backgroundColor: 'transparent',
    borderRadius: spacing.sm,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  addTagButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingHorizontal: spacing.md, // 16dp horizontal padding per Terra design
    paddingVertical: spacing.sm, // 8dp vertical padding
    borderRadius: spacing.sm, // 8dp corner radius per Terra design
    marginLeft: spacing.xs,
    minHeight: 32, // Consistent height with tag bubbles
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    ...typography.textStyles.caption, // 12px/16px, Medium, Letter spacing 0.2px
    color: colors.background.white,
    fontWeight: typography.fontWeight.medium, // 500
  },
  clearFilterButton: {
    backgroundColor: colors.functional.error,
    paddingHorizontal: spacing.md, // 16dp horizontal padding per Terra design
    paddingVertical: spacing.sm, // 8dp vertical padding
    borderRadius: spacing.sm, // 8dp corner radius per Terra design
    marginLeft: spacing.xs,
    minHeight: 32, // Consistent height with tag bubbles
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearFilterText: {
    ...typography.textStyles.caption, // 12px/16px, Medium, Letter spacing 0.2px
    color: colors.background.white,
    fontWeight: typography.fontWeight.medium, // 500
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
  fabTextAdd: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background.white,
    lineHeight: 14,
  },
  noProjectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.light,
  },
  noProjectTitle: {
    ...typography.textStyles.h2,
    color: colors.functional.darkGray,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noProjectSubtitle: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  selectProjectButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
  },
  selectProjectButtonText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
}); 