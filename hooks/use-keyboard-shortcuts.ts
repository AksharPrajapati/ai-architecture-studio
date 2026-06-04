"use client";

import { useEffect } from "react";

interface ZoomableInstance {
  zoomIn: (options?: { duration?: number }) => void;
  zoomOut: (options?: { duration?: number }) => void;
}

function isEditable(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts(
  instance: ZoomableInstance | null,
  onUndo: () => void,
  onRedo: () => void,
) {
  useEffect(() => {
    if (!instance) return;
    const zoom = instance;

    function onKeyDown(e: KeyboardEvent) {
      if (isEditable(e.target)) return;

      const ctrl = e.metaKey || e.ctrlKey;

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo();
        return;
      }
      if (
        (ctrl && e.shiftKey && e.key === "z") ||
        (ctrl && e.key === "Z") ||
        (ctrl && e.key === "y")
      ) {
        e.preventDefault();
        onRedo();
        return;
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoom.zoomIn({ duration: 200 });
        return;
      }
      if (e.key === "-") {
        e.preventDefault();
        zoom.zoomOut({ duration: 200 });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [instance, onUndo, onRedo]);
}
