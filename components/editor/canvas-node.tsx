"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { CanvasNode } from "@/types/canvas";

export function CanvasNodeComponent({
  data,
  width,
  height,
}: NodeProps<CanvasNode>) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-surface-border"
      style={{
        width: width ?? 160,
        height: height ?? 80,
        backgroundColor: data.color,
      }}
    >
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <span className="select-none px-2 text-center text-sm font-medium text-copy-primary">
        {data.label}
      </span>
    </div>
  );
}
