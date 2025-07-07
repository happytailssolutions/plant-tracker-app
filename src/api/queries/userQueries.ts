import { gql } from '@apollo/client';

// Query to get current user information
export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      createdAt
      updatedAt
    }
  }
`;

// Type for the Me query response
export interface MeQueryResponse {
  me: {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
    updatedAt: string;
  };
} 