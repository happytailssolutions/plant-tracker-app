# Pin Components

This directory contains components for managing pins in the plant tracker application.

## Components

### PinEditorForm

A comprehensive modal form for creating and editing pins.

**Features:**
- Pin name and description
- Project selection dropdown
- Pin type selection (Plant, Tree, Flower, Shrub, Herb, Other)
- Status selection (Active, Dormant, Harvested, Removed)
- Tag management with add/remove functionality
- Photo upload with ImagePicker integration
- Public/private toggle
- Form validation
- Loading states

**Props:**
```typescript
interface PinEditorFormProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (data: PinFormData) => void;
  initialData?: Partial<PinFormData>;
  projects: Project[];
  loading?: boolean;
  mode: 'create' | 'edit';
}
```

**Usage:**
```tsx
import { PinEditorForm } from '../components/pins';

<PinEditorForm
  visible={showForm}
  onClose={() => setShowForm(false)}
  onSave={handleSavePin}
  projects={userProjects}
  mode="create"
/>
```

### ImagePicker

A reusable component for photo selection and management.

**Features:**
- Horizontal scrollable image gallery
- Add/remove images
- Maximum image limit
- Image preview with options
- Disabled state support

**Props:**
```typescript
interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}
```

**Usage:**
```tsx
import { ImagePicker } from '../components/common';

<ImagePicker
  images={photos}
  onImagesChange={setPhotos}
  maxImages={5}
/>
```

## Form Data Structure

```typescript
interface PinFormData {
  name: string;
  description: string;
  pinType: string;
  status: string;
  projectId: string;
  tags: string[];
  photos: string[];
  isPublic: boolean;
}
```

## Dependencies

- React Native core components
- Expo Vector Icons (Ionicons)
- Terra Design System theme
- Common components (ImagePicker)

## Notes

- The ImagePicker component currently uses placeholder functionality for image selection
- Form validation includes required fields and minimum length requirements
- The components follow the Terra design system for consistent styling
- All components are "dumb" components with no business logic - they rely on props for data and callbacks for actions

## PinDetailSheet

A bottom sheet modal component that displays detailed information about a selected pin.

### Features

- **Bottom Sheet UI**: Uses React Native's Modal with `presentationStyle="pageSheet"` for a native bottom sheet experience
- **Pin Details**: Displays comprehensive pin information including:
  - Name and type with color-coded badges
  - Description (if available)
  - Location with coordinates
  - Associated project information
  - Creator details
  - Creation and update timestamps
  - Additional metadata (if available)
- **Loading States**: Shows loading indicator while fetching pin data
- **Error Handling**: Displays error messages if pin data fails to load
- **Action Buttons**: Placeholder buttons for edit and map view actions

### Props

```typescript
interface PinDetailSheetProps {
  pinId: string | null;  // The ID of the pin to display, null to hide
  onClose: () => void;   // Callback when the sheet is closed
}
```

### Usage

```tsx
import { PinDetailSheet } from '../components/pins';

// In your component
const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

const handleClose = () => {
  setSelectedPinId(null);
};

<PinDetailSheet
  pinId={selectedPinId}
  onClose={handleClose}
/>
```

### Integration with MapScreen

The PinDetailSheet is integrated with the MapScreen through the global mapStore:

1. **State Management**: Uses `selectedPinId` from the mapStore to control visibility
2. **Marker Interaction**: Map markers call `setSelectedPin(pin.id)` on press
3. **Sheet Display**: When `selectedPinId` is set, the PinDetailSheet becomes visible
4. **Data Fetching**: Uses GraphQL query `PIN_BY_ID_QUERY` to fetch pin details
5. **Closing**: Calls `setSelectedPin(null)` to close the sheet

### GraphQL Query

The component uses the `PIN_BY_ID_QUERY` to fetch pin data:

```graphql
query PinById($id: ID!) {
  pin(id: $id) {
    id
    name
    description
    latitude
    longitude
    location
    pinType
    status
    isPublic
    isActive
    metadata
    createdAt
    updatedAt
    projectId
    createdBy {
      id
      name
      email
    }
    project {
      id
      name
      description
    }
  }
}
```

### Styling

The component follows the Terra design system with:
- Consistent color palette and typography
- Proper spacing and layout
- Color-coded badges for pin types and status
- Responsive design for different screen sizes

### Future Enhancements

- Implement edit functionality for the "Edit Pin" button
- Add image display capabilities
- Implement the "View on Map" action to center the map on the pin
- Add pin deletion functionality
- Support for pin sharing 