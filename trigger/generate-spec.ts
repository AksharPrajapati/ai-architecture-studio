import { task, logger, metadata } from "@trigger.dev/sdk/v3";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

import {
  createSpecRecord,
  saveSpecBlob,
} from "@/lib/projects/spec-service";

const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  sender: z.string(),
  timestamp: z.string(),
});

const NodeDataSchema = z.object({
  label: z.string(),
  shape: z.string(),
  color: z.string(),
  textColor: z.string(),
});

const CanvasNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  width: z.number().optional(),
  height: z.number().optional(),
  data: NodeDataSchema,
});

const CanvasEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
  data: z.object({ label: z.string().optional() }).optional(),
});

const GenerateSpecPayloadSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(ChatMessageSchema),
  nodes: z.array(CanvasNodeSchema),
  edges: z.array(CanvasEdgeSchema),
});

type GenerateSpecPayload = z.infer<typeof GenerateSpecPayloadSchema>;

const SYSTEM_PROMPT = `You are a senior software architect. Your task is to generate a comprehensive technical specification document in Markdown format based on a system architecture diagram and conversation context.

The specification should include:

1. **Overview** — A brief description of the system and its purpose
2. **Architecture Summary** — High-level description of the architecture pattern
3. **Components** — Detailed description of each component/node in the system
4. **Data Flow** — How data moves between components
5. **Connections** — Description of each connection/edge in the diagram
6. **Technical Considerations** — Scalability, reliability, security notes
7. **Implementation Notes** — Key implementation details derived from the architecture

Keep the specification clear, concise, and actionable. Use Markdown formatting throughout.`;

function buildPrompt(payload: GenerateSpecPayload): string {
  const nodeDescriptions = payload.nodes.map((n) => {
    const edges = payload.edges.filter(
      (e) => e.source === n.id || e.target === n.id,
    );
    const connections = edges
      .map((e) => {
        if (e.source === n.id) {
          const target = payload.nodes.find((t) => t.id === e.target);
          return `connects to "${target?.data.label ?? e.target}"${e.data?.label ? ` (${e.data.label})` : ""}`;
        }
        const source = payload.nodes.find((s) => s.id === e.source);
        return `receives from "${source?.data.label ?? e.source}"${e.data?.label ? ` (${e.data.label})` : ""}`;
      })
      .join(", ");

    return `- **${n.data.label}** (${n.data.shape}): ${connections || "standalone"}`;
  });

  const chatContext = payload.chatHistory
    .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
    .join("\n");

  return `Canvas Architecture (${payload.nodes.length} components, ${payload.edges.length} connections):

${nodeDescriptions.join("\n")}

${chatContext ? `\nConversation context:\n${chatContext}` : ""}

Generate a complete technical specification for this architecture.`;
}

export const generateSpecTask = task({
  id: "generate-spec",
  maxDuration: 300,
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 60_000,
    randomize: true,
  },
  run: async (payload: GenerateSpecPayload) => {
    const parsed = GenerateSpecPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(`Invalid payload: ${parsed.error.message}`);
    }

    const { projectId, roomId } = parsed.data;

    logger.info("Spec generation started", {
      projectId,
      roomId,
      nodeCount: parsed.data.nodes.length,
      edgeCount: parsed.data.edges.length,
    });

    metadata.set("status", "generating");
    metadata.set("projectId", projectId);

    try {
      const prompt = buildPrompt(parsed.data);

      metadata.set("status", "processing");

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system: SYSTEM_PROMPT,
        prompt,
        maxRetries: 0,
      });

      metadata.set("status", "saving");

      const specId = await createSpecRecord(projectId);
      await saveSpecBlob(projectId, specId, text);

      metadata.set("status", "complete");
      metadata.set("specLength", text.length);
      metadata.set("specId", specId);

      logger.info("Spec generation complete", {
        projectId,
        specId,
        specLength: text.length,
      });

      return { specContent: text, projectId, specId };
    } catch (error) {
      metadata.set("status", "error");
      logger.error("Spec generation failed", {
        projectId,
        error: String(error),
      });
      throw error;
    }
  },
});
