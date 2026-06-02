import { forbidden, notFound } from "@/lib/api/responses";
import { requireUserId } from "@/lib/auth/require-user";
import { removeCollaboratorForOwner } from "@/lib/projects/collaborators";

interface CollaboratorRouteContext {
  params: Promise<{ projectId: string; collaboratorId: string }>;
}

export async function DELETE(
  _request: Request,
  context: CollaboratorRouteContext,
) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { projectId, collaboratorId } = await context.params;

  const result = await removeCollaboratorForOwner(
    projectId,
    authResult.userId,
    collaboratorId,
  );

  if (result.kind === "not_found") {
    return notFound();
  }

  if (result.kind === "forbidden") {
    return forbidden();
  }

  return new Response(null, { status: 204 });
}
