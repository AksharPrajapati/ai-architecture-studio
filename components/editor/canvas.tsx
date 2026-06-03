"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo } from "@liveblocks/react";

import { CanvasNodeComponent } from "@/components/editor/canvas-node";
import { CanvasEdgeComponent } from "@/components/editor/canvas-edge";
import { CanvasControls } from "@/components/editor/canvas-controls";
import { ShapePanel } from "@/components/editor/shape-panel";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import {
  DEFAULT_NODE_COLOR,
  SHAPE_DRAG_TYPE,
  type CanvasEdge,
  type CanvasNode,
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
}

function CanvasInner({ templateToImport, onTemplateImported }: CanvasInnerProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });

  const instance = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition } = instance;

  const undo = useUndo();
  const redo = useRedo();

  useKeyboardShortcuts(instance, undo, redo);

  // Keep stable refs so the template effect never stales
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const onNodesChangeRef = useRef(onNodesChange);
  const onEdgesChangeRef = useRef(onEdgesChange);
  nodesRef.current = nodes;
  edgesRef.current = edges;
  onNodesChangeRef.current = onNodesChange;
  onEdgesChangeRef.current = onEdgesChange;

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

  const defaultEdgeOptionsMemo = useMemo(() => defaultEdgeOptions, []);

  return (
    <div
      className="h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptionsMemo}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
        <Panel position="bottom-left" className="mb-4 ml-4">
          <CanvasControls />
        </Panel>
        <Panel position="bottom-center" className="mb-4">
          <ShapePanel />
        </Panel>
      </ReactFlow>
    </div>
  );
}

// ─── Public export ─────────────────────────────────────────────────────────────

interface CanvasProps {
  templateToImport?: CanvasTemplate | null;
  onTemplateImported?: () => void;
}

export function Canvas({ templateToImport, onTemplateImported }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner
        templateToImport={templateToImport}
        onTemplateImported={onTemplateImported}
      />
    </ReactFlowProvider>
  );
}
