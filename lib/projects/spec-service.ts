import { put } from "@vercel/blob";

import { prisma } from "@/lib/prisma";

export async function saveSpecBlob(
  projectId: string,
  specId: string,
  content: string,
): Promise<string> {
  const blob = await put(`specs/${projectId}/${specId}.md`, content, {
    access: "private",
    contentType: "text/markdown",
    allowOverwrite: true,
  });

  await prisma.projectSpec.update({
    where: { id: specId },
    data: { filePath: blob.url },
  });

  return blob.url;
}

export async function createSpecRecord(projectId: string): Promise<string> {
  const spec = await prisma.projectSpec.create({
    data: { projectId, filePath: "" },
  });
  return spec.id;
}

export async function listProjectSpecs(projectId: string) {
  return prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { id: true, filePath: true, createdAt: true },
  });
}

export async function getProjectSpec(specId: string, projectId: string) {
  return prisma.projectSpec.findFirst({
    where: { id: specId, projectId },
  });
}
