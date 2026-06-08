"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buildProjectRoomId, generateShortSuffix } from "@/lib/projects/room-id";
import { slugifyProjectName } from "@/lib/projects/slug";
import type { Project } from "@/types/project";

export type ProjectDialogMode = "create" | "rename" | "delete" | null;

async function parseJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function useProjectActions() {
  const router = useRouter();
  const pathname = usePathname();

  const [mode, setMode] = useState<ProjectDialogMode>(null);
  const [projectName, setProjectName] = useState("");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [removedProjectIds, setRemovedProjectIds] = useState<Set<string>>(new Set());
  const [createSuffix, setCreateSuffix] = useState(() => generateShortSuffix());

  const roomIdPreview = useMemo(
    () => buildProjectRoomId(projectName || "untitled", createSuffix),
    [projectName, createSuffix],
  );

  const slugPreview = useMemo(
    () => slugifyProjectName(projectName),
    [projectName],
  );

  const openCreate = useCallback(() => {
    setActiveProject(null);
    setProjectName("");
    setCreateSuffix(generateShortSuffix());
    setMode("create");
  }, []);

  const openRename = useCallback((project: Project) => {
    setActiveProject(project);
    setProjectName(project.name);
    setMode("rename");
  }, []);

  const openDelete = useCallback((project: Project) => {
    setActiveProject(project);
    setProjectName("");
    setMode("delete");
  }, []);

  // Clear navigating state when pathname changes (navigation complete)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const closeDialog = useCallback(() => {
    if (isLoading) return;
    setMode(null);
    setActiveProject(null);
    setProjectName("");
  }, [isLoading]);

  const refreshProjects = useCallback(() => {
    router.refresh();
  }, [router]);

  const submitCreate = useCallback(async () => {
    const trimmedName = projectName.trim();
    if (!trimmedName || isLoading) return;

    const roomId = buildProjectRoomId(trimmedName, createSuffix);
    setIsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, id: roomId }),
      });

      if (!response.ok) {
        return;
      }

      const body = (await parseJsonResponse(response)) as {
        project?: { id: string };
      };
      const projectId = body.project?.id ?? roomId;

      setMode(null);
      setActiveProject(null);
      setProjectName("");
      setIsNavigating(true);
      router.push(`/editor/${projectId}`);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [projectName, isLoading, createSuffix, router]);

  const submitRename = useCallback(async () => {
    const trimmedName = projectName.trim();
    if (!trimmedName || !activeProject || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        return;
      }

      setMode(null);
      setActiveProject(null);
      setProjectName("");
      refreshProjects();
    } finally {
      setIsLoading(false);
    }
  }, [projectName, activeProject, isLoading, refreshProjects]);

  const submitDelete = useCallback(async () => {
    if (!activeProject || isLoading) return;

    const deletedProjectId = activeProject.id;
    const isActiveWorkspace =
      pathname === `/editor/${deletedProjectId}` ||
      pathname.startsWith(`/editor/${deletedProjectId}/`);

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${deletedProjectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        return;
      }

      setMode(null);
      setActiveProject(null);
      setProjectName("");
      setRemovedProjectIds((prev) => new Set([...prev, deletedProjectId]));

      if (isActiveWorkspace) {
        router.push("/editor");
      }

      refreshProjects();
    } finally {
      setIsLoading(false);
    }
  }, [activeProject, isLoading, pathname, router, refreshProjects]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeDialog();
    },
    [closeDialog],
  );

  return {
    mode,
    projectName,
    setProjectName,
    slugPreview,
    roomIdPreview,
    activeProject,
    isLoading,
    isNavigating,
    removedProjectIds,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
    handleDialogOpenChange,
  };
}

export type UseProjectActionsReturn = ReturnType<typeof useProjectActions>;
