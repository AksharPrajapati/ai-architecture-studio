"use client";

import { Plus, X } from "lucide-react";

import { ProjectListItem } from "@/components/editor/project-list-item";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Project, SharedProject } from "@/types/project";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ownedProjects: Project[];
  sharedProjects: SharedProject[];
  activeProjectId?: string;
  className?: string;
}

function ProjectTabPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-sm text-copy-muted">{message}</p>
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  activeProjectId,
  className,
}: ProjectSidebarProps) {
  const { openCreate, openRename, openDelete } = useProjectDialogsContext();

  const hasOwnedProjects = ownedProjects.length > 0;
  const hasSharedProjects = sharedProjects.length > 0;

  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "fixed top-12 left-0 z-40 flex h-[calc(100vh-3rem)] w-72 flex-col border-r border-surface-border bg-surface/95 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-surface-border px-4 py-3">
        <h2 className="text-sm font-medium text-copy-primary">Projects</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close projects sidebar"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="flex min-h-0 flex-1 flex-col gap-0">
        <TabsList className="mx-4 mt-3 w-[calc(100%-2rem)]">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <ScrollArea className="min-h-0 flex-1">
          <TabsContent value="my-projects" className="flex min-h-[12rem] flex-col px-2 py-2">
            {hasOwnedProjects ? (
              <ul className="flex flex-col gap-0.5">
                {ownedProjects.map((project) => (
                  <li key={project.id}>
                    <ProjectListItem
                      project={project}
                      isActive={project.id === activeProjectId}
                      showActions
                      onRename={openRename}
                      onDelete={openDelete}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ProjectTabPlaceholder message="No projects yet" />
            )}
          </TabsContent>
          <TabsContent value="shared" className="flex min-h-[12rem] flex-col px-2 py-2">
            {hasSharedProjects ? (
              <ul className="flex flex-col gap-0.5">
                {sharedProjects.map((project) => (
                  <li key={project.id}>
                    <ProjectListItem
                      project={project}
                      isActive={project.id === activeProjectId}
                      subtitle={`Owned by ${project.ownerName}`}
                      showActions={false}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ProjectTabPlaceholder message="No shared projects yet" />
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="shrink-0 border-t border-surface-border p-4">
        <Button type="button" className="w-full" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
