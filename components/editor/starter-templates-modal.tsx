"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CanvasNode } from "@/types/canvas";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates";

// ─── Lightweight SVG preview ──────────────────────────────────────────────────

const PREVIEW_W = 260;
const PREVIEW_H = 150;
const PADDING = 12;

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const { nodes, edges } = template;
  if (nodes.length === 0) return null;

  // Compute bounds from node positions + dimensions
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const nw = n.width ?? 120;
    const nh = n.height ?? 70;
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + nw);
    maxY = Math.max(maxY, n.position.y + nh);
  }

  const bw = maxX - minX || 1;
  const bh = maxY - minY || 1;
  const availW = PREVIEW_W - PADDING * 2;
  const availH = PREVIEW_H - PADDING * 2;
  const scale = Math.min(availW / bw, availH / bh, 1);
  const ox = PADDING + (availW - bw * scale) / 2 - minX * scale;
  const oy = PADDING + (availH - bh * scale) / 2 - minY * scale;

  function toSvg(n: CanvasNode) {
    const nw = (n.width ?? 120) * scale;
    const nh = (n.height ?? 70) * scale;
    const x = n.position.x * scale + ox;
    const y = n.position.y * scale + oy;
    const cx = x + nw / 2;
    const cy = y + nh / 2;
    const fill = n.data.color;

    switch (n.data.shape) {
      case "circle":
        return <ellipse key={n.id} cx={cx} cy={cy} rx={nw / 2} ry={nh / 2} fill={fill} stroke="var(--border-default)" strokeWidth={1} />;
      case "pill":
        return <rect key={n.id} x={x} y={y} width={nw} height={nh} rx={nh / 2} fill={fill} stroke="var(--border-default)" strokeWidth={1} />;
      case "diamond": {
        const pts = `${cx},${y} ${x + nw},${cy} ${cx},${y + nh} ${x},${cy}`;
        return <polygon key={n.id} points={pts} fill={fill} stroke="var(--border-default)" strokeWidth={1} />;
      }
      case "hexagon": {
        const pts = [
          `${x + nw * 0.25},${y}`, `${x + nw * 0.75},${y}`,
          `${x + nw},${cy}`, `${x + nw * 0.75},${y + nh}`,
          `${x + nw * 0.25},${y + nh}`, `${x},${cy}`,
        ].join(" ");
        return <polygon key={n.id} points={pts} fill={fill} stroke="var(--border-default)" strokeWidth={1} />;
      }
      case "cylinder":
        return <rect key={n.id} x={x} y={y} width={nw} height={nh} rx={4} fill={fill} stroke="var(--border-default)" strokeWidth={1} />;
      default: // rectangle
        return <rect key={n.id} x={x} y={y} width={nw} height={nh} rx={4} fill={fill} stroke="var(--border-default)" strokeWidth={1} />;
    }
  }

  // Map node id → center for edge lines
  const centers = new Map<string, { x: number; y: number }>();
  for (const n of nodes) {
    const nw = (n.width ?? 120) * scale;
    const nh = (n.height ?? 70) * scale;
    centers.set(n.id, {
      x: n.position.x * scale + ox + nw / 2,
      y: n.position.y * scale + oy + nh / 2,
    });
  }

  return (
    <svg
      width={PREVIEW_W}
      height={PREVIEW_H}
      className="rounded-xl"
      style={{ background: "var(--bg-base)" }}
    >
      {edges.map((e) => {
        const s = centers.get(e.source);
        const t = centers.get(e.target);
        if (!s || !t) return null;
        return (
          <line
            key={e.id}
            x1={s.x} y1={s.y}
            x2={t.x} y2={t.y}
            stroke="var(--text-faint)"
            strokeWidth={1}
          />
        );
      })}
      {nodes.map(toSvg)}
    </svg>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Starter Templates</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-elevated p-4"
            >
              <TemplatePreview template={template} />

              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-copy-primary">
                  {template.name}
                </p>
                <p className="text-xs leading-relaxed text-copy-muted">
                  {template.description}
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-auto w-full"
                onClick={() => handleImport(template)}
              >
                Import
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
