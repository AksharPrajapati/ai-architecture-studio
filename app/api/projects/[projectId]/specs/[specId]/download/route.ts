import { forbidden, notFound, unauthorized } from "@/lib/api/responses";
import { requireUserId } from "@/lib/auth/require-user";
import { getAccessibleProject } from "@/lib/project-access";
import { getProjectSpec } from "@/lib/projects/spec-service";

interface RouteContext {
  params: Promise<{ projectId: string; specId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireUserId();
  if (authResult instanceof Response) return authResult;

  const { projectId, specId } = await context.params;

  const access = await getAccessibleProject(projectId);
  if (access.kind === "not_found") return notFound();
  if (access.kind === "unauthenticated") return unauthorized();
  if (access.kind === "forbidden") return forbidden();

  const spec = await getProjectSpec(specId, projectId);
  if (!spec) return notFound();

  const blobResponse = await fetch(spec.filePath);
  if (!blobResponse.ok) return notFound();

  const content = await blobResponse.text();
  const filename = `spec-${specId}.md`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
