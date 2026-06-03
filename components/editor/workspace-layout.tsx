"use client";

import { UserButton } from "@clerk/nextjs";
import { LayoutTemplate, Share2, Sparkles } from "lucide-react";
import { useState } from "react";

import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { Button } from "@/components/ui/button";
import { useShareDialog } from "@/hooks/use-share-dialog";
import { cn } from "@/lib/utils";
import type { Project, SharedProject } from "@/types/project";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

interface WorkspaceLayoutProps {
  projectName: string;
  roomId: string;
  isOwner: boolean;
  ownedProjects: Project[];
  sharedProjects: SharedProject[];
}

export function WorkspaceLayout({
  projectName,
  roomId,
  isOwner,
  ownedProjects,
  sharedProjects,
}: WorkspaceLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [templateToImport, setTemplateToImport] = useState<CanvasTemplate | null>(null);

  const share = useShareDialog(roomId, isOwner, isShareOpen);

  function handleImportTemplate(template: CanvasTemplate) {
    setTemplateToImport(template);
  }

  return (
    <div className="flex h-screen flex-col bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        center={
          <span className="truncate text-sm font-medium text-copy-primary">
            {projectName}
          </span>
        }
        right={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsTemplatesOpen(true)}
            >
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsShareOpen(true)}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
              aria-expanded={isAiSidebarOpen}
              onClick={() => setIsAiSidebarOpen((open) => !open)}
            >
              <Sparkles className="h-5 w-5 text-accent-ai-text" />
            </Button>
            <UserButton />
          </>
        }
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
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        activeProjectId={roomId}
      />
      <div className="relative flex min-h-0 flex-1">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-base">
          <CanvasWrapper
            roomId={roomId}
            templateToImport={templateToImport}
            onTemplateImported={() => setTemplateToImport(null)}
          />
        </main>
        <aside
          aria-hidden={!isAiSidebarOpen}
          className={cn(
            "absolute top-0 right-0 z-40 flex h-full w-80 flex-col border-l border-surface-border bg-surface/95 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-in-out",
            isAiSidebarOpen
              ? "translate-x-0"
              : "pointer-events-none translate-x-full",
          )}
        >
          <div className="border-b border-surface-border px-4 py-3">
            <h2 className="text-sm font-medium text-accent-ai-text">AI Assistant</h2>
          </div>
          <div className="flex flex-1 items-center justify-center px-4 text-center">
            <p className="text-sm text-copy-muted">AI chat coming soon</p>
          </div>
        </aside>
      </div>
      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        share={share}
      />
      <StarterTemplatesModal
        open={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
        onImport={handleImportTemplate}
      />
    </div>
  );
}
