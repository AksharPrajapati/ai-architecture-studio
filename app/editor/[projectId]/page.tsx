interface ProjectWorkspacePageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  const { projectId } = await params;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-medium text-copy-primary">Workspace</h1>
      <p className="mt-2 font-mono text-sm text-copy-muted">{projectId}</p>
    </div>
  );
}
