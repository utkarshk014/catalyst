import { gql } from "@apollo/client";

// Queries
export const GET_ORGANIZATION = gql`
  query GetOrganization($slug: String!) {
    organization(slug: $slug) {
      id
      name
      slug
      contactEmail
    }
  }
`;

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
      taskcommentSet {
        id
        content
        authorEmail
        timestamp
      }
    }
  }
`;

// Mutations
export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!, $contactEmail: String!, $slug: String) {
    createOrganization(name: $name, contactEmail: $contactEmail, slug: $slug) {
      organization {
        id
        name
        slug
        contactEmail
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $name: String!
    $description: String
    $organizationSlug: String!
    $status: String
    $dueDate: Date
  ) {
    createProject(
      name: $name
      description: $description
      organizationSlug: $organizationSlug
      status: $status
      dueDate: $dueDate
    ) {
      project {
        id
        name
        description
        status
        taskCount
        completedTasks
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
    $dueDate: DateTime
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
  mutation UpdateTaskStatus($taskId: Int!, $status: String!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      task {
        id
        status
      }
    }
  }
`;

export const CREATE_TASK_COMMENT = gql`
  mutation CreateTaskComment($taskId: Int!, $content: String!, $authorEmail: String!) {
    createTaskComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
      comment {
        id
        content
        authorEmail
        timestamp
      }
    }
  }
`;