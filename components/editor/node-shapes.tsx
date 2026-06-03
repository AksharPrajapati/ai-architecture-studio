"use client";

import type { NodeShape } from "@/types/canvas";

interface SvgShapeProps {
  width: number;
  height: number;
  fill: string;
  selected: boolean;
}

export function DiamondSvg({ width: w, height: h, fill, selected }: SvgShapeProps) {
  const points = `${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`;
  const stroke = selected ? "var(--accent-primary)" : "var(--border-default)";

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polygon points={points} style={{ fill, stroke, strokeWidth: 1.5 }} />
    </svg>
  );
}

export function HexagonSvg({ width: w, height: h, fill, selected }: SvgShapeProps) {
  const points = [
    `${w * 0.25},0`,
    `${w * 0.75},0`,
    `${w},${h / 2}`,
    `${w * 0.75},${h}`,
    `${w * 0.25},${h}`,
    `0,${h / 2}`,
  ].join(" ");
  const stroke = selected ? "var(--accent-primary)" : "var(--border-default)";

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polygon points={points} style={{ fill, stroke, strokeWidth: 1.5 }} />
    </svg>
  );
}

export function CylinderSvg({ width: w, height: h, fill, selected }: SvgShapeProps) {
  const rx = w / 2;
  const ry = Math.max(8, Math.min(h * 0.18, 18));
  const stroke = selected ? "var(--accent-primary)" : "var(--border-default)";

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <rect x={0} y={ry} width={w} height={h - 2 * ry} style={{ fill }} />
      <line x1={0} y1={ry} x2={0} y2={h - ry} style={{ stroke, strokeWidth: 1.5 }} />
      <line x1={w} y1={ry} x2={w} y2={h - ry} style={{ stroke, strokeWidth: 1.5 }} />
      <path
        d={`M 0 ${h - ry} A ${rx} ${ry} 0 0 1 ${w} ${h - ry}`}
        style={{ fill: "none", stroke, strokeWidth: 1.5 }}
      />
      <ellipse cx={rx} cy={ry} rx={rx} ry={ry} style={{ fill, stroke, strokeWidth: 1.5 }} />
    </svg>
  );
}

export const SVG_SHAPES = new Set<NodeShape>(["diamond", "hexagon", "cylinder"]);

export const CSS_BORDER_RADIUS: Partial<Record<NodeShape, string>> = {
  rectangle: "rounded-xl",
  pill: "rounded-full",
  circle: "rounded-full",
};
