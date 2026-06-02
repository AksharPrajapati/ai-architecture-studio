import { badRequest } from "@/lib/api/responses";
import {
  parseJsonBody,
  readOptionalString,
} from "@/lib/api/parse-json-body";
import { requireUserId } from "@/lib/auth/require-user";
import { isValidProjectRoomId } from "@/lib/projects/room-id";
import {
  createProjectForOwner,
  listProjectsForOwner,
} from "@/lib/projects/service";

export async function GET() {
  const authResult = await requireUserId();
  if (authResult instanceof Response) {
    return authResult;
  }

  const projects = await listProjectsForOwner(authResult.userId);
  return Response.json({ projects });
}

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) {
    return authResult;
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const name = readOptionalString(parsed.body, "name");
  const description = readOptionalString(parsed.body, "description");
  const id = readOptionalString(parsed.body, "id");

  if (name === null) {
    return badRequest("name must be a string");
  }

  if (description === null) {
    return badRequest("description must be a string or null");
  }

  if (id === null) {
    return badRequest("id must be a string");
  }

  if (id !== undefined && !isValidProjectRoomId(id)) {
    return badRequest("id is not a valid room id");
  }

  try {
    const project = await createProjectForOwner(
      authResult.userId,
      name,
      description,
      id,
    );

    return Response.json({ project }, { status: 201 });
  } catch {
    return Response.json(
      { error: "A project with this room id already exists" },
      { status: 409 },
    );
  }
}
