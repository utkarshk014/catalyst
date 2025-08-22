// // src/lib/graphql-client.ts
// import type {
//   GetProjectsResponse,
//   GetTasksResponse,
//   CreateProjectResponse,
//   UpdateTaskStatusResponse,
//   CreateTaskCommentResponse,
// } from "@/types";

// const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql/";

// interface GraphQLResponse<T> {
//   data?: T;
//   errors?: Array<{ message: string; locations?: any; path?: any }>;
// }

// class GraphQLClient {
//   private async request<T>(
//     query: string,
//     variables?: Record<string, any>
//   ): Promise<T> {
//     try {
//       const response = await fetch(GRAPHQL_ENDPOINT, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Origin: "http://localhost:3000",
//         },
//         mode: "cors",
//         credentials: "include",
//         body: JSON.stringify({
//           query,
//           variables,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();

//       if (result.errors) {
//         console.error("GraphQL Errors:", result.errors);
//         throw new Error(result.errors[0].message);
//       }

//       return result.data as T;
//     } catch (error) {
//       console.error("GraphQL request failed:", error);
//       throw error;
//     }
//   }

//   async getOrganization(slug: string) {
//     return this.request<any>(
//       `
//       query GetOrganization($slug: String!) {
//         organization(slug: $slug) {
//           id
//           name
//           slug
//           contactEmail
//         }
//       }
//     `,
//       { slug }
//     );
//   }

//   async createOrganization(variables: {
//     name: string;
//     contactEmail: string;
//     slug?: string;
//   }) {
//     return this.request<any>(
//       `
//       mutation CreateOrganization($name: String!, $contactEmail: String!, $slug: String) {
//         createOrganization(name: $name, contactEmail: $contactEmail, slug: $slug) {
//           organization {
//             id
//             name
//             slug
//             contactEmail
//           }
//         }
//       }
//     `,
//       variables
//     );
//   }

//   async createTask(variables: {
//     projectId: number;
//     title: string;
//     description?: string;
//     status?: string;
//     assigneeEmail?: string;
//     dueDate?: string;
//   }) {
//     return this.request<any>(
//       `
//       mutation CreateTask(
//         $projectId: Int!
//         $title: String!
//         $description: String
//         $status: String
//         $assigneeEmail: String
//         $dueDate: DateTime
//       ) {
//         createTask(
//           projectId: $projectId
//           title: $title
//           description: $description
//           status: $status
//           assigneeEmail: $assigneeEmail
//           dueDate: $dueDate
//         ) {
//           task {
//             id
//             title
//             description
//             status
//             assigneeEmail
//             dueDate
//           }
//         }
//       }
//     `,
//       variables
//     );
//   }

//   // Queries
//   async getProjects(organizationSlug: string): Promise<GetProjectsResponse> {
//     const query = `
//       query GetProjects($organizationSlug: String!) {
//         allProjects(organizationSlug: $organizationSlug) {
//           id
//           name
//           description
//           status
//           dueDate
//           taskCount
//           completedTasks
//           organization {
//             id
//             name
//             slug
//             contactEmail
//           }
//         }
//       }
//     `;

//     return this.request<GetProjectsResponse>(query, { organizationSlug });
//   }

//   async getTasks(projectId: number): Promise<GetTasksResponse> {
//     const query = `
//       query GetTasks($projectId: Int!) {
//         allTasks(projectId: $projectId) {
//           id
//           title
//           description
//           status
//           assigneeEmail
//           dueDate
//           project {
//             id
//             name
//           }
//         }
//       }
//     `;

//     return this.request<GetTasksResponse>(query, { projectId });
//   }

//   // Mutations
//   async createProject(variables: {
//     name: string;
//     description?: string;
//     organizationSlug: string;
//   }): Promise<CreateProjectResponse> {
//     const mutation = `
//       mutation CreateProject(
//         $name: String!
//         $description: String
//         $organizationSlug: String!
//       ) {
//         createProject(
//           name: $name
//           description: $description
//           organizationSlug: $organizationSlug
//         ) {
//           project {
//             id
//             name
//             description
//             status
//             dueDate
//             taskCount
//             completedTasks
//             organization {
//               id
//               name
//               slug
//               contactEmail
//             }
//           }
//         }
//       }
//     `;

//     return this.request<CreateProjectResponse>(mutation, variables);
//   }

//   async updateTaskStatus(
//     taskId: number,
//     status: string
//   ): Promise<UpdateTaskStatusResponse> {
//     const mutation = `
//       mutation UpdateTaskStatus($taskId: Int!, $status: String!) {
//         updateTaskStatus(taskId: $taskId, status: $status) {
//           task {
//             id
//             title
//             description
//             status
//             assigneeEmail
//             dueDate
//           }
//         }
//       }
//     `;

//     return this.request<UpdateTaskStatusResponse>(mutation, { taskId, status });
//   }

//   async createTaskComment(variables: {
//     taskId: number;
//     content: string;
//     authorEmail: string;
//   }): Promise<CreateTaskCommentResponse> {
//     const mutation = `
//       mutation CreateTaskComment(
//         $taskId: Int!
//         $content: String!
//         $authorEmail: String!
//       ) {
//         createTaskComment(
//           taskId: $taskId
//           content: $content
//           authorEmail: $authorEmail
//         ) {
//           comment {
//             id
//             content
//             authorEmail
//             timestamp
//           }
//         }
//       }
//     `;

//     return this.request<CreateTaskCommentResponse>(mutation, variables);
//   }
// }

// export const graphqlClient = new GraphQLClient();
