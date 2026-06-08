"use client";

import { Component, type ReactNode } from "react";
import { ClientSideSuspense } from "@liveblocks/react";

import { Canvas } from "@/components/editor/canvas";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

interface CanvasWrapperProps {
  roomId: string;
  templateToImport?: CanvasTemplate | null;
  onTemplateImported?: () => void;
  onSaveStatusChange?: (status: SaveStatus) => void;
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <p className="text-sm text-copy-muted">
            Could not connect to the collaborative session. Refresh to try
            again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function CanvasWrapper({
  roomId,
  templateToImport,
  onTemplateImported,
  onSaveStatusChange,
}: CanvasWrapperProps) {
  return (
    <CanvasErrorBoundary>
      <ClientSideSuspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-copy-muted">Connecting…</p>
          </div>
        }
      >
        <Canvas
          templateToImport={templateToImport}
          onTemplateImported={onTemplateImported}
          projectId={roomId}
          onSaveStatusChange={onSaveStatusChange}
        />
      </ClientSideSuspense>
    </CanvasErrorBoundary>
  );
}
