"use client";

import { CheckCircle2, Loader2, LayoutTemplate, Share2, Sparkles, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { LiveList, LiveObject } from "@liveblocks/client";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { Button } from "@/components/ui/button";
import { useShareDialog } from "@/hooks/use-share-dialog";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";
import type { Project, SharedProject } from "@/types/project";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

interface WorkspaceLayoutProps {
  projectName: string;
  roomId: string;
  isOwner: boolean;
  ownedProjects: Project[];
  sharedProjects: SharedProject[];
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-copy-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-state-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Saved
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-state-error">
      <XCircle className="h-3.5 w-3.5" />
      Error
    </span>
  );
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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const share = useShareDialog(roomId, isOwner, isShareOpen);

  // Auto-reset "saved" indicator after 2 seconds
  useEffect(() => {
    if (saveStatus !== "saved") return;
    const timer = setTimeout(() => setSaveStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  const handleSaveStatusChange = useCallback((status: SaveStatus) => {
    setSaveStatus(status);
  }, []);

  function handleImportTemplate(template: CanvasTemplate) {
    setTemplateToImport(template);
  }

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
    <RoomProvider
      id={roomId}
      initialPresence={{ cursor: null, thinking: false }}
      initialStorage={{
        aiStatus: new LiveObject({ message: "", phase: "complete" }),
        chatMessages: new LiveList([]),
      }}
    >
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
            <SaveStatusIndicator status={saveStatus} />
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
            onSaveStatusChange={handleSaveStatusChange}
          />
        </main>
        <AiSidebar
          isOpen={isAiSidebarOpen}
          onClose={() => setIsAiSidebarOpen(false)}
          projectId={roomId}
        />
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
    </RoomProvider>
    </LiveblocksProvider>
  );
}
