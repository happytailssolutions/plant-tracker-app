import { gql } from '@apollo/client';

// Query to get user's projects
export const MY_PROJECTS_QUERY = gql`
  query MyProjects {
    myProjects {
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

// Type for the MyProjects query response
export interface MyProjectsQueryResponse {
  myProjects: Project[];
}

// Project type definition
export interface Project {
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
} 