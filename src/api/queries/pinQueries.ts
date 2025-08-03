import { gql } from '@apollo/client';

// Query to get all pins for the current user
export const ALL_PINS_QUERY = gql`
  query AllPins {
    allPins {
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
`;

// Query to get pins within map bounds
export const PINS_QUERY = gql`
  query PinsInBounds($mapBounds: MapBoundsInput!) {
    pinsInBounds(mapBounds: $mapBounds) {
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
`;

// Query to get a single pin by ID
export const PIN_BY_ID_QUERY = gql`
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
`;

// Query to get all pins for a specific project
export const PINS_BY_PROJECT_QUERY = gql`
  query PinsByProject($projectId: ID!) {
    pinsByProject(projectId: $projectId) {
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
`;

// Type for the AllPins query response
export interface AllPinsQueryResponse {
  allPins: Pin[];
}

// Type for the PinsInBounds query response
export interface PinsInBoundsQueryResponse {
  pinsInBounds: Pin[];
}

// Type for the PinById query response
export interface PinByIdQueryResponse {
  pin: Pin;
}

// Type for the PinsByProject query response
export interface PinsByProjectQueryResponse {
  pinsByProject: Pin[];
}

// Map bounds input type
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  projectId?: string;
}

// Pin type definition
export interface Pin {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  location: string;
  pinType: string;
  status: string;
  isPublic: boolean;
  isActive: boolean;
  metadata?: object;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
    description?: string;
  };
} 