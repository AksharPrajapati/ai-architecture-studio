import { badRequest, forbidden, notFound } from "@/lib/api/responses";
import {
  parseJsonBody,
  readRequiredString,
} from "@/lib/api/parse-json-body";
import { requireUserId } from "@/lib/auth/require-user";
import {
  deleteProjectForOwner,
  renameProjectForOwner,
} from "@/lib/projects/service";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { projectId } = await context.params;

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const name = readRequiredString(parsed.body, "name");
  if (name === undefined) {
    return badRequest("name is required");
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return badRequest("name cannot be empty");
  }

  const result = await renameProjectForOwner(
    projectId,
    authResult.userId,
    trimmedName,
  );

  if (result.kind === "not_found") {
    return notFound();
  }

  if (result.kind === "forbidden") {
    return forbidden();
  }

  return Response.json({ project: result.project });
}

export async function DELETE(
  _request: Request,
  context: ProjectRouteContext,
) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { projectId } = await context.params;

  const result = await deleteProjectForOwner(projectId, authResult.userId);

  if (result.kind === "not_found") {
    return notFound();
  }

  if (result.kind === "forbidden") {
    return forbidden();
  }

  return new Response(null, { status: 204 });
}
