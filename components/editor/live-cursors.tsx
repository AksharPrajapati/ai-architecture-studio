"use client";

import { Loader2 } from "lucide-react";
import { useOthers } from "@liveblocks/react";
import { useStore } from "@xyflow/react";
import { useUser } from "@clerk/nextjs";

interface CursorProps {
  x: number;
  y: number;
  name: string;
  color: string;
  thinking: boolean;
}

function Cursor({ x, y, name, color, thinking }: CursorProps) {
  const transform = useStore((s) => s.transform);
  const [tx, ty, zoom] = transform;

  const screenX = x * zoom + tx;
  const screenY = y * zoom + ty;

  return (
    <div
      className="pointer-events-none absolute left-0 top-0"
      style={{ transform: `translate(${screenX}px, ${screenY}px)` }}
    >
      <svg
        width="12"
        height="16"
        viewBox="0 0 12 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1L1 13L4 10L6 15L8 14L6 9L10 9Z"
          fill={color}
          stroke="white"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className="ml-2 mt-0.5 flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {thinking && (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        )}
        {name}
      </div>
    </div>
  );
}

export function LiveCursors() {
  const { user } = useUser();
  const currentUserId = user?.id;
  const others = useOthers();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {others
        .filter(
          (other) =>
            other.id !== currentUserId && other.presence.cursor !== null,
        )
        .map((other) => {
          const cursor = other.presence.cursor;
          if (!cursor) return null;
          return (
            <Cursor
              key={other.connectionId}
              x={cursor.x}
              y={cursor.y}
              name={other.info?.name ?? "Unknown"}
              color={other.info?.color ?? "#808090"}
              thinking={other.presence.thinking ?? false}
            />
          );
        })}
    </div>
  );
}
