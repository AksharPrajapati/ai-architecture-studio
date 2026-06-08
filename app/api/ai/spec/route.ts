import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";

import { badRequest, unauthorized } from "@/lib/api/responses";
import { getAccessibleProject } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import type { generateSpecTask } from "@/trigger/generate-spec";

const RequestSchema = z.object({
  roomId: z.string().min(1),
  chatHistory: z.array(z.any()).default([]),
  nodes: z.array(z.any()).default([]),
  edges: z.array(z.any()).default([]),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("roomId is required");
  }

  const { roomId, chatHistory, nodes, edges } = parsed.data;

  // Room ID equals project ID in this application.
  const result = await getAccessibleProject(roomId);

  if (result.kind === "unauthenticated") return unauthorized();
  if (result.kind === "not_found" || result.kind === "forbidden") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { project, identity } = result;

  const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory,
    nodes,
    edges,
  });

  await prisma.taskRun.create({
    data: {
      projectId: project.id,
      userId: identity.userId,
      taskId: "generate-spec",
      runId: handle.id,
    },
  });

  return Response.json({ runId: handle.id }, { status: 201 });
}
