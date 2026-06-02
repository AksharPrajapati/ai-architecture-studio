import { auth, currentUser } from "@clerk/nextjs/server";

import {
  listProjectsForOwner,
  listProjectsSharedWithUser,
  serializeProject,
} from "@/lib/projects/service";
import type { Project, SharedProject } from "@/types/project";

type SerializedProject = ReturnType<typeof serializeProject>;

function toSidebarProject(project: SerializedProject): Project {
  return {
    id: project.id,
    name: project.name,
    slug: project.id,
  };
}

export async function getEditorProjectLists(): Promise<{
  ownedProjects: Project[];
  sharedProjects: SharedProject[];
}> {
  const { userId } = await auth();

  if (!userId) {
    return { ownedProjects: [], sharedProjects: [] };
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;

  const [owned, shared] = await Promise.all([
    listProjectsForOwner(userId),
    email ? listProjectsSharedWithUser(email) : Promise.resolve([]),
  ]);

  return {
    ownedProjects: owned.map(toSidebarProject),
    sharedProjects: shared.map((project) => ({
      ...toSidebarProject(project),
      ownerName: "Project owner",
    })),
  };
}
