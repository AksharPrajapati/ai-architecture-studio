import { auth, currentUser } from "@clerk/nextjs/server";

import type { Project } from "@/app/generated/prisma/client";
import { findProjectById } from "@/lib/projects/service";
import { prisma } from "@/lib/prisma";

export interface UserIdentity {
  userId: string;
  email: string | null;
}

export async function getCurrentUserIdentity(): Promise<UserIdentity | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;

  return { userId, email };
}

export async function userHasProjectAccess(
  project: Pick<Project, "id" | "ownerId">,
  identity: UserIdentity,
): Promise<boolean> {
  if (project.ownerId === identity.userId) {
    return true;
  }

  if (!identity.email) {
    return false;
  }

  const collaborator = await prisma.projectCollaborator.findUnique({
    where: {
      projectId_email: {
        projectId: project.id,
        email: identity.email,
      },
    },
  });

  return collaborator !== null;
}

export async function getAccessibleProject(projectId: string) {
  const project = await findProjectById(projectId);

  if (!project) {
    return { kind: "not_found" as const };
  }

  const identity = await getCurrentUserIdentity();

  if (!identity) {
    return { kind: "unauthenticated" as const };
  }

  const hasAccess = await userHasProjectAccess(project, identity);

  if (!hasAccess) {
    return { kind: "forbidden" as const };
  }

  return { kind: "ok" as const, project, identity };
}
