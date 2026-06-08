import { z } from "zod";

export const AiStatusPayloadSchema = z.object({
  message: z.string(),
  phase: z.enum(["start", "processing", "complete", "error"]),
  text: z.string().optional(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  sender: z.string(),
  timestamp: z.string(),
});

export type AiStatusPayload = z.infer<typeof AiStatusPayloadSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
