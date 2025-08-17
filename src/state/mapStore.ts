import { create } from 'zustand';
import { Region } from 'react-native-maps';

type AutoCenterMode = 'project-pins' | 'user-location' | null;
type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';



interface MapState {
  // State
  selectedProjectId: string | null;
  selectedPinId: string | null;
  selectedTags: string[];
  region: Region | null;
  autoCenterMode: AutoCenterMode;
  isCentering: boolean;
  mapType: MapType;
  
  // Pin Filtering State
  filteredPinId: string | null;
  
  // Tag Selection Modal State
  isTagSelectionOpen: boolean;
  availableTags: string[];
  
  // Pin Creation State
  pinCreationMode: boolean;
  lastUsedPinType: string;
  
  // Reminder Indicators State
  pinsWithReminders: Set<string>;
  pinsWithOverdueReminders: Set<string>;
  
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
  
  // Pin Creation Actions
  setPinCreationMode: (active: boolean) => void;
  setLastUsedPinType: (pinType: string) => void;
  enterPinCreation: () => void;
  exitPinCreation: () => void;
  
  // Pin Centering Actions
  centerOnPin: (pinId: string, latitude: number, longitude: number) => void;
  
  // Pin Filtering Actions
  setPinFilter: (pinId: string | null) => void;
  
  // Reminder Indicator Actions
  setPinsWithReminders: (pinIds: string[]) => void;
  setPinsWithOverdueReminders: (pinIds: string[]) => void;
  addPinReminder: (pinId: string, isOverdue?: boolean) => void;
  removePinReminder: (pinId: string) => void;
  clearReminderIndicators: () => void;
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
  
  // Pin Filtering Initial State
  filteredPinId: null,
  
  // Tag Selection Modal Initial State
  isTagSelectionOpen: false,
  availableTags: [],
  
  // Pin Creation Initial State
  pinCreationMode: false,
  lastUsedPinType: 'Tree',
  
  // Reminder Indicators Initial State
  pinsWithReminders: new Set<string>(),
  pinsWithOverdueReminders: new Set<string>(),
  
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
      selectedTags: state.selectedTags.filter(t => t !== tag),
      selectedPinId: null, // Clear selected pin when filtering changes
      autoCenterMode: 'project-pins',
      isCentering: true,
    })),
    
  clearSelectedTags: () => 
    set({ 
      selectedTags: [],
      selectedPinId: null, // Clear selected pin when clearing filters
      filteredPinId: null, // Clear pin filter when clearing tags
      autoCenterMode: 'project-pins',
      isCentering: true,
    }),
    
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
      filteredPinId: null,
      autoCenterMode: null,
    }),
    
  resetMapState: () => 
    set({
      selectedProjectId: null,
      selectedPinId: null,
      selectedTags: [],
      filteredPinId: null,
      region: null,
      autoCenterMode: null,
      isCentering: false,
      mapType: 'satellite',
      isTagSelectionOpen: false,
      availableTags: [],
      pinCreationMode: false,
      lastUsedPinType: 'Tree',
    }),
    
  // Tag Selection Modal Actions
  openTagSelection: () => 
    set({ isTagSelectionOpen: true }),
    
  closeTagSelection: () => 
    set({ isTagSelectionOpen: false }),
    
  setAvailableTags: (tags: string[]) => 
    set({ availableTags: tags }),
    
  // Pin Creation Actions
  setPinCreationMode: (active: boolean) => 
    set({ pinCreationMode: active }),
    
  setLastUsedPinType: (pinType: string) => 
    set({ lastUsedPinType: pinType }),
    
  enterPinCreation: () => 
    set({ 
      pinCreationMode: true,
      selectedPinId: null, // Clear any selected pin
    }),
    
  exitPinCreation: () => 
    set({ 
      pinCreationMode: false
    }),
    
  // Pin Centering Actions
  centerOnPin: (pinId: string, latitude: number, longitude: number) => 
    set({ 
      selectedPinId: null, // Don't keep the pin selected when centering
      filteredPinId: pinId,
      autoCenterMode: 'project-pins',
      isCentering: true,
    }),
    
  // Pin Filtering Actions
  setPinFilter: (pinId: string | null) => 
    set({ 
      selectedPinId: pinId,
      filteredPinId: pinId,
      // When filtering by pin, also set centering mode
      autoCenterMode: pinId ? 'project-pins' : null,
      isCentering: pinId ? true : false,
    }),
    
  // Reminder Indicator Actions
  setPinsWithReminders: (pinIds: string[]) => 
    set({ pinsWithReminders: new Set(pinIds) }),
    
  setPinsWithOverdueReminders: (pinIds: string[]) => 
    set({ pinsWithOverdueReminders: new Set(pinIds) }),
    
  addPinReminder: (pinId: string, isOverdue = false) => 
    set((state) => {
      const newPinsWithReminders = new Set(state.pinsWithReminders);
      const newPinsWithOverdueReminders = new Set(state.pinsWithOverdueReminders);
      
      newPinsWithReminders.add(pinId);
      if (isOverdue) {
        newPinsWithOverdueReminders.add(pinId);
      }
      
      return {
        pinsWithReminders: newPinsWithReminders,
        pinsWithOverdueReminders: newPinsWithOverdueReminders,
      };
    }),
    
  removePinReminder: (pinId: string) => 
    set((state) => {
      const newPinsWithReminders = new Set(state.pinsWithReminders);
      const newPinsWithOverdueReminders = new Set(state.pinsWithOverdueReminders);
      
      newPinsWithReminders.delete(pinId);
      newPinsWithOverdueReminders.delete(pinId);
      
      return {
        pinsWithReminders: newPinsWithReminders,
        pinsWithOverdueReminders: newPinsWithOverdueReminders,
      };
    }),
    
  clearReminderIndicators: () => 
    set({ 
      pinsWithReminders: new Set<string>(),
      pinsWithOverdueReminders: new Set<string>(),
    }),
})); 