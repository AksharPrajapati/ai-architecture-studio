import type { Project } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_PROJECT_NAME = "Untitled Project";

export function serializeProject(project: Project) {
  return {
    id: project.id,
    ownerId: project.ownerId,
    name: project.name,
    description: project.description,
    status: project.status,
    canvasJsonPath: project.canvasJsonPath,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function listProjectsForOwner(ownerId: string) {
  const projects = await prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });

  return projects.map(serializeProject);
}

export async function createProjectForOwner(
  ownerId: string,
  name?: string,
  description?: string | null,
  id?: string,
) {
  const project = await prisma.project.create({
    data: {
      ...(id ? { id } : {}),
      ownerId,
      name: name?.trim() || DEFAULT_PROJECT_NAME,
      description: description ?? undefined,
    },
  });

  return serializeProject(project);
}

export async function listProjectsSharedWithUser(email: string) {
  const collaborators = await prisma.projectCollaborator.findMany({
    where: { email: email.toLowerCase() },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return collaborators.map(({ project }) => serializeProject(project));
}

export async function findProjectById(projectId: string) {
  return prisma.project.findUnique({ where: { id: projectId } });
}

export async function renameProjectForOwner(
  projectId: string,
  ownerId: string,
  name: string,
) {
  const project = await findProjectById(projectId);

  if (!project) {
    return { kind: "not_found" as const };
  }

  if (project.ownerId !== ownerId) {
    return { kind: "forbidden" as const };
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  });

  return { kind: "ok" as const, project: serializeProject(updated) };
}

export async function deleteProjectForOwner(projectId: string, ownerId: string) {
  const project = await findProjectById(projectId);

  if (!project) {
    return { kind: "not_found" as const };
  }

  if (project.ownerId !== ownerId) {
    return { kind: "forbidden" as const };
  }

  await prisma.project.delete({ where: { id: projectId } });

  return { kind: "ok" as const };
}
