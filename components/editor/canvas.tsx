"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo, useMyPresence, useEventListener, useStorage } from "@liveblocks/react";

import { CanvasNodeComponent } from "@/components/editor/canvas-node";
import { CanvasEdgeComponent } from "@/components/editor/canvas-edge";
import { CanvasControls } from "@/components/editor/canvas-controls";
import { ShapePanel } from "@/components/editor/shape-panel";
import { PresenceAvatars } from "@/components/editor/presence-avatars";
import { LiveCursors } from "@/components/editor/live-cursors";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useCanvasAutosave, type SaveStatus } from "@/hooks/use-canvas-autosave";
import {
  DEFAULT_NODE_COLOR,
  SHAPE_DRAG_TYPE,
  type CanvasEdge,
  type CanvasNode,
  type CanvasOperation,
  type ShapeDragPayload,
} from "@/types/canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

// ─── Static registrations ─────────────────────────────────────────────────────

const nodeTypes = { canvasNode: CanvasNodeComponent };
const edgeTypes = { canvasEdge: CanvasEdgeComponent };

const defaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
} as const;

let nodeCounter = 0;

// ─── Canvas inner ──────────────────────────────────────────────────────────────

interface CanvasInnerProps {
  templateToImport?: CanvasTemplate | null;
  onTemplateImported?: () => void;
  projectId: string;
  onSaveStatusChange?: (status: SaveStatus) => void;
}

