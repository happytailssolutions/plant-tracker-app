import { create } from 'zustand';

interface MapState {
  // State
  selectedProjectId: string | null;
  selectedPinId: string | null;
  
  // Actions
  setSelectedProject: (projectId: string | null) => void;
  setSelectedPin: (pinId: string | null) => void;
  clearSelection: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  selectedProjectId: null,
  selectedPinId: null,
  
  // Actions
  setSelectedProject: (projectId: string | null) => 
    set({ selectedProjectId: projectId }),
    
  setSelectedPin: (pinId: string | null) => 
    set({ selectedPinId: pinId }),
    
  clearSelection: () => 
    set({
      selectedProjectId: null,
      selectedPinId: null,
    }),
})); 