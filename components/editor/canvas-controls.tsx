"use client";

import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useCanRedo, useCanUndo, useRedo, useUndo } from "@liveblocks/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

function ControlBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center rounded-lg p-1.5 text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } =
    useReactFlow<CanvasNode, CanvasEdge>();

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-surface-border bg-surface px-2 py-1.5 shadow-lg">
      <ControlBtn label="Zoom out" onClick={() => zoomOut({ duration: 200 })}>
        <ZoomOut className="h-4 w-4" />
      </ControlBtn>
      <ControlBtn label="Fit view" onClick={() => fitView({ duration: 300 })}>
        <Maximize2 className="h-4 w-4" />
      </ControlBtn>
      <ControlBtn label="Zoom in" onClick={() => zoomIn({ duration: 200 })}>
        <ZoomIn className="h-4 w-4" />
      </ControlBtn>

      <div className="mx-1 h-4 w-px bg-surface-border" />

      <ControlBtn label="Undo" disabled={!canUndo} onClick={undo}>
        <Undo2 className="h-4 w-4" />
      </ControlBtn>
      <ControlBtn label="Redo" disabled={!canRedo} onClick={redo}>
        <Redo2 className="h-4 w-4" />
      </ControlBtn>
    </div>
  );
}
