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
  query GetTasks($projectId: String!) {
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
  mutation CreateProject(
    $name: String!
    $description: String
    $dueDate: String
  ) {
    createProject(name: $name, description: $description, dueDate: $dueDate) {
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
    $projectId: String!
    $title: String!
    $description: String
    $status: String
    $assigneeEmail: String
    $dueDate: String
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
        assigneeEmail
        dueDate
      }
    }
  }
`;

export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: String!, $status: String!) {
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

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $taskId: String!
    $title: String
    $description: String
    $status: String
    $assigneeEmail: String
    $dueDate: String
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
        assigneeEmail
        dueDate
      }
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($taskId: String!) {
    deleteTask(taskId: $taskId) {
      success
      message
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: String!) {
    deleteProject(projectId: $projectId) {
      success
      message
    }
  }
`;

export const CREATE_TASK_COMMENT = gql`
  mutation CreateTaskComment(
    $taskId: String!
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
