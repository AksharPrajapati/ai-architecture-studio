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

const VB_W = 320;
const VB_H = 180;
const PADDING = 16;

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
  const availW = VB_W - PADDING * 2;
  const availH = VB_H - PADDING * 2;
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
        return <ellipse key={n.id} cx={cx} cy={cy} rx={nw / 2} ry={nh / 2} fill={fill} stroke="var(--border-subtle)" strokeWidth={1} />;
      case "pill":
        return <rect key={n.id} x={x} y={y} width={nw} height={nh} rx={nh / 2} fill={fill} stroke="var(--border-subtle)" strokeWidth={1} />;
      case "diamond": {
        const pts = `${cx},${y} ${x + nw},${cy} ${cx},${y + nh} ${x},${cy}`;
        return <polygon key={n.id} points={pts} fill={fill} stroke="var(--border-subtle)" strokeWidth={1} />;
      }
      case "hexagon": {
        const pts = [
          `${x + nw * 0.25},${y}`, `${x + nw * 0.75},${y}`,
          `${x + nw},${cy}`, `${x + nw * 0.75},${y + nh}`,
          `${x + nw * 0.25},${y + nh}`, `${x},${cy}`,
        ].join(" ");
        return <polygon key={n.id} points={pts} fill={fill} stroke="var(--border-subtle)" strokeWidth={1} />;
      }
      case "cylinder":
        return <rect key={n.id} x={x} y={y} width={nw} height={nh} rx={4} fill={fill} stroke="var(--border-subtle)" strokeWidth={1} />;
      default:
        return <rect key={n.id} x={x} y={y} width={nw} height={nh} rx={4} fill={fill} stroke="var(--border-subtle)" strokeWidth={1} />;
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
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full rounded-xl"
      style={{ background: "var(--bg-base)", aspectRatio: `${VB_W} / ${VB_H}` }}
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
            stroke="var(--border-subtle)"
            strokeWidth={1.5}
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
      <DialogContent className="w-full max-w-[calc(100%-2rem)] rounded-3xl border border-surface-border bg-surface p-6 ring-0 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-copy-primary">
            Starter Templates
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[68vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-elevated p-4 transition-colors hover:bg-subtle"
              >
                <TemplatePreview template={template} />

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-copy-primary">
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
                  className="mt-auto w-full cursor-pointer border-surface-border-subtle text-copy-secondary hover:bg-subtle hover:text-copy-primary"
                  onClick={() => handleImport(template)}
                >
                  Import
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
