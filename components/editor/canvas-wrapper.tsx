"use client";

import { Component, type ReactNode } from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react";

import { Canvas } from "@/components/editor/canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

interface CanvasWrapperProps {
  roomId: string;
  templateToImport?: CanvasTemplate | null;
  onTemplateImported?: () => void;
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
}: CanvasWrapperProps) {
  return (
    <CanvasErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
        >
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
            />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
}
