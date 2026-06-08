import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceLayout } from "@/components/editor/workspace-layout";
import { getClerkAuthPaths } from "@/lib/clerk";
import { getEditorProjectLists } from "@/lib/projects/data";
import { findProjectById } from "@/lib/projects/service";
import {
  getCurrentUserIdentity,
  userHasProjectAccess,
} from "@/lib/project-access";

interface ProjectWorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  const { projectId } = await params;

  const identity = await getCurrentUserIdentity();

  if (!identity) {
    redirect(getClerkAuthPaths().signIn);
  }

  const project = await findProjectById(projectId);

  if (!project || !(await userHasProjectAccess(project, identity))) {
    return (
      <div className="flex h-screen flex-col bg-page">
        <AccessDenied />
      </div>
    );
  }

  const { ownedProjects, sharedProjects } = await getEditorProjectLists();

  return (
    <WorkspaceLayout
      projectName={project.name}
      roomId={projectId}
      isOwner={project.ownerId === identity.userId}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  );
}
