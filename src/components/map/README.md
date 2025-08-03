# Map Components

This directory contains React Native components for map functionality in the Plant Tracker app.

## Components

### LayerSwitcher
A component that allows users to switch between different map types:
- **Standard**: Default street view with roads and labels
- **Satellite**: Satellite imagery without labels
- **Hybrid**: Satellite imagery with road and label overlays
- **Terrain**: Topographic view showing elevation and terrain features

#### Features
- Floating action button positioned above the main FAB
- Modal interface for selecting map types
- Visual indicators for the currently selected map type
- Consistent with the app's design system
- Supports all react-native-maps map types

#### Usage
```tsx
import { LayerSwitcher } from '../components/map';

<LayerSwitcher
  currentMapType={mapType}
  onMapTypeChange={setMapType}
/>
```

### MapMarker
Displays individual pins on the map with custom styling based on pin type.

### PreviewPinMarker
Shows a preview marker when creating new pins.

### PreviewPinControls
Provides controls for confirming or canceling pin creation in preview mode.

## State Management
Map type state is managed through the `useMapStore` Zustand store:
- `mapType`: Current map type ('standard' | 'satellite' | 'hybrid' | 'terrain')
- `setMapType`: Function to update the map type

## Design System Integration
All components use the app's Terra design system:
- Colors from `colors` theme
- Spacing from `spacing` theme
- Component styles from `components` theme
- Typography from `typography` theme 