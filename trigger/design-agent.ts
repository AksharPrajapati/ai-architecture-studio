import { task, logger, metadata } from "@trigger.dev/sdk/v3";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

import { getLiveblocks } from "@/lib/liveblocks";
import { NODE_COLORS, type CanvasOperation } from "@/types/canvas";

const NodeSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier for this node, e.g. 'api-gateway'"),
  label: z.string().describe("Short display label for the node"),
  shape: z
    .enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"])
    .describe(
      "rectangle=service/component, cylinder=database/storage, circle=user/actor, pill=event/queue, hexagon=external system, diamond=gateway/router",
    ),
  colorIndex: z
    .number()
    .int()
    .min(0)
    .max(7)
    .describe(
      "Index into the color palette (0=dark, 1=blue, 2=purple, 3=orange, 4=red, 5=pink, 6=green, 7=teal)",
    ),
  x: z.number().describe("X position in canvas coordinates"),
  y: z.number().describe("Y position in canvas coordinates"),
  width: z.number().describe("Node width in pixels, typically 140-200"),
  height: z.number().describe("Node height in pixels, typically 50-70"),
});

const EdgeSchema = z.object({
  source: z.string().describe("ID of the source node"),
  target: z.string().describe("ID of the target node"),
  label: z
    .string()
    .optional()
    .describe("Optional short label for this connection"),
});

const DesignSchema = z.object({
  nodes: z.array(NodeSchema).min(3).describe("All nodes in the architecture"),
  edges: z.array(EdgeSchema).describe("All connections between nodes"),
  summary: z
    .string()
    .describe("One-sentence summary of the generated architecture"),
});

interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

const SYSTEM_PROMPT = `You are an expert software architect. Given a user's system description, generate a clear and well-structured architecture diagram.

Layout rules:
- Space nodes at least 220px apart horizontally, 160px vertically
- Arrange nodes in a logical flow (left-to-right or top-to-bottom)
- Group related services close together
- Put external actors (users, clients) on the left; databases/storage on the right or bottom

Shape usage:
- rectangle: microservices, APIs, backend services
- cylinder: databases, caches, object storage
- circle: users, clients, external actors
- pill: message queues, event buses, async channels
- hexagon: third-party/external systems
- diamond: API gateways, load balancers, routers

Color guidance (by index):
- 0 (dark): generic/default services
- 1 (blue): core business services, APIs
- 2 (purple): auth, identity, security
- 3 (orange): messaging, notifications, async workers
- 4 (red): critical path, high-load services
- 5 (pink): frontend, BFF, client-facing
- 6 (green): data, analytics, reporting
- 7 (teal): caches, CDN, edge services

Always produce a complete, connected architecture. Use meaningful IDs (kebab-case). Generate at least 4 nodes.`;

export const designAgentTask = task({
  id: "design-agent",
  maxDuration: 300,
  run: async (payload: DesignAgentPayload) => {
    const { prompt, roomId } = payload;

    logger.info("Design agent started", { roomId, prompt });

    const lb = getLiveblocks();

    // Broadcast thinking state
    await lb.broadcastEvent(roomId, { type: "ai-thinking", thinking: true });
    await lb.broadcastEvent(roomId, {
      type: "ai-status",
      message: "Analyzing your architecture requirements…",
      phase: "start",
    });
    metadata.set("status", "thinking");

    try {
      metadata.set("status", "generating");
      await lb.broadcastEvent(roomId, {
        type: "ai-status",
        message: "Designing the architecture…",
        phase: "processing",
      });

      const { object: design } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: DesignSchema,
        system: SYSTEM_PROMPT,
        prompt,
      });

      logger.info("Architecture generated", {
        nodes: design.nodes.length,
        edges: design.edges.length,
        summary: design.summary,
      });

      metadata.set("status", "applying");
      await lb.broadcastEvent(roomId, {
        type: "ai-status",
        message: "Applying design to canvas…",
        phase: "processing",
      });

      // Build canvas nodes
      const canvasNodes = design.nodes.map((n) => {
        const color =
          NODE_COLORS[Math.min(n.colorIndex, NODE_COLORS.length - 1)];
        return {
          id: n.id,
          type: "canvasNode" as const,
          position: { x: n.x, y: n.y },
          width: n.width,
          height: n.height,
          data: {
            label: n.label,
            shape: n.shape,
            color: color.fill,
            textColor: color.text,
          },
        };
      });

      // Build canvas edges — deduplicate source/target pairs
      const seen = new Set<string>();
      const canvasEdges = design.edges
        .filter((e) => {
          const key = `${e.source}→${e.target}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((e, i) => ({
          id: `ai-edge-${i}`,
          source: e.source,
          target: e.target,
          type: "canvasEdge" as const,
          data: { label: e.label ?? "" },
        }));

      // Send all operations in one broadcast
      const operations: CanvasOperation[] = [
        ...canvasNodes.map(
          (node): CanvasOperation => ({ type: "add-node", node }),
        ),
        ...canvasEdges.map(
          (edge): CanvasOperation => ({ type: "add-edge", edge }),
        ),
      ];

      await lb.broadcastEvent(roomId, { type: "ai-canvas-ops", operations });

      metadata.set("status", "complete");
      metadata.set("summary", design.summary);

      await lb.broadcastEvent(roomId, {
        type: "ai-status",
        message: design.summary,
        phase: "complete",
      });

      logger.info("Design agent complete", {
        roomId,
        nodeCount: canvasNodes.length,
        edgeCount: canvasEdges.length,
      });

      return {
        summary: design.summary,
        nodeCount: canvasNodes.length,
        edgeCount: canvasEdges.length,
      };
    } catch (error) {
      logger.error("Design agent failed", { roomId, error: String(error) });

      metadata.set("status", "error");

      await lb.broadcastEvent(roomId, {
        type: "ai-status",
        message: "Something went wrong. Please try again.",
        phase: "error",
      });

      throw error;
    } finally {
      await lb.broadcastEvent(roomId, { type: "ai-thinking", thinking: false });
    }
  },
});
