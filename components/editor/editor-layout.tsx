"use client";

import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { cn } from "@/lib/utils";
import type { Project, SharedProject } from "@/types/project";

interface EditorLayoutProps {
  children: React.ReactNode;
  ownedProjects: Project[];
  sharedProjects: SharedProject[];
  className?: string;
}

export function EditorLayout({
  children,
  ownedProjects,
  sharedProjects,
  className,
}: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={cn("flex h-screen flex-col bg-page", className)}>
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        right={<UserButton />}
      />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {isSidebarOpen ? (
          <button
            type="button"
            className="absolute inset-0 z-30 bg-black/50 md:hidden"
            aria-label="Close projects sidebar"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
        />
        <main className="relative min-h-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
