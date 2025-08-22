// src/lib/graphql-client.ts
import type {
  GetProjectsResponse,
  GetTasksResponse,
  CreateProjectResponse,
  UpdateTaskStatusResponse,
  CreateTaskCommentResponse,
} from "@/types";

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql/";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; locations?: any; path?: any }>;
}

class GraphQLClient {
  private async request<T>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors) {
        throw new Error(
          `GraphQL error: ${result.errors.map((e) => e.message).join(", ")}`
        );
      }

      if (!result.data) {
        throw new Error("No data returned from GraphQL");
      }

      return result.data;
    } catch (error) {
      console.error("GraphQL request failed:", error);
      throw error;
    }
  }

  // Queries
  async getProjects(organizationSlug: string): Promise<GetProjectsResponse> {
    const query = `
      query GetProjects($organizationSlug: String!) {
        allProjects(organizationSlug: $organizationSlug) {
          id
          name
          description
          status
          dueDate
          taskCount
          completedTasks
          organization {
            id
            name
            slug
            contactEmail
          }
        }
      }
    `;

    return this.request<GetProjectsResponse>(query, { organizationSlug });
  }

  async getTasks(projectId: number): Promise<GetTasksResponse> {
    const query = `
      query GetTasks($projectId: Int!) {
        allTasks(projectId: $projectId) {
          id
          title
          description
          status
          assigneeEmail
          dueDate
          project {
            id
            name
          }
        }
      }
    `;

    return this.request<GetTasksResponse>(query, { projectId });
  }

  // Mutations
  async createProject(variables: {
    name: string;
    description?: string;
    organizationSlug: string;
  }): Promise<CreateProjectResponse> {
    const mutation = `
      mutation CreateProject(
        $name: String!
        $description: String
        $organizationSlug: String!
      ) {
        createProject(
          name: $name
          description: $description
          organizationSlug: $organizationSlug
        ) {
          project {
            id
            name
            description
            status
            dueDate
            taskCount
            completedTasks
            organization {
              id
              name
              slug
              contactEmail
            }
          }
        }
      }
    `;

    return this.request<CreateProjectResponse>(mutation, variables);
  }

  async updateTaskStatus(
    taskId: number,
    status: string
  ): Promise<UpdateTaskStatusResponse> {
    const mutation = `
      mutation UpdateTaskStatus($taskId: Int!, $status: String!) {
        updateTaskStatus(taskId: $taskId, status: $status) {
          task {
            id
            title
            description
            status
            assigneeEmail
            dueDate
          }
        }
      }
    `;

    return this.request<UpdateTaskStatusResponse>(mutation, { taskId, status });
  }

  async createTaskComment(variables: {
    taskId: number;
    content: string;
    authorEmail: string;
  }): Promise<CreateTaskCommentResponse> {
    const mutation = `
      mutation CreateTaskComment(
        $taskId: Int!
        $content: String!
        $authorEmail: String!
      ) {
        createTaskComment(
          taskId: $taskId
          content: $content
          authorEmail: $authorEmail
        ) {
          comment {
            id
            content
            authorEmail
            timestamp
          }
        }
      }
    `;

    return this.request<CreateTaskCommentResponse>(mutation, variables);
  }
}

export const graphqlClient = new GraphQLClient();
