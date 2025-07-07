import { gql } from '@apollo/client';

// Mutation to create a new pin
export const CREATE_PIN_MUTATION = gql`
  mutation CreatePin($input: CreatePinInput!) {
    createPin(input: $input) {
      id
      name
      description
      pinType
      status
      latitude
      longitude
      location
      isPublic
      isActive
      metadata
      createdAt
      updatedAt
      projectId
      createdById
      project {
        id
        name
        description
      }
      createdBy {
        id
        email
        name
      }
    }
  }
`;

// Mutation to update a pin
export const UPDATE_PIN_MUTATION = gql`
  mutation UpdatePin($input: UpdatePinInput!) {
    updatePin(input: $input) {
      id
      name
      description
      pinType
      status
      latitude
      longitude
      location
      isPublic
      isActive
      metadata
      createdAt
      updatedAt
      projectId
      createdById
      project {
        id
        name
        description
      }
      createdBy {
        id
        email
        name
      }
    }
  }
`;

// Mutation to delete a pin
export const DELETE_PIN_MUTATION = gql`
  mutation DeletePin($id: ID!) {
    deletePin(id: $id)
  }
`;

// Input type for creating a pin
export interface CreatePinInput {
  name: string;
  description?: string;
  pinType?: string;
  status?: string;
  latitude: number;
  longitude: number;
  projectId: string;
  isPublic?: boolean;
  metadata?: any;
}

// Input type for updating a pin
export interface UpdatePinInput {
  id: string;
  name?: string;
  description?: string;
  pinType?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  projectId?: string;
  isPublic?: boolean;
  metadata?: any;
}

// Pin type definition
export interface Pin {
  id: string;
  name: string;
  description?: string;
  pinType: string;
  status: string;
  latitude: number;
  longitude: number;
  location: string;
  isPublic: boolean;
  isActive: boolean;
  metadata?: object;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  createdById: string;
  project: {
    id: string;
    name: string;
    description?: string;
  };
  createdBy: {
    id: string;
    email: string;
    name: string;
  };
}

// Response type for the CreatePin mutation
export interface CreatePinMutationResponse {
  createPin: Pin;
}

// Response type for the UpdatePin mutation
export interface UpdatePinMutationResponse {
  updatePin: Pin;
}

// Response type for the DeletePin mutation
export interface DeletePinMutationResponse {
  deletePin: boolean;
}

// Variables type for the CreatePin mutation
export interface CreatePinMutationVariables {
  input: CreatePinInput;
}

// Variables type for the UpdatePin mutation
export interface UpdatePinMutationVariables {
  input: UpdatePinInput;
}

// Variables type for the DeletePin mutation
export interface DeletePinMutationVariables {
  id: string;
} 