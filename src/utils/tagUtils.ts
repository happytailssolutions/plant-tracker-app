import { Pin } from '../api/queries/pinQueries';

/**
 * Extract tags from a pin's metadata
 */
export const getCurrentTags = (pin: Pin): string[] => {
  if (!pin.metadata) return [];
  const metadata = pin.metadata as any;
  return metadata.tags || [];
};

/**
 * Extract all unique tags from an array of pins
 */
export const extractUniqueTags = (pins: Pin[]): string[] => {
  const allTags = new Set<string>();
  
  pins.forEach(pin => {
    const pinTags = getCurrentTags(pin);
    pinTags.forEach(tag => allTags.add(tag));
  });
  
  return Array.from(allTags).sort();
};

/**
 * Filter pins by multiple tags using AND logic (pins must have ALL selected tags)
 */
export const filterPinsByTags = (pins: Pin[], selectedTags: string[]): Pin[] => {
  if (selectedTags.length === 0) return pins;
  
  return pins.filter(pin => {
    const pinTags = getCurrentTags(pin);
    return selectedTags.every(selectedTag => pinTags.includes(selectedTag));
  });
}; 