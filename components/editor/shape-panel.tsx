"use client";

import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { NodeShape, ShapeDragPayload } from "@/types/canvas";
import { SHAPE_DRAG_TYPE } from "@/types/canvas";

interface ShapeConfig {
  shape: NodeShape;
  icon: LucideIcon;
  label: string;
  width: number;
  height: number;
}

const SHAPES: ShapeConfig[] = [
  {
    shape: "rectangle",
    icon: RectangleHorizontal,
    label: "Rectangle",
    width: 160,
    height: 80,
  },
  {
    shape: "diamond",
    icon: Diamond,
    label: "Diamond",
    width: 130,
    height: 130,
  },
  {
    shape: "circle",
    icon: Circle,
    label: "Circle",
    width: 80,
    height: 80,
  },
  {
    shape: "pill",
    icon: Pill,
    label: "Pill",
    width: 140,
    height: 60,
  },
  {
    shape: "cylinder",
    icon: Cylinder,
    label: "Cylinder",
    width: 100,
    height: 80,
  },
  {
    shape: "hexagon",
    icon: Hexagon,
    label: "Hexagon",
    width: 120,
    height: 120,
  },
];

function ShapeButton({ shape, icon: Icon, label, width, height }: ShapeConfig) {
  function handleDragStart(event: React.DragEvent) {
    const payload: ShapeDragPayload = { shape, width, height };
    event.dataTransfer.setData(SHAPE_DRAG_TYPE, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "copy";
  }

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      aria-label={`Add ${label}`}
      className="flex cursor-grab items-center justify-center rounded-xl p-2 text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary active:cursor-grabbing"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export function ShapePanel() {
  return (
    <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface px-3 py-2 shadow-lg">
      {SHAPES.map((config) => (
        <ShapeButton key={config.shape} {...config} />
      ))}
    </div>
  );
}
