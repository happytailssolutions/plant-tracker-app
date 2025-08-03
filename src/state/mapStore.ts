import { create } from 'zustand';
import { Region } from 'react-native-maps';

type AutoCenterMode = 'project-pins' | 'user-location' | null;
type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';

interface PreviewPinCoordinates {
  latitude: number;
  longitude: number;
}

interface MapState {
  // State
  selectedProjectId: string | null;
  selectedPinId: string | null;
  selectedTags: string[];
  region: Region | null;
  autoCenterMode: AutoCenterMode;
  isCentering: boolean;
  mapType: MapType;
  
  // Tag Selection Modal State
  isTagSelectionOpen: boolean;
  availableTags: string[];
  
  // Preview Pin State
  previewPinMode: boolean;
  previewPinCoordinates: PreviewPinCoordinates | null;
  lastUsedPinType: string;
  
  // Actions
  setSelectedProject: (projectId: string | null) => void;
  setSelectedPin: (pinId: string | null) => void;
  addSelectedTag: (tag: string) => void;
  removeSelectedTag: (tag: string) => void;
  clearSelectedTags: () => void;
  setRegion: (region: Region) => void;
  setAutoCenterMode: (mode: AutoCenterMode) => void;
  setCentering: (isCentering: boolean) => void;
  setMapType: (mapType: MapType) => void;
  setProjectAndNavigate: (projectId: string) => void;
  setTagAndNavigate: (tag: string) => void;
  clearSelection: () => void;
  resetMapState: () => void;
  
  // Tag Selection Modal Actions
  openTagSelection: () => void;
  closeTagSelection: () => void;
  setAvailableTags: (tags: string[]) => void;
  
  // Preview Pin Actions
  setPreviewPinMode: (active: boolean) => void;
  setPreviewPinCoordinates: (coordinates: PreviewPinCoordinates) => void;
  setLastUsedPinType: (pinType: string) => void;
  enterPreviewMode: (coordinates: PreviewPinCoordinates) => void;
  exitPreviewMode: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  // Initial state
  selectedProjectId: null,
  selectedPinId: null,
  selectedTags: [],
  region: null,
  autoCenterMode: null,
  isCentering: false,
  mapType: 'satellite',
  
  // Tag Selection Modal Initial State
  isTagSelectionOpen: false,
  availableTags: [],
  
  // Preview Pin Initial State
  previewPinMode: false,
  previewPinCoordinates: null,
  lastUsedPinType: 'plant',
  
  // Actions
  setSelectedProject: (projectId: string | null) => 
    set({ selectedProjectId: projectId }),
    
  setSelectedPin: (pinId: string | null) => 
    set({ selectedPinId: pinId }),
    
  addSelectedTag: (tag: string) => 
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag) 
        ? state.selectedTags 
        : [...state.selectedTags, tag]
    })),
    
  removeSelectedTag: (tag: string) => 
    set((state) => ({
      selectedTags: state.selectedTags.filter(t => t !== tag)
    })),
    
  clearSelectedTags: () => 
    set({ selectedTags: [] }),
    
  setRegion: (region: Region) => 
    set({ region }),
    
  setAutoCenterMode: (mode: AutoCenterMode) => 
    set({ autoCenterMode: mode }),
    
  setCentering: (isCentering: boolean) => 
    set({ isCentering }),
    
  setMapType: (mapType: MapType) => 
    set({ mapType }),
    
  setProjectAndNavigate: (projectId: string) => 
    set({ 
      selectedProjectId: projectId,
      selectedTags: [], // Clear tag filters when switching projects
      autoCenterMode: 'project-pins',
      isCentering: true,
    }),
    
  setTagAndNavigate: (tag: string) => 
    set({ 
      selectedTags: [tag], // Replace with single tag for backward compatibility
      selectedPinId: null, // Clear selected pin when filtering by tag
      autoCenterMode: 'project-pins',
      isCentering: true,
    }),
    
  clearSelection: () => 
    set({
      selectedProjectId: null,
      selectedPinId: null,
      selectedTags: [],
      autoCenterMode: null,
    }),
    
  resetMapState: () => 
    set({
      selectedProjectId: null,
      selectedPinId: null,
      selectedTags: [],
      region: null,
      autoCenterMode: null,
      isCentering: false,
      mapType: 'satellite',
      isTagSelectionOpen: false,
      availableTags: [],
      previewPinMode: false,
      previewPinCoordinates: null,
      lastUsedPinType: 'plant',
    }),
    
  // Tag Selection Modal Actions
  openTagSelection: () => 
    set({ isTagSelectionOpen: true }),
    
  closeTagSelection: () => 
    set({ isTagSelectionOpen: false }),
    
  setAvailableTags: (tags: string[]) => 
    set({ availableTags: tags }),
    
  // Preview Pin Actions
  setPreviewPinMode: (active: boolean) => 
    set({ previewPinMode: active }),
    
  setPreviewPinCoordinates: (coordinates: PreviewPinCoordinates) => 
    set({ previewPinCoordinates: coordinates }),
    
  setLastUsedPinType: (pinType: string) => 
    set({ lastUsedPinType: pinType }),
    
  enterPreviewMode: (coordinates: PreviewPinCoordinates) => 
    set({ 
      previewPinMode: true, 
      previewPinCoordinates: coordinates,
      selectedPinId: null, // Clear any selected pin
    }),
    
  exitPreviewMode: () => 
    set({ 
      previewPinMode: false, 
      previewPinCoordinates: null 
    }),
})); 