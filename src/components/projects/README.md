# Projects Components

This directory contains React Native components for displaying and interacting with tree tracking projects.

## Components

### ProjectListItem

A reusable card component that displays a single project with all its key information.

**Props:**
- `project: Project` - The project data to display
- `onPress: (project: Project) => void` - Callback function when the project card is pressed

**Features:**
- Displays project name, description, location, area, and start date
- Shows project status with color-coded badges
- Displays member count and visibility status
- Handles missing data gracefully
- Follows the Terra design system

**Usage:**
```tsx
import { ProjectListItem } from '../components/projects';

<ProjectListItem 
  project={projectData} 
  onPress={(project) => handleProjectPress(project)} 
/>
```

## Design System

All components follow the Terra design system with:
- Consistent typography and spacing
- Color-coded status indicators
- Card-based layouts with shadows
- Responsive design patterns
- Accessibility considerations

## State Management

The components work with Apollo Client for GraphQL data fetching and state management. The ProjectsScreen handles:
- Loading states
- Error states  
- Empty states
- Refresh functionality
- Data caching 