"use client";

import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-provider";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { cn } from "@/lib/utils";

interface EditorLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function EditorLayout({ children, className }: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProjectDialogsProvider>
      <div className={cn("flex h-screen flex-col bg-base", className)}>
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
          right={<UserButton />}
        />
        {isSidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 top-12 z-30 bg-black/50 md:hidden"
            aria-label="Close projects sidebar"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="relative min-h-0 flex-1">{children}</main>
      </div>
    </ProjectDialogsProvider>
  );
}
