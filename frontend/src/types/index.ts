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
  project: {
    id: string;
    name: string;
  };
  taskcommentSet?: TaskComment[];
}

export interface TaskComment {
  id: string;
  content: string;
  authorEmail: string;
  timestamp: string;
}

// GraphQL Response Types - match the actual schema
export interface GetProjectsData {
  allProjects: Project[];
}

export interface GetTasksData {
  allTasks: Task[];
}

export interface CreateProjectData {
  createProject: {
    project: Project;
  };
}

export interface CreateTaskData {
  createTask: {
    task: Task;
  };
}

export interface UpdateTaskStatusData {
  updateTaskStatus: {
    task: Task;
  };
}

export interface CreateTaskCommentData {
  createTaskComment: {
    comment: TaskComment;
  };
}

export interface UpdateTaskData {
  updateTask: {
    task: Task;
  };
}

export interface DeleteTaskData {
  deleteTask: {
    success: boolean;
    message: string;
  };
}

export interface DeleteProjectData {
  deleteProject: {
    success: boolean;
    message: string;
  };
}

// Utility function to calculate priority based on due date
export const calculatePriority = (
  dueDate: string
): "LOW" | "MEDIUM" | "HIGH" => {
  const today = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue <= 2) return "HIGH";
  if (daysUntilDue >= 3 && daysUntilDue <= 8) return "MEDIUM";
  return "LOW";
};
