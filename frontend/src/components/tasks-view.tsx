"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  Plus,
  MessageCircle,
  Clock,
  User,
  ArrowLeft,
  Trash2,
  Edit,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityBadge } from "@/components/ui/priority-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  GET_TASKS,
  CREATE_TASK,
  UPDATE_TASK,
  UPDATE_TASK_STATUS,
  CREATE_TASK_COMMENT,
  DELETE_TASK,
} from "@/graphql/queries";
import {
  Project,
  Task,
  TaskComment,
  GetTasksData,
  CreateTaskData,
  UpdateTaskData,
  UpdateTaskStatusData,
  CreateTaskCommentData,
  DeleteTaskData,
} from "@/types";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().min(1, "Task description is required"),
  status: z.string().min(1, "Status is required"),
  assigneeEmail: z.string().email("Please enter a valid email address"),
  dueDate: z.date().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().min(1, "Task description is required"),
  status: z.string().min(1, "Status is required"),
  assigneeEmail: z.string().email("Please enter a valid email address"),
  dueDate: z.date().optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;
type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
type CreateCommentFormData = z.infer<typeof createCommentSchema>;

interface TasksViewProps {
  selectedProject: Project;
  onBackToProjects: () => void;
}

export function TasksView({
  selectedProject,
  onBackToProjects,
}: TasksViewProps) {
  const { toast } = useToast();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isUpdateTaskOpen, setIsUpdateTaskOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Queries
  const {
    data: tasksData,
    loading: tasksLoading,
    refetch: refetchTasks,
  } = useQuery<GetTasksData>(GET_TASKS, {
    variables: { projectId: selectedProject.id },
  });

  // Mutations
  const [createTask, { loading: createTaskLoading }] =
    useMutation<CreateTaskData>(CREATE_TASK);
  const [updateTask, { loading: updateTaskLoading }] =
    useMutation<UpdateTaskData>(UPDATE_TASK);
  const [updateTaskStatus, { loading: updateStatusLoading }] =
    useMutation<UpdateTaskStatusData>(UPDATE_TASK_STATUS);
  const [createTaskComment, { loading: createCommentLoading }] =
    useMutation<CreateTaskCommentData>(CREATE_TASK_COMMENT);
  const [deleteTask, { loading: deleteTaskLoading }] =
    useMutation<DeleteTaskData>(DELETE_TASK);

  // Form setup
  const createTaskForm = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      assigneeEmail: "",
    },
  });

  const updateTaskForm = useForm<UpdateTaskFormData>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      assigneeEmail: "",
    },
  });

  const commentForm = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: "",
    },
  });

  // Filter tasks based on active tab
  const filteredTasks =
    tasksData?.allTasks?.filter((task: Task) => {
      if (activeTab === "all") return true;
      if (activeTab === "todo") return task.status === "TODO";
      if (activeTab === "inprogress") return task.status === "IN_PROGRESS";
      if (activeTab === "done") return task.status === "DONE";
      return true;
    }) || [];

  const handleCreateTask = async (data: CreateTaskFormData) => {
    try {
      await createTask({
        variables: {
          projectId: selectedProject.id,
          title: data.title,
          description: data.description,
          status: data.status,
          assigneeEmail: data.assigneeEmail,
          dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        },
      });

      toast({
        title: "Success!",
        description: "Task created successfully",
      });

      setIsCreateTaskOpen(false);
      createTaskForm.reset();
      refetchTasks();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async (data: UpdateTaskFormData) => {
    if (!selectedTask) return;

    try {
      await updateTask({
        variables: {
          taskId: selectedTask.id,
          title: data.title,
          description: data.description,
          status: data.status,
          assigneeEmail: data.assigneeEmail,
          dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        },
      });

      toast({
        title: "Success!",
        description: "Task updated successfully",
      });

      setIsUpdateTaskOpen(false);
      updateTaskForm.reset();
      refetchTasks();

      // Update the selectedTask in the drawer
      if (selectedTask) {
        setSelectedTask((prev) =>
          prev
            ? {
                ...prev,
                title: data.title,
                description: data.description,
                status: data.status,
                assigneeEmail: data.assigneeEmail,
                dueDate: data.dueDate ? data.dueDate.toISOString() : null,
              }
            : null
        );
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({
        variables: {
          taskId,
          status: newStatus,
        },
      });

      toast({
        title: "Success!",
        description: "Task status updated",
      });

      refetchTasks();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this task? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteTask({
        variables: { taskId },
      });

      toast({
        title: "Success!",
        description: "Task deleted successfully",
      });

      refetchTasks();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const openUpdateTaskDialog = (task: Task) => {
    setSelectedTask(task);
    updateTaskForm.reset({
      title: task.title,
      description: task.description,
      status: task.status,
      assigneeEmail: task.assigneeEmail,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    });
    setIsUpdateTaskOpen(true);
  };

  const handleCreateComment = async (data: CreateCommentFormData) => {
    if (!selectedTask) {
      return;
    }

    try {
      const result = await createTaskComment({
        variables: {
          taskId: selectedTask.id,
          content: data.content,
          authorEmail: "user@example.com", // This should come from auth store
        },
      });

      if (result.data?.createTaskComment?.comment) {
        // Update the selectedTask with the new comment
        const newComment = result.data.createTaskComment.comment;
        setSelectedTask((prev) =>
          prev
            ? {
                ...prev,
                taskcommentSet: [...(prev.taskcommentSet || []), newComment],
              }
            : null
        );

        toast({
          title: "Success!",
          description: "Comment added successfully",
        });

        // Reset form but keep drawer open
        commentForm.reset();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatEmail = (email: string) => {
    return email.split("@")[0];
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "TODO":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "DONE":
        return "success";
      default:
        return "secondary";
    }
  };

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBackToProjects}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {selectedProject.name}
            </h1>
            <p className="text-muted-foreground">
              {selectedProject.description || "No description"}
            </p>
          </div>
        </div>
        <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={createTaskForm.handleSubmit(handleCreateTask)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  {...createTaskForm.register("title")}
                  placeholder="Enter task title"
                />
                {createTaskForm.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {createTaskForm.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...createTaskForm.register("description")}
                  placeholder="Enter task description"
                  rows={3}
                />
                {createTaskForm.formState.errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {createTaskForm.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={createTaskForm.getValues("status")}
                    onValueChange={(value) =>
                      createTaskForm.setValue("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assigneeEmail">Assignee Email</Label>
                  <Input
                    id="assigneeEmail"
                    type="email"
                    {...createTaskForm.register("assigneeEmail")}
                    placeholder="assignee@example.com"
                  />
                  {createTaskForm.formState.errors.assigneeEmail && (
                    <p className="text-sm text-destructive mt-1">
                      {createTaskForm.formState.errors.assigneeEmail.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Calendar
                  mode="single"
                  selected={createTaskForm.watch("dueDate")}
                  onSelect={(date) => createTaskForm.setValue("dueDate", date)}
                  className="rounded-md border"
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateTaskOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskLoading}>
                  {createTaskLoading ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Update Task Dialog */}
      <Dialog open={isUpdateTaskOpen} onOpenChange={setIsUpdateTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Task</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={updateTaskForm.handleSubmit(handleUpdateTask)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="update-title">Task Title</Label>
              <Input
                id="update-title"
                {...updateTaskForm.register("title")}
                placeholder="Enter task title"
              />
              {updateTaskForm.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {updateTaskForm.formState.errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="update-description">Description</Label>
              <Textarea
                id="update-description"
                {...updateTaskForm.register("description")}
                placeholder="Enter task description"
                rows={3}
              />
              {updateTaskForm.formState.errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {updateTaskForm.formState.errors.description.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="update-status">Status</Label>
              <Select
                value={updateTaskForm.watch("status")}
                onValueChange={(value) =>
                  updateTaskForm.setValue("status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
              {updateTaskForm.formState.errors.status && (
                <p className="text-sm text-destructive mt-1">
                  {updateTaskForm.formState.errors.status.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="update-assignee">Assignee Email</Label>
              <Input
                id="update-assignee"
                type="email"
                {...updateTaskForm.register("assigneeEmail")}
                placeholder="Enter assignee email"
              />
              {updateTaskForm.formState.errors.assigneeEmail && (
                <p className="text-sm text-destructive mt-1">
                  {updateTaskForm.formState.errors.assigneeEmail.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="update-dueDate">Due Date</Label>
              <Calendar
                mode="single"
                selected={updateTaskForm.watch("dueDate")}
                onSelect={(date) => updateTaskForm.setValue("dueDate", date)}
                className="rounded-md border"
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateTaskOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateTaskLoading}>
                {updateTaskLoading ? "Updating..." : "Update Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tasks Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first task
          </p>
          <Button onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task: Task) => (
            <Card
              key={task.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => {
                setSelectedTask(task);
                setIsTaskDrawerOpen(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {task.status}
                      </Badge>
                      {task.dueDate && (
                        <PriorityBadge
                          dueDate={task.dueDate}
                          status={task.status}
                        />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {task.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.dueDate
                          ? formatDate(task.dueDate)
                          : "No due date"}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assigneeEmail
                          ? formatEmail(task.assigneeEmail)
                          : "Unassigned"}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {task.taskcommentSet?.length || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextStatus =
                          task.status === "TODO"
                            ? "IN_PROGRESS"
                            : task.status === "IN_PROGRESS"
                            ? "DONE"
                            : "TODO";
                        handleUpdateTaskStatus(task.id, nextStatus);
                      }}
                      disabled={updateStatusLoading}
                    >
                      {task.status === "TODO"
                        ? "Start"
                        : task.status === "IN_PROGRESS"
                        ? "Complete"
                        : "Reopen"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUpdateTaskDialog(task);
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      disabled={deleteTaskLoading}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Task Detail Drawer */}
      <Sheet open={isTaskDrawerOpen} onOpenChange={setIsTaskDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedTask?.title}</SheetTitle>
          </SheetHeader>
          {selectedTask && (
            <div className="space-y-6 mt-6">
              {/* Task Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(selectedTask.status)}>
                      {selectedTask.status}
                    </Badge>
                    {selectedTask.dueDate && (
                      <PriorityBadge
                        dueDate={selectedTask.dueDate}
                        status={selectedTask.status}
                      />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUpdateTaskDialog(selectedTask)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Task
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {selectedTask.dueDate
                    ? formatDate(selectedTask.dueDate)
                    : "No due date"}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Assigned to:{" "}
                  {selectedTask.assigneeEmail
                    ? formatEmail(selectedTask.assigneeEmail)
                    : "Unassigned"}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTask.description || "No description provided"}
                </p>
              </div>

              {/* Comments */}
              <div>
                <h4 className="font-medium mb-2">Comments</h4>
                <div className="space-y-3 mb-4">
                  {selectedTask.taskcommentSet?.map((comment: TaskComment) => (
                    <div key={comment.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {formatEmail(comment.authorEmail)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <form
                  onSubmit={commentForm.handleSubmit(handleCreateComment)}
                  className="space-y-2"
                >
                  <Textarea
                    placeholder="Add a comment..."
                    {...commentForm.register("content")}
                    rows={3}
                  />
                  {commentForm.formState.errors.content && (
                    <p className="text-sm text-destructive mt-1">
                      {commentForm.formState.errors.content.message}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={createCommentLoading}
                    size="sm"
                  >
                    {createCommentLoading ? "Adding..." : "Add Comment"}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
