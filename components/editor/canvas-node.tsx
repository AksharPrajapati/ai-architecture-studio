"use client";

import { useState } from "react";
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  type NodeProps,
} from "@xyflow/react";
import { useMutation } from "@liveblocks/react";

import {
  CSS_BORDER_RADIUS,
  CylinderSvg,
  DiamondSvg,
  HexagonSvg,
  SVG_SHAPES,
} from "@/components/editor/node-shapes";
import {
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  type CanvasNode,
  type CanvasNodeData,
} from "@/types/canvas";

// ─── Color swatch ────────────────────────────────────────────────────────────

function ColorSwatch({
  fill,
  text,
  isActive,
  onClick,
}: {
  fill: string;
  text: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const shadow = isActive
    ? `0 0 0 2px ${text}`
    : hovered
      ? `0 0 0 2px ${text}40`
      : "none";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="h-5 w-5 cursor-pointer rounded-full transition-all"
      style={{ backgroundColor: fill, boxShadow: shadow }}
    />
  );
}

// ─── Handles ─────────────────────────────────────────────────────────────────

const HANDLES = (
  <>
    <Handle type="source" position={Position.Top} id="top-source" />
    <Handle type="target" position={Position.Top} id="top-target" />
    <Handle type="source" position={Position.Right} id="right-source" />
    <Handle type="target" position={Position.Right} id="right-target" />
    <Handle type="source" position={Position.Bottom} id="bottom-source" />
    <Handle type="target" position={Position.Bottom} id="bottom-target" />
    <Handle type="source" position={Position.Left} id="left-source" />
    <Handle type="target" position={Position.Left} id="left-target" />
  </>
);

// ─── Node component ───────────────────────────────────────────────────────────

export function CanvasNodeComponent({
  id,
  data,
  width,
  height,
  selected,
}: NodeProps<CanvasNode>) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(data.label);

  const w = width ?? 160;
  const h = height ?? 80;
  const textColor = data.textColor ?? DEFAULT_NODE_COLOR.text;
  const isSvg = SVG_SHAPES.has(data.shape);
  const radiusClass = CSS_BORDER_RADIUS[data.shape] ?? "rounded-xl";

  // Update any subset of node data through the Liveblocks LiveObject tree.
  // storage.get("flow") → LiveObject → get("nodes") → LiveMap → get(id) →
  // LiveObject<CanvasNode> → get("data") → LiveObject<CanvasNodeData>
  const updateData = useMutation(
    ({ storage }, updates: Partial<CanvasNodeData>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeData = (storage as any)
        .get("flow")
        ?.get("nodes")
        ?.get(id)
        ?.get("data");
      if (!nodeData) return;
      for (const [key, value] of Object.entries(updates)) {
        nodeData.set(key, value);
      }
    },
    [id],
  );

  function startEditing() {
    setDraft(data.label);
    setIsEditing(true);
  }

  function commitEdit() {
    updateData({ label: draft });
    setIsEditing(false);
  }

  function handleTextKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    }
  }

  // ── Shared sub-elements ────────────────────────────────────────────────────

  const resizer = (
    <NodeResizer
      isVisible={!!selected}
      minWidth={80}
      minHeight={40}
      handleStyle={{
        width: 8,
        height: 8,
        backgroundColor: "var(--bg-elevated)",
        border: "1.5px solid var(--border-subtle)",
        borderRadius: 2,
      }}
      lineStyle={{ borderColor: "var(--accent-primary)", opacity: 0.3 }}
    />
  );

  const toolbar = (
    <NodeToolbar isVisible={!!selected} position={Position.Top} offset={8}>
      <div className="nodrag nopan flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-2.5 py-1.5 shadow-lg">
        {NODE_COLORS.map((pair) => (
          <ColorSwatch
            key={pair.fill}
            fill={pair.fill}
            text={pair.text}
            isActive={data.color === pair.fill}
            onClick={() =>
              updateData({ color: pair.fill, textColor: pair.text })
            }
          />
        ))}
      </div>
    </NodeToolbar>
  );

  const labelContent = isEditing ? (
    <textarea
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      value={draft}
      rows={2}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commitEdit}
      onKeyDown={handleTextKeyDown}
      className="nodrag nopan absolute inset-0 resize-none bg-transparent p-2 text-center text-sm font-medium outline-none"
      style={{ color: textColor }}
    />
  ) : (
    <span
      onDoubleClick={startEditing}
      className="cursor-text select-none px-2 text-center text-sm font-medium leading-tight"
      style={{ color: textColor }}
    >
      {data.label || (
        <span style={{ color: "var(--text-faint)" }}>Label</span>
      )}
    </span>
  );

  // ── CSS shapes ─────────────────────────────────────────────────────────────

  if (!isSvg) {
    return (
      <>
        {toolbar}
        <div
          className={`relative flex items-center justify-center border ${selected ? "border-brand" : "border-surface-border"} ${radiusClass}`}
          style={{ width: w, height: h, backgroundColor: data.color }}
        >
          {resizer}
          {HANDLES}
          {labelContent}
        </div>
      </>
    );
  }

  // ── SVG shapes ─────────────────────────────────────────────────────────────

  return (
    <>
      {toolbar}
      <div style={{ position: "relative", width: w, height: h }}>
        {resizer}
        {data.shape === "diamond" && (
          <DiamondSvg width={w} height={h} fill={data.color} selected={!!selected} />
        )}
        {data.shape === "hexagon" && (
          <HexagonSvg width={w} height={h} fill={data.color} selected={!!selected} />
        )}
        {data.shape === "cylinder" && (
          <CylinderSvg width={w} height={h} fill={data.color} selected={!!selected} />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          {labelContent}
        </div>
        {HANDLES}
      </div>
    </>
  );
}
