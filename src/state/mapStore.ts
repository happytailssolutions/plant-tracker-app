import { create } from 'zustand';
import { Region } from 'react-native-maps';

type AutoCenterMode = 'project-pins' | 'user-location' | null;

interface PreviewPinCoordinates {
  latitude: number;
  longitude: number;
}

interface MapState {
  // State
  selectedProjectId: string | null;
  selectedPinId: string | null;
  region: Region | null;
  autoCenterMode: AutoCenterMode;
  isCentering: boolean;
  
  // Preview Pin State
  previewPinMode: boolean;
  previewPinCoordinates: PreviewPinCoordinates | null;
  lastUsedPinType: string;
  
  // Actions
  setSelectedProject: (projectId: string | null) => void;
  setSelectedPin: (pinId: string | null) => void;
  setRegion: (region: Region) => void;
  setAutoCenterMode: (mode: AutoCenterMode) => void;
  setCentering: (isCentering: boolean) => void;
  setProjectAndNavigate: (projectId: string) => void;
  clearSelection: () => void;
  resetMapState: () => void;
  
  // Preview Pin Actions
  setPreviewPinMode: (active: boolean) => void;
  setPreviewPinCoordinates: (coordinates: PreviewPinCoordinates) => void;
  setLastUsedPinType: (pinType: string) => void;
  enterPreviewMode: (coordinates: PreviewPinCoordinates) => void;
  exitPreviewMode: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  selectedProjectId: null,
  selectedPinId: null,
  region: null,
  autoCenterMode: null,
  isCentering: false,
  
  // Preview Pin Initial State
  previewPinMode: false,
  previewPinCoordinates: null,
  lastUsedPinType: 'plant',
  
  // Actions
  setSelectedProject: (projectId: string | null) => 
    set({ selectedProjectId: projectId }),
    
  setSelectedPin: (pinId: string | null) => 
    set({ selectedPinId: pinId }),
    
  setRegion: (region: Region) => 
    set({ region }),
    
  setAutoCenterMode: (mode: AutoCenterMode) => 
    set({ autoCenterMode: mode }),
    
  setCentering: (isCentering: boolean) => 
    set({ isCentering }),
    
  setProjectAndNavigate: (projectId: string) => 
    set({ 
      selectedProjectId: projectId,
      autoCenterMode: 'project-pins',
      isCentering: true,
    }),
    
  clearSelection: () => 
    set({
      selectedProjectId: null,
      selectedPinId: null,
      autoCenterMode: null,
    }),
    
  resetMapState: () => 
    set({
      selectedProjectId: null,
      selectedPinId: null,
      region: null,
      autoCenterMode: null,
      isCentering: false,
      previewPinMode: false,
      previewPinCoordinates: null,
      lastUsedPinType: 'plant',
    }),
    
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