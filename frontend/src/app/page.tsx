"use client";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ProjectsView } from "@/components/projects-view";
import { TasksView } from "@/components/tasks-view";
import { AuthModal } from "@/components/auth-modal";
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/authStore";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Project } from "@/types";

export default function Page() {
  const { isSignedIn, apiKey } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (apiKey && isSignedIn) {
      // User is authenticated, hide auth modal
      setShowAuthModal(false);
      setIsLoading(false);
    } else {
      // No auth info, show auth modal immediately
      setShowAuthModal(true);
      setIsLoading(false);
    }
  }, [apiKey, isSignedIn]);

  const handleCloseAuthModal = () => {
    if (isSignedIn) {
      setShowAuthModal(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const getBreadcrumbItems = () => {
    if (selectedProject) {
      return [
        { label: "All Projects", onClick: handleBackToProjects, isLink: true },
        { label: selectedProject.name, isLink: false },
      ];
    }
    return [{ label: "All Projects", isLink: false }];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-10 border-b bg-background">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {getBreadcrumbItems().map((item, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                      <BreadcrumbItem className="hidden md:block">
                        {item.isLink ? (
                          <BreadcrumbLink
                            href="#"
                            onClick={item.onClick}
                            className="cursor-pointer hover:underline"
                          >
                            {item.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          {/* Main Content */}
          {isSignedIn ? (
            selectedProject ? (
              <TasksView
                selectedProject={selectedProject}
                onBackToProjects={handleBackToProjects}
              />
            ) : (
              <ProjectsView onProjectSelect={handleProjectSelect} />
            )
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                Please sign in to continue
              </p>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={handleCloseAuthModal} />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
