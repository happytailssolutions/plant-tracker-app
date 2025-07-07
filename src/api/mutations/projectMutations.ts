import { gql } from '@apollo/client';

// Mutation to create a new project
export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      location
      latitude
      longitude
      area
      areaUnit
      projectType
      status
      startDate
      endDate
      metadata
      isPublic
      isActive
      createdAt
      updatedAt
      owner {
        id
        email
        name
      }
      members {
        id
        email
        name
      }
    }
  }
`;

// Mutation to update a project
export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
      location
      latitude
      longitude
      area
      areaUnit
      projectType
      status
      startDate
      endDate
      metadata
      isPublic
      isActive
      createdAt
      updatedAt
      owner {
        id
        email
        name
      }
      members {
        id
        email
        name
      }
    }
  }
`;

// Mutation to delete a project
export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
      name
    }
  }
`;

// Input type for creating a project
export interface CreateProjectInput {
  name: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  areaUnit?: string;
  projectType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  metadata?: any;
  isPublic?: boolean;
  memberIds?: string[];
}

// Input type for updating a project
export interface UpdateProjectInput {
  name?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  areaUnit?: string;
  projectType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  metadata?: any;
  isPublic?: boolean;
  memberIds?: string[];
}

// Response type for the CreateProject mutation
export interface CreateProjectMutationResponse {
  createProject: {
    id: string;
    name: string;
    description?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    area?: number;
    areaUnit?: string;
    projectType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    metadata?: object;
    isPublic: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    owner: {
      id: string;
      email: string;
      name?: string;
    };
    members: {
      id: string;
      email: string;
      name?: string;
    }[];
  };
}

// Response type for the UpdateProject mutation
export interface UpdateProjectMutationResponse {
  updateProject: {
    id: string;
    name: string;
    description?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    area?: number;
    areaUnit?: string;
    projectType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    metadata?: object;
    isPublic: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    owner: {
      id: string;
      email: string;
      name?: string;
    };
    members: {
      id: string;
      email: string;
      name?: string;
    }[];
  };
}

// Response type for the DeleteProject mutation
export interface DeleteProjectMutationResponse {
  deleteProject: {
    id: string;
    name: string;
  };
}

// Variables type for the CreateProject mutation
export interface CreateProjectMutationVariables {
  input: CreateProjectInput;
}

// Variables type for the UpdateProject mutation
export interface UpdateProjectMutationVariables {
  id: string;
  input: UpdateProjectInput;
}

// Variables type for the DeleteProject mutation
export interface DeleteProjectMutationVariables {
  id: string;
} 