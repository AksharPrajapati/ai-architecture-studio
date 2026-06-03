"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
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
import { DEFAULT_NODE_COLOR, SHAPE_DRAG_TYPE } from "@/types/canvas";
import {
  CylinderSvg,
  DiamondSvg,
  HexagonSvg,
  CSS_BORDER_RADIUS,
  SVG_SHAPES,
} from "@/components/editor/node-shapes";

interface ShapeConfig {
  shape: NodeShape;
  icon: LucideIcon;
  label: string;
  width: number;
  height: number;
}

const SHAPES: ShapeConfig[] = [
  { shape: "rectangle", icon: RectangleHorizontal, label: "Rectangle", width: 160, height: 80 },
  { shape: "diamond", icon: Diamond, label: "Diamond", width: 130, height: 130 },
  { shape: "circle", icon: Circle, label: "Circle", width: 80, height: 80 },
  { shape: "pill", icon: Pill, label: "Pill", width: 140, height: 60 },
  { shape: "cylinder", icon: Cylinder, label: "Cylinder", width: 100, height: 80 },
  { shape: "hexagon", icon: Hexagon, label: "Hexagon", width: 120, height: 120 },
];

interface DragPreviewState {
  shape: NodeShape;
  width: number;
  height: number;
  x: number;
  y: number;
}

function ShapeGhost({ shape, width: w, height: h }: { shape: NodeShape; width: number; height: number }) {
  const fill = DEFAULT_NODE_COLOR.fill;

  if (SVG_SHAPES.has(shape)) {
    return (
      <>
        {shape === "diamond" && <DiamondSvg width={w} height={h} fill={fill} selected={false} />}
        {shape === "hexagon" && <HexagonSvg width={w} height={h} fill={fill} selected={false} />}
        {shape === "cylinder" && <CylinderSvg width={w} height={h} fill={fill} selected={false} />}
      </>
    );
  }

  const radiusClass = CSS_BORDER_RADIUS[shape] ?? "rounded-xl";
  return (
    <div
      className={`${radiusClass} border border-surface-border`}
      style={{ width: w, height: h, backgroundColor: fill }}
    />
  );
}

interface ShapeButtonProps extends ShapeConfig {
  onDragStart: (event: React.DragEvent, config: ShapeConfig) => void;
  onDrag: (event: React.DragEvent) => void;
  onDragEnd: () => void;
}

function ShapeButton({
  shape,
  icon: Icon,
  label,
  width,
  height,
  onDragStart,
  onDrag,
  onDragEnd,
}: ShapeButtonProps) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => onDragStart(e, { shape, icon: Icon, label, width, height })}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      aria-label={`Add ${label}`}
      className="flex cursor-grab items-center justify-center rounded-xl p-2 text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary active:cursor-grabbing"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export function ShapePanel() {
  const [dragPreview, setDragPreview] = useState<DragPreviewState | null>(null);

  function handleDragStart(event: React.DragEvent, config: ShapeConfig) {
    const emptyImg = document.createElement("img");
    emptyImg.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
    event.dataTransfer.setDragImage(emptyImg, 0, 0);

    const payload: ShapeDragPayload = {
      shape: config.shape,
      width: config.width,
      height: config.height,
    };
    event.dataTransfer.setData(SHAPE_DRAG_TYPE, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "copy";

    setDragPreview({
      shape: config.shape,
      width: config.width,
      height: config.height,
      x: event.clientX,
      y: event.clientY,
    });
  }

  function handleDrag(event: React.DragEvent) {
    if (event.clientX === 0 && event.clientY === 0) return;
    setDragPreview((prev) =>
      prev ? { ...prev, x: event.clientX, y: event.clientY } : null,
    );
  }

  function handleDragEnd() {
    setDragPreview(null);
  }

  return (
    <>
      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface px-3 py-2 shadow-lg">
        {SHAPES.map((config) => (
          <ShapeButton
            key={config.shape}
            {...config}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
      {dragPreview &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: dragPreview.x - dragPreview.width / 2,
              top: dragPreview.y - dragPreview.height / 2,
              width: dragPreview.width,
              height: dragPreview.height,
              opacity: 0.6,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <ShapeGhost
              shape={dragPreview.shape}
              width={dragPreview.width}
              height={dragPreview.height}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
