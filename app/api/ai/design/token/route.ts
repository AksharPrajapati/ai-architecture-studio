import { auth } from "@trigger.dev/sdk/v3";

import { badRequest, unauthorized } from "@/lib/api/responses";
import { parseJsonBody, readRequiredString } from "@/lib/api/parse-json-body";
import { requireUserId } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) return authResult;

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const runId = readRequiredString(parsed.body, "runId");
  if (!runId) return badRequest("runId is required");

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } });

  if (!taskRun) return Response.json({ error: "Not found" }, { status: 404 });

  if (taskRun.userId !== authResult.userId) return unauthorized();

  const publicToken = await auth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "1h",
  });

  return Response.json({ token: publicToken });
}
