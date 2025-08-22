"use client";
import React, { useState, useEffect, useCallback } from "react";
import type { Project, Task } from "@/types";
import { graphqlClient } from "@/lib/graphql-client";

const ProjectDashboard = () => {
  const [organizationSlug, setOrganizationSlug] = useState<string>("test-org");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [showCreateProject, setShowCreateProject] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [newProjectDescription, setNewProjectDescription] =
    useState<string>("");
  const [commentContent, setCommentContent] = useState<string>("");
  const [commentTaskId, setCommentTaskId] = useState<number | null>(null);

  // State for data and loading
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(false);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [createProjectLoading, setCreateProjectLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    if (!organizationSlug) return;

    setProjectsLoading(true);
    setError(null);

    try {
      const data = await graphqlClient.getProjects(organizationSlug);
      setProjects(data.allProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(
        "Failed to fetch projects. Make sure your Django server is running."
      );
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, [organizationSlug]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!selectedProjectId) return;

    setTasksLoading(true);

    try {
      const data = await graphqlClient.getTasks(selectedProjectId);
      setTasks(data.allTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [selectedProjectId]);

  // Effects
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [fetchTasks, selectedProjectId]);

  // Event handlers
  const handleCreateProject = async (): Promise<void> => {
    if (!newProjectName.trim()) return;

    setCreateProjectLoading(true);
    try {
      await graphqlClient.createProject({
        name: newProjectName,
        description: newProjectDescription,
        organizationSlug,
      });

      setNewProjectName("");
      setNewProjectDescription("");
      setShowCreateProject(false);
      await fetchProjects(); // Refresh projects
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setCreateProjectLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (
    taskId: number,
    status: string
  ): Promise<void> => {
    try {
      await graphqlClient.updateTaskStatus(taskId, status);
      await fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleCreateComment = async (taskId: number): Promise<void> => {
    if (!commentContent.trim()) return;

    try {
      await graphqlClient.createTaskComment({
        taskId,
        content: commentContent,
        authorEmail: "user@example.com",
      });

      setCommentContent("");
      setCommentTaskId(null);
      // Note: In a real app, you'd want to refetch task comments here
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  // Utility functions
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      ACTIVE: "bg-blue-100 text-blue-800",
      TODO: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      DONE: "bg-green-100 text-green-800",
      ON_HOLD: "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  // Error handling
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Connection Error
          </h1>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Project Management System
          </h1>

          {/* Organization Selector */}
          <div className="mb-6">
            <label
              htmlFor="org-slug"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Organization Slug
            </label>
            <input
              id="org-slug"
              type="text"
              value={organizationSlug}
              onChange={(e) => setOrganizationSlug(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter organization slug"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Projects</h2>
              <button
                onClick={() => setShowCreateProject(!showCreateProject)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={createProjectLoading}
              >
                + New Project
              </button>
            </div>

            {/* Create Project Form */}
            {showCreateProject && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    placeholder="Project Description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateProject}
                    disabled={createProjectLoading || !newProjectName.trim()}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                  >
                    {createProjectLoading ? "Creating..." : "Create"}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateProject(false);
                      setNewProjectName("");
                      setNewProjectDescription("");
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Projects List */}
            {projectsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Loading projects...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No projects found. Create your first project!
                  </p>
                ) : (
                  projects.map((project: Project) => (
                    <div
                      key={project.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedProjectId === parseInt(project.id)
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedProjectId(parseInt(project.id))}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">
                          {project.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {project.description}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>
                          Tasks: {project.completedTasks}/{project.taskCount}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width:
                                project.taskCount > 0
                                  ? `${
                                      (project.completedTasks /
                                        project.taskCount) *
                                      100
                                    }%`
                                  : "0%",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          {/* Tasks Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Tasks</h2>

            {!selectedProjectId ? (
              <div className="text-center text-gray-500 py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p>Select a project to view tasks</p>
              </div>
            ) : tasksLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Loading tasks...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No tasks found for this project.
                  </p>
                ) : (
                  tasks.map((task: Task) => (
                    <div
                      key={task.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg">{task.title}</h4>
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleUpdateTaskStatus(
                              parseInt(task.id),
                              e.target.value
                            )
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="DONE">DONE</option>
                        </select>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {task.description}
                      </p>
                      <div className="text-sm text-gray-500 mb-4">
                        <span className="font-medium">Assignee:</span>{" "}
                        {task.assigneeEmail || "Unassigned"}
                      </div>

                      {/* Comment Section */}
                      <div className="border-t pt-3">
                        {commentTaskId === parseInt(task.id) ? (
                          <div className="space-y-3">
                            <textarea
                              value={commentContent}
                              onChange={(e) =>
                                setCommentContent(e.target.value)
                              }
                              placeholder="Add a comment..."
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={3}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleCreateComment(parseInt(task.id))
                                }
                                disabled={!commentContent.trim()}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                              >
                                Add Comment
                              </button>
                              <button
                                onClick={() => {
                                  setCommentTaskId(null);
                                  setCommentContent("");
                                }}
                                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCommentTaskId(parseInt(task.id))}
                            className="text-blue-500 text-sm hover:text-blue-600 flex items-center space-x-1"
                          >
                            <span>💬</span>
                            <span>Add Comment</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
