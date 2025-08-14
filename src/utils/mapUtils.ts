import { Region } from 'react-native-maps';
import { Pin } from '../api/queries/pinQueries';

// Default region when no valid data is available
export const DEFAULT_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Minimum and maximum zoom levels (delta values)
export const ZOOM_LEVELS = {
  MIN: 0.001, // Very zoomed in
  MAX: 180,   // Very zoomed out
  DEFAULT: 0.0922,
};

/**
 * Calculate the optimal region to show all pins
 */
export const calculateBoundsFromPins = (pins: Pin[]): Region => {
  if (!pins || pins.length === 0) {
    return DEFAULT_REGION;
  }

  if (pins.length === 1) {
    const pin = pins[0];
    return {
      latitude: pin.latitude,
      longitude: pin.longitude,
      latitudeDelta: ZOOM_LEVELS.MIN, // Maximum zoom for single pin
      longitudeDelta: ZOOM_LEVELS.MIN,
    };
  }

  // Calculate bounds
  const latitudes = pins.map(pin => pin.latitude);
  const longitudes = pins.map(pin => pin.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  // Calculate center
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Calculate deltas with padding
  const latDelta = (maxLat - minLat) * 1.2; // 20% padding
  const lngDelta = (maxLng - minLng) * 1.2; // 20% padding

  // Ensure minimum zoom level (maximum zoom in)
  const finalLatDelta = Math.max(latDelta, ZOOM_LEVELS.MIN);
  const finalLngDelta = Math.max(lngDelta, ZOOM_LEVELS.MIN);

  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: finalLatDelta,
    longitudeDelta: finalLngDelta,
  };
};

/**
 * Calculate optimal zoom level based on pin distribution
 */
export const calculateOptimalZoom = (pins: Pin[]): number => {
  if (!pins || pins.length === 0) {
    return ZOOM_LEVELS.DEFAULT;
  }

  if (pins.length === 1) {
    return ZOOM_LEVELS.MIN; // Maximum zoom for single pin
  }

  // Calculate the spread of pins
  const latitudes = pins.map(pin => pin.latitude);
  const longitudes = pins.map(pin => pin.longitude);

  const latSpread = Math.max(...latitudes) - Math.min(...latitudes);
  const lngSpread = Math.max(...longitudes) - Math.min(...longitudes);

  // Use the larger spread to determine zoom
  const maxSpread = Math.max(latSpread, lngSpread);

  // Calculate zoom based on spread with some padding
  let zoom = maxSpread * 1.5; // 50% padding

  // Clamp to reasonable bounds
  zoom = Math.max(zoom, ZOOM_LEVELS.MIN);
  zoom = Math.min(zoom, ZOOM_LEVELS.MAX);

  return zoom;
};

/**
 * Validate if a region has valid coordinates
 */
export const validateRegion = (region: Region): boolean => {
  if (!region) return false;

  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

  // Check for valid numbers
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    typeof latitudeDelta !== 'number' ||
    typeof longitudeDelta !== 'number'
  ) {
    return false;
  }

  // Check for NaN or Infinity
  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    isNaN(latitudeDelta) ||
    isNaN(longitudeDelta) ||
    !isFinite(latitude) ||
    !isFinite(longitude) ||
    !isFinite(latitudeDelta) ||
    !isFinite(longitudeDelta)
  ) {
    return false;
  }

  // Check latitude bounds (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    return false;
  }

  // Check longitude bounds (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    return false;
  }

  // Check delta bounds
  if (latitudeDelta <= 0 || longitudeDelta <= 0) {
    return false;
  }

  return true;
};

/**
 * Create a region from coordinates with default zoom
 */
export const createRegionFromCoordinates = (
  latitude: number,
  longitude: number,
  zoom: number = ZOOM_LEVELS.DEFAULT
): Region => {
  return {
    latitude,
    longitude,
    latitudeDelta: zoom,
    longitudeDelta: zoom,
  };
};

/**
 * Add padding to a region
 */
export const addPaddingToRegion = (region: Region, paddingFactor: number = 1.2): Region => {
  return {
    ...region,
    latitudeDelta: region.latitudeDelta * paddingFactor,
    longitudeDelta: region.longitudeDelta * paddingFactor,
  };
}; 