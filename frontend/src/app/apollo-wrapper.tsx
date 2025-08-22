// app/apollo-wrapper.tsx
"use client";
 
import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
 
// This function creates a new Apollo Client instance for each request
function makeClient() {
  const httpLink = new HttpLink({
    // This needs to be an absolute URL, as relative URLs cannot be used in SSR
    uri: "http://localhost:8000/graphql/",
  });
 
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
  });
}
 
// This component provides the Apollo Client instance to all nested components
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}