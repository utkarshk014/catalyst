import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query GetProjects {
    allProjects {
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
      priority
      assigneeEmail
      dueDate
      project {
        id
        name
      }
      taskcommentSet {
        id
        content
        authorEmail
        timestamp
      }
    }
  }
`;

// GraphQL Mutations
export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String) {
    createProject(name: $name, description: $description) {
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

export const CREATE_TASK = gql`
  mutation CreateTask(
    $projectId: Int!
    $title: String!
    $description: String
    $status: String
    $assigneeEmail: String
    $dueDate: Date
  ) {
    createTask(
      projectId: $projectId
      title: $title
      description: $description
      status: $status
      assigneeEmail: $assigneeEmail
      dueDate: $dueDate
    ) {
      task {
        id
        title
        description
        status
        priority
        assigneeEmail
        dueDate
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
        priority
        assigneeEmail
        dueDate
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $taskId: Int!
    $title: String
    $status: String
    $assigneeEmail: String
    $dueDate: Date
  ) {
    updateTask(
      taskId: $taskId
      title: $title
      description: $description
      status: $status
      assigneeEmail: $assigneeEmail
      dueDate: $dueDate
    ) {
      task {
        id
        title
        description
        status
        priority
        assigneeEmail
        dueDate
      }
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($taskId: Int!) {
    deleteTask(taskId: $taskId) {
      success
      message
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: Int!) {
    deleteProject(projectId: $projectId) {
      success
      message
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
