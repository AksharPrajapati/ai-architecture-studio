import {
  badRequest,
  forbidden,
  notFound,
} from "@/lib/api/responses";
import {
  parseJsonBody,
  readRequiredString,
} from "@/lib/api/parse-json-body";
import { requireUserId } from "@/lib/auth/require-user";
import { getCurrentUserIdentity, userHasProjectAccess } from "@/lib/project-access";
import {
  enrichCollaborators,
  inviteCollaboratorForOwner,
  listCollaboratorsForProject,
} from "@/lib/projects/collaborators";
import { findProjectById } from "@/lib/projects/service";

interface CollaboratorsRouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(
  _request: Request,
  context: CollaboratorsRouteContext,
) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { projectId } = await context.params;
  const project = await findProjectById(projectId);

  if (!project) {
    return notFound();
  }

  const identity = await getCurrentUserIdentity();

  if (!identity || !(await userHasProjectAccess(project, identity))) {
    return forbidden();
  }

  const rows = await listCollaboratorsForProject(projectId);
  const collaborators = await enrichCollaborators(rows);

  return Response.json({ collaborators });
}

export async function POST(
  request: Request,
  context: CollaboratorsRouteContext,
) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) {
    return authResult;
  }

  const { projectId } = await context.params;

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const email = readRequiredString(parsed.body, "email");
  if (email === undefined) {
    return badRequest("email is required");
  }

  const identity = await getCurrentUserIdentity();
  const result = await inviteCollaboratorForOwner(
    projectId,
    authResult.userId,
    email,
    identity?.email ?? null,
  );

  if (result.kind === "not_found") {
    return notFound();
  }

  if (result.kind === "forbidden") {
    return forbidden();
  }

  if (result.kind === "invalid") {
    return badRequest(result.message);
  }

  if (result.kind === "conflict") {
    return Response.json(
      { error: "This collaborator has already been invited" },
      { status: 409 },
    );
  }

  return Response.json({ collaborator: result.collaborator }, { status: 201 });
}
