// graphql/auth-queries.ts
import { gql } from "@apollo/client";

export const SIGN_UP_ORGANIZATION = gql`
  mutation SignUpOrganization(
    $name: String!
    $contactEmail: String!
    $password: String!
  ) {
    signUpOrganization(
      name: $name
      contactEmail: $contactEmail
      password: $password
    ) {
      success
      message
      apiKey
      organization {
        id
        name
        slug
        contactEmail
      }
    }
  }
`;

export const LOGIN_ORGANIZATION = gql`
  mutation LoginOrganization($email: String!, $password: String!) {
    loginOrganization(email: $email, password: $password) {
      success
      message
      apiKey
      organization {
        id
        name
        slug
        contactEmail
      }
    }
  }
`;

// Auth response types
export interface AuthResponse {
  success: boolean;
  message: string;
  apiKey: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    contactEmail: string;
  };
}

export interface SignUpData {
  signUpOrganization: AuthResponse;
}

export interface LoginData {
  loginOrganization: AuthResponse;
}
