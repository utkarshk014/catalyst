"use client";

import * as React from "react";
import { CheckSquare, FolderOpen } from "lucide-react";

import { NavProjects } from "@/components/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { useAuthStore } from "@/store/authStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { organizationName, organizationEmail } = useAuthStore();

  // Sample data for navigation
  const data = {
    user: {
      name: organizationName || "Organization",
      email: organizationEmail || "email@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    projects: [
      {
        name: "Projects",
        url: "#",
        icon: FolderOpen,
      },
      {
        name: "Tasks",
        url: "#",
        icon: CheckSquare,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <h1 className="text-xl font-bold">Catalyst</h1>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
