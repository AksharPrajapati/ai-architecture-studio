import type { ProjectCollaborator } from "@/app/generated/prisma/client";
import { getClerkProfilesByEmails } from "@/lib/clerk/user-profiles";
import { prisma } from "@/lib/prisma";
import type { Collaborator } from "@/types/collaborator";

import { findProjectById } from "./service";

function serializeCollaborator(row: ProjectCollaborator) {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function enrichCollaborators(
  rows: ProjectCollaborator[],
): Promise<Collaborator[]> {
  const serialized = rows.map(serializeCollaborator);
  const profiles = await getClerkProfilesByEmails(
    serialized.map((row) => row.email),
  );

  return serialized.map((row) => {
    const profile = profiles.get(row.email.toLowerCase());

    return {
      ...row,
      displayName: profile?.displayName ?? null,
      imageUrl: profile?.imageUrl ?? null,
    };
  });
}

export async function listCollaboratorsForProject(projectId: string) {
  return prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });
}

export async function inviteCollaboratorForOwner(
  projectId: string,
  ownerId: string,
  email: string,
  ownerEmail: string | null,
) {
  const project = await findProjectById(projectId);

  if (!project) {
    return { kind: "not_found" as const };
  }

  if (project.ownerId !== ownerId) {
    return { kind: "forbidden" as const };
  }

  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    return { kind: "invalid" as const, message: "Invalid email address" };
  }

  if (ownerEmail && normalized === ownerEmail.toLowerCase()) {
    return {
      kind: "invalid" as const,
      message: "You cannot invite yourself as a collaborator",
    };
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: {
      projectId_email: {
        projectId,
        email: normalized,
      },
    },
  });

  if (existing) {
    return { kind: "conflict" as const };
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: {
      projectId,
      email: normalized,
    },
  });

  const [enriched] = await enrichCollaborators([collaborator]);

  return { kind: "ok" as const, collaborator: enriched };
}

export async function removeCollaboratorForOwner(
  projectId: string,
  ownerId: string,
  collaboratorId: string,
) {
  const project = await findProjectById(projectId);

  if (!project) {
    return { kind: "not_found" as const };
  }

  if (project.ownerId !== ownerId) {
    return { kind: "forbidden" as const };
  }

  const collaborator = await prisma.projectCollaborator.findFirst({
    where: { id: collaboratorId, projectId },
  });

  if (!collaborator) {
    return { kind: "not_found" as const };
  }

  await prisma.projectCollaborator.delete({
    where: { id: collaboratorId },
  });

  return { kind: "ok" as const };
}