function CanvasInner({
  templateToImport,
  onTemplateImported,
  projectId,
  onSaveStatusChange,
}: CanvasInnerProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });

  const instance = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition } = instance;

  const undo = useUndo();
  const redo = useRedo();
  const [, updateMyPresence] = useMyPresence();

  const aiStatus = useStorage((root) => root.aiStatus);
  const isAiGenerating = aiStatus?.phase !== "complete";

  useKeyboardShortcuts(instance, undo, redo);

  // Keep stable refs so template effect and load effect never stale
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const onNodesChangeRef = useRef(onNodesChange);
  const onEdgesChangeRef = useRef(onEdgesChange);
  nodesRef.current = nodes;
  edgesRef.current = edges;
  onNodesChangeRef.current = onNodesChange;
  onEdgesChangeRef.current = onEdgesChange;

  // Load saved canvas on mount — only when the Liveblocks room is empty
  useEffect(() => {
    async function loadSavedCanvas() {
      if (nodesRef.current.length > 0 || edgesRef.current.length > 0) return;

      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`);
        if (!res.ok) return;

        const { canvas } = (await res.json()) as {
          canvas: { nodes: CanvasNode[]; edges: CanvasEdge[] } | null;
        };
        if (!canvas || (!canvas.nodes?.length && !canvas.edges?.length)) return;

        if (canvas.nodes?.length) {
          onNodesChangeRef.current(
            canvas.nodes.map((n) => ({ type: "add" as const, item: n })),
          );
        }
        if (canvas.edges?.length) {
          onEdgesChangeRef.current(
            canvas.edges.map((e) => ({ type: "add" as const, item: e })),
          );
        }
        setTimeout(() => instance.fitView({ duration: 400 }), 100);
      } catch {
        // Silent — blob may not exist yet
      }
    }

    void loadSavedCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Template import: clear canvas then add template nodes/edges
  useEffect(() => {
    if (!templateToImport) return;

    const removeNodes = nodesRef.current.map((n) => ({
      type: "remove" as const,
      id: n.id,
    }));
    const removeEdges = edgesRef.current.map((e) => ({
      type: "remove" as const,
      id: e.id,
    }));

    if (removeNodes.length) onNodesChangeRef.current(removeNodes);
    if (removeEdges.length) onEdgesChangeRef.current(removeEdges);

    onNodesChangeRef.current(
      templateToImport.nodes.map((n) => ({ type: "add" as const, item: n })),
    );
    onEdgesChangeRef.current(
      templateToImport.edges.map((e) => ({ type: "add" as const, item: e })),
    );

    setTimeout(() => instance.fitView({ duration: 400 }), 100);
    onTemplateImported?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateToImport]);

  // AI canvas event listener — apply AI-generated operations from the background task
  useEventListener(({ event }) => {
    if (event.type === "ai-canvas-ops") {
      const ops = event.operations as CanvasOperation[];
      for (const op of ops) {
        if (op.type === "add-node") {
          const node: CanvasNode = {
            id: op.node.id,
            type: "canvasNode",
            position: op.node.position,
            width: op.node.width,
            height: op.node.height,
            data: op.node.data,
          };
          onNodesChangeRef.current([{ type: "add", item: node }]);
        } else if (op.type === "delete-node") {
          onNodesChangeRef.current([{ type: "remove", id: op.id }]);
        } else if (op.type === "update-node") {
          const current = nodesRef.current.find((n) => n.id === op.id);
          if (current) {
            onNodesChangeRef.current([{
              type: "replace",
              id: op.id,
              item: {
                ...current,
                position: op.position ?? current.position,
                width: op.width ?? current.width,
                height: op.height ?? current.height,
                data: op.data ?? current.data,
              },
            }]);
          }
        } else if (op.type === "add-edge") {
          const edge: CanvasEdge = {
            id: op.edge.id,
            source: op.edge.source,
            target: op.edge.target,
            type: "canvasEdge",
            data: op.edge.data.label ? { label: op.edge.data.label } : {},
          };
          onEdgesChangeRef.current([{ type: "add", item: edge }]);
        } else if (op.type === "delete-edge") {
          onEdgesChangeRef.current([{ type: "remove", id: op.id }]);
        }
      }
      setTimeout(() => instance.fitView({ duration: 400 }), 200);
    }
  });

  // Autosave — debounced, skips the first render
  useCanvasAutosave({
    nodes,
    edges,
    projectId,
    onStatusChange: onSaveStatusChange,
  });

  // Custom onConnect to ensure new edges use the canvasEdge type + arrow
  const onConnect = useCallback(
    (connection: Connection) => {
      nodeCounter += 1;
      const newEdge: CanvasEdge = {
        id: `edge-${Date.now()}-${nodeCounter}`,
        source: connection.source ?? "",
        target: connection.target ?? "",
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: "canvasEdge",
        data: {},
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
      };
      onEdgesChange([{ type: "add", item: newEdge }]);
    },
    [onEdgesChange],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData(SHAPE_DRAG_TYPE);
      if (!raw) return;

      const payload = JSON.parse(raw) as ShapeDragPayload;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      nodeCounter += 1;
      const id = `${payload.shape}-${Date.now()}-${nodeCounter}`;

      const newNode: CanvasNode = {
        id,
        type: "canvasNode",
        position: {
          x: position.x - payload.width / 2,
          y: position.y - payload.height / 2,
        },
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR.fill,
          textColor: DEFAULT_NODE_COLOR.text,
          shape: payload.shape,
        },
        width: payload.width,
        height: payload.height,
      };

      onNodesChange([{ type: "add", item: newNode }]);
    },
    [screenToFlowPosition, onNodesChange],
  );

  // Cursor broadcasting
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      updateMyPresence({ cursor: { x: position.x, y: position.y } });
    },
    [screenToFlowPosition, updateMyPresence],
  );

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const defaultEdgeOptionsMemo = useMemo(() => defaultEdgeOptions, []);

  return (
    <div
      className="relative h-full w-full"
      onDragOver={isAiGenerating ? undefined : handleDragOver}
      onDrop={isAiGenerating ? undefined : handleDrop}
      onMouseLeave={handleMouseLeave}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={isAiGenerating ? undefined : onConnect}
        onDelete={isAiGenerating ? undefined : onDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptionsMemo}
        connectionMode={ConnectionMode.Loose}
        onMouseMove={handleMouseMove}
        nodesDraggable={!isAiGenerating}
        nodesConnectable={!isAiGenerating}
        elementsSelectable={!isAiGenerating}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Panel position="top-right" className="m-2">
          <PresenceAvatars />
        </Panel>
        <Panel position="bottom-left" className="mb-4 ml-4">
          <CanvasControls />
        </Panel>
        <Panel position="bottom-center" className="mb-4">
          <ShapePanel />
        </Panel>
      </ReactFlow>
      <LiveCursors />
      {isAiGenerating && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-8">
          <div className="flex items-center gap-2 rounded-full border border-surface-border bg-surface/90 px-4 py-2 shadow-lg backdrop-blur-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-ai-text" />
            <span className="text-xs text-copy-muted">AI is designing…</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Public export ─────────────────────────────────────────────────────────────

interface CanvasProps {
  templateToImport?: CanvasTemplate | null;
  onTemplateImported?: () => void;
  projectId: string;
  onSaveStatusChange?: (status: SaveStatus) => void;
}

export function Canvas({
  templateToImport,
  onTemplateImported,
  projectId,
  onSaveStatusChange,
}: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner
        templateToImport={templateToImport}
        onTemplateImported={onTemplateImported}
        projectId={projectId}
        onSaveStatusChange={onSaveStatusChange}
      />
    </ReactFlowProvider>
  );
}
