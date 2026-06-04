import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api/responses";
import { requireUserId } from "@/lib/auth/require-user";
import { getAccessibleProject } from "@/lib/project-access";
import { loadCanvasBlob, saveCanvasBlob } from "@/lib/projects/canvas-service";

interface CanvasRouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(_request: Request, context: CanvasRouteContext) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) return authResult;

  const { projectId } = await context.params;

  const access = await getAccessibleProject(projectId);
  if (access.kind === "not_found") return notFound();
  if (access.kind === "unauthenticated") return unauthorized();
  if (access.kind === "forbidden") return forbidden();

  const canvas = await loadCanvasBlob(projectId);
  return Response.json({ canvas });
}

export async function PUT(request: Request, context: CanvasRouteContext) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) return authResult;

  const { projectId } = await context.params;

  const access = await getAccessibleProject(projectId);
  if (access.kind === "not_found") return notFound();
  if (access.kind === "unauthenticated") return unauthorized();
  if (access.kind === "forbidden") return forbidden();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest("Invalid canvas state");
  }

  await saveCanvasBlob(projectId, body as Parameters<typeof saveCanvasBlob>[1]);
  return Response.json({ ok: true });
}
