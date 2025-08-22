"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Calendar, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import {
  GET_PROJECTS,
  CREATE_PROJECT,
  DELETE_PROJECT,
} from "@/graphql/queries";
import {
  Project,
  GetProjectsData,
  CreateProjectData,
  DeleteProjectData,
} from "@/types";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Project description is required"),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface ProjectsViewProps {
  onProjectSelect: (project: Project) => void;
}

export function ProjectsView({ onProjectSelect }: ProjectsViewProps) {
  const { organizationSlug } = useAuthStore();
  const { toast } = useToast();

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Queries
  const {
    data: projectsData,
    loading: projectsLoading,
    refetch: refetchProjects,
  } = useQuery<GetProjectsData>(GET_PROJECTS, {
    skip: !organizationSlug,
  });

  // Mutations
  const [createProject, { loading: createProjectLoading }] =
    useMutation<CreateProjectData>(CREATE_PROJECT);
  const [deleteProject, { loading: deleteProjectLoading }] =
    useMutation<DeleteProjectData>(DELETE_PROJECT);

  // Form setup
  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleCreateProject = async (data: CreateProjectFormData) => {
    try {
      await createProject({
        variables: {
          name: data.name,
          description: data.description,
        },
      });

      toast({
        title: "Success!",
        description: "Project created successfully",
      });

      setIsCreateProjectOpen(false);
      form.reset();
      refetchProjects();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteProject({
        variables: { projectId },
      });

      toast({
        title: "Success!",
        description: "Project deleted successfully",
      });

      refetchProjects();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  const projects = projectsData?.allProjects || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>
        <Dialog
          open={isCreateProjectOpen}
          onOpenChange={setIsCreateProjectOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit(handleCreateProject)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Enter project name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Enter project description"
                  rows={3}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateProjectOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createProjectLoading}>
                  {createProjectLoading ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first project
          </p>
          <Button onClick={() => setIsCreateProjectOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: Project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
              onClick={() => onProjectSelect(project)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        project.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {project.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {project.taskCount} tasks
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    disabled={deleteProjectLoading}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {project.dueDate && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDate(project.dueDate)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
