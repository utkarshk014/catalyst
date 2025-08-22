import { gql } from "@apollo/client";

// Queries
export const GET_PROJECTS = gql`
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

export const GET_TASKS = gql`
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

// Mutations
export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $name: String!
    $description: String
    $status: String
    $organizationSlug: String!
    $dueDate: Date
  ) {
    createProject(
      name: $name
      description: $description
      status: $status
      organizationSlug: $organizationSlug
      dueDate: $dueDate
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

export const UPDATE_TASK_STATUS = gql`
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

export const CREATE_TASK_COMMENT = gql`
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
