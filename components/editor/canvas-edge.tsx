"use client";

import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { useMutation } from "@liveblocks/react";

import type { CanvasEdge, CanvasEdgeData } from "@/types/canvas";

export function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(data?.label ?? "");

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 6,
  });

  // Update edge label through the Liveblocks LiveObject tree.
  // storage → get("flow") → get("edges") → get(id) → get("data") → set("label", ...)
  const updateLabel = useMutation(
    ({ storage }, label: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const edgeData = (storage as any)
        .get("flow")
        ?.get("edges")
        ?.get(id)
        ?.get("data");
      if (!edgeData) return;
      edgeData.set("label", label);
    },
    [id],
  );

  function commitLabel() {
    updateLabel(draft.trim());
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      commitLabel();
    }
  }

  const stroke = selected
    ? "var(--accent-primary)"
    : "var(--text-faint)";

  const savedLabel = (data as CanvasEdgeData | undefined)?.label;

  return (
    <>
      {/* Wide transparent hit area so the edge is easier to click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: "pointer" }}
      />

      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke,
          strokeWidth: 1.5,
          strokeLinecap: "round",
          transition: "stroke 0.15s",
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onDoubleClick={() => {
            setDraft(savedLabel ?? "");
            setIsEditing(true);
          }}
        >
          {isEditing ? (
            <input
              type="text"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={handleKeyDown}
              size={Math.max(4, draft.length)}
              className="nodrag nopan rounded-xl border border-surface-border bg-surface px-2 py-0.5 text-xs text-copy-primary outline-none"
            />
          ) : savedLabel ? (
            <span className="cursor-default select-none rounded-full border border-surface-border bg-surface px-2 py-0.5 text-xs text-copy-secondary">
              {savedLabel}
            </span>
          ) : selected ? (
            <span className="cursor-default select-none text-xs text-copy-faint">
              Add label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
