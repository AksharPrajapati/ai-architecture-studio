import { put } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export async function saveCanvasBlob(
  projectId: string,
  state: CanvasState,
): Promise<string> {
  const json = JSON.stringify(state);
  const blob = await put(`canvas/${projectId}.json`, json, {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return blob.url;
}

export async function loadCanvasBlob(
  projectId: string,
): Promise<CanvasState | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  });

  if (!project?.canvasJsonPath) {
    return null;
  }

  const response = await fetch(project.canvasJsonPath);
  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<CanvasState>;
}
