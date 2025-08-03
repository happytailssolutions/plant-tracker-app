import { create } from 'zustand';
import { Region } from 'react-native-maps';

type AutoCenterMode = 'project-pins' | 'user-location' | null;

interface MapState {
  // State
  selectedProjectId: string | null;
  selectedPinId: string | null;
  region: Region | null;
  autoCenterMode: AutoCenterMode;
  isCentering: boolean;
  
  // Actions
  setSelectedProject: (projectId: string | null) => void;
  setSelectedPin: (pinId: string | null) => void;
  setRegion: (region: Region) => void;
  setAutoCenterMode: (mode: AutoCenterMode) => void;
  setCentering: (isCentering: boolean) => void;
  setProjectAndNavigate: (projectId: string) => void;
  clearSelection: () => void;
  resetMapState: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  selectedProjectId: null,
  selectedPinId: null,
  region: null,
  autoCenterMode: null,
  isCentering: false,
  
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
    }),
})); 