export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  dueDate?: string;
  taskCount: number;
  completedTasks: number;
  organization: Organization;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assigneeEmail: string;
  dueDate?: string;
  project: Project;
}

export interface TaskComment {
  id: string;
  content: string;
  authorEmail: string;
  timestamp: string;
  task: Task;
}

// GraphQL Response Types
export interface GetProjectsResponse {
  allProjects: Project[];
}

export interface GetTasksResponse {
  allTasks: Task[];
}

export interface CreateProjectResponse {
  createProject: {
    project: Project;
  };
}

export interface UpdateTaskStatusResponse {
  updateTaskStatus: {
    task: Task;
  };
}

export interface CreateTaskCommentResponse {
  createTaskComment: {
    comment: TaskComment;
  };
}
