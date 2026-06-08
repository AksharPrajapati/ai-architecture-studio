import { tasks } from "@trigger.dev/sdk/v3";

import { badRequest, unauthorized } from "@/lib/api/responses";
import { parseJsonBody, readRequiredString } from "@/lib/api/parse-json-body";
import { getAccessibleProject } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import type { designAgentTask } from "@/trigger/design-agent";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const prompt = readRequiredString(parsed.body, "prompt");
  const roomId = readRequiredString(parsed.body, "roomId");
  const projectId = readRequiredString(parsed.body, "projectId");

  if (!prompt || !roomId || !projectId) {
    return badRequest("prompt, roomId, and projectId are required");
  }

  const result = await getAccessibleProject(projectId);

  if (result.kind === "unauthenticated") return unauthorized();
  if (result.kind === "not_found" || result.kind === "forbidden") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { identity } = result;

  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
    prompt,
    roomId,
  });

  await prisma.taskRun.create({
    data: {
      projectId,
      userId: identity.userId,
      taskId: "design-agent",
      runId: handle.id,
    },
  });

  return Response.json({ runId: handle.id }, { status: 201 });
}
