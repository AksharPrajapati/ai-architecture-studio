import { useCallback, useEffect, useRef, useState } from "react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseCanvasAutosaveOptions {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  projectId: string;
  debounceMs?: number;
  onStatusChange?: (status: SaveStatus) => void;
}

export function useCanvasAutosave({
  nodes,
  edges,
  projectId,
  debounceMs = 2500,
  onStatusChange,
}: UseCanvasAutosaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setStatus = useCallback(
    (status: SaveStatus) => {
      setSaveStatus(status);
      onStatusChange?.(status);
    },
    [onStatusChange],
  );

  const save = useCallback(
    async (n: CanvasNode[], e: CanvasEdge[]) => {
      setStatus("saving");
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes: n, edges: e }),
        });
        if (!isMountedRef.current) return;
        if (!response.ok) throw new Error("Save failed");
        setStatus("saved");
      } catch {
        if (!isMountedRef.current) return;
        setStatus("error");
      }
    },
    [projectId, setStatus],
  );

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      void save(nodes, edges);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nodes, edges, save, debounceMs]);

  return { saveStatus };
}
