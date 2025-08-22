// // app/apollo-wrapper.tsx
// "use client";

// import { HttpLink } from "@apollo/client";
// import {
//   ApolloNextAppProvider,
//   ApolloClient,
//   InMemoryCache,
// } from "@apollo/client-integration-nextjs";

// // This function creates a new Apollo Client instance for each request
// function makeClient() {
//   const httpLink = new HttpLink({
//     // This needs to be an absolute URL, as relative URLs cannot be used in SSR
//     uri: "http://localhost:8000/graphql/",
//   });

//   return new ApolloClient({
//     cache: new InMemoryCache(),
//     link: httpLink,
//   });
// }

// // This component provides the Apollo Client instance to all nested components
// export function ApolloWrapper({ children }: React.PropsWithChildren) {
//   return (
//     <ApolloNextAppProvider makeClient={makeClient}>
//       {children}
//     </ApolloNextAppProvider>
//   );
// }

// app/apollo-wrapper.tsx
"use client";

import { HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

// This function creates a new Apollo Client instance for each request
function makeClient() {
  const httpLink = new HttpLink({
    uri: "http://localhost:8000/graphql/",
  });

  // Auth link to add API key to headers
  const authLink = setContext((operation, { headers }) => {
    // Get the authentication token from localStorage if it exists
    let apiKey = null;

    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      try {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const parsedAuth = JSON.parse(authStorage);
          apiKey = parsedAuth.state?.apiKey;
        }
      } catch (error) {
        console.error("Error reading auth from localStorage:", error);
      }
    }

    // Check if this is a mutation that doesn't need API key
    const operationName = operation.operationName;
    const query = operation.query.loc?.source.body || "";

    const noAuthOperations = ["signUpOrganization", "loginOrganization"];
    const needsAuth = !noAuthOperations.some(
      (op) => query.includes(op) || operationName === op
    );

    // Return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        ...(needsAuth && apiKey ? { "X-API-Key": apiKey } : {}),
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([authLink, httpLink]),
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
