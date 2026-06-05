// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data

// Liveblocks requires all RoomEvent values to be valid JSON (no undefined).
// These inline types mirror CanvasOperation from types/canvas.ts but use
// null instead of optional fields so they satisfy the JsonObject constraint.
type AiCanvasNode = {
  id: string;
  type: "canvasNode";
  position: { x: number; y: number };
  width: number;
  height: number;
  data: { label: string; color: string; textColor: string; shape: string };
};

type AiCanvasEdge = {
  id: string;
  source: string;
  target: string;
  type: "canvasEdge";
  data: { label: string };
};

type AiCanvasOperation =
  | { type: "add-node"; node: AiCanvasNode }
  | { type: "update-node"; id: string; position: { x: number; y: number } | null; width: number | null; height: number | null; data: { label: string; color: string; textColor: string; shape: string } | null }
  | { type: "delete-node"; id: string }
  | { type: "add-edge"; edge: AiCanvasEdge }
  | { type: "delete-edge"; id: string };

declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {};

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent:
      | { type: "ai-canvas-ops"; operations: AiCanvasOperation[] }
      | { type: "ai-thinking"; thinking: boolean }
      | { type: "ai-status"; message: string; phase: "start" | "processing" | "complete" | "error" };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {};

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: {};
  }
}

export {};
