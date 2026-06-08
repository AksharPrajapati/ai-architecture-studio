import { forbidden, notFound, unauthorized } from "@/lib/api/responses";
import { requireUserId } from "@/lib/auth/require-user";
import { getAccessibleProject } from "@/lib/project-access";
import { listProjectSpecs } from "@/lib/projects/spec-service";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) return authResult;

  const { projectId } = await context.params;

  const access = await getAccessibleProject(projectId);
  if (access.kind === "not_found") return notFound();
  if (access.kind === "unauthenticated") return unauthorized();
  if (access.kind === "forbidden") return forbidden();

  const specs = await listProjectSpecs(projectId);

  return Response.json({ specs });
}
