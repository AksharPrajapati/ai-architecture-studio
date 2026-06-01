"use client";

import { useCallback, useMemo, useState } from "react";

import { slugifyProjectName } from "@/lib/projects/slug";
import type { Project } from "@/types/project";

export type ProjectDialogMode = "create" | "rename" | "delete" | null;

export function useProjectDialogs() {
  const [mode, setMode] = useState<ProjectDialogMode>(null);
  const [projectName, setProjectName] = useState("");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const slugPreview = useMemo(
    () => slugifyProjectName(projectName),
    [projectName]
  );

  const openCreate = useCallback(() => {
    setActiveProject(null);
    setProjectName("");
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

  const closeDialog = useCallback(() => {
    if (isLoading) return;
    setMode(null);
    setActiveProject(null);
    setProjectName("");
  }, [isLoading]);

  const runMockSubmit = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsLoading(false);
    setMode(null);
    setActiveProject(null);
    setProjectName("");
  }, []);

  const submitCreate = useCallback(() => {
    if (!projectName.trim() || isLoading) return;
    void runMockSubmit();
  }, [projectName, isLoading, runMockSubmit]);

  const submitRename = useCallback(() => {
    if (!projectName.trim() || !activeProject || isLoading) return;
    void runMockSubmit();
  }, [projectName, activeProject, isLoading, runMockSubmit]);

  const submitDelete = useCallback(() => {
    if (!activeProject || isLoading) return;
    void runMockSubmit();
  }, [activeProject, isLoading, runMockSubmit]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeDialog();
    },
    [closeDialog]
  );

  return {
    mode,
    projectName,
    setProjectName,
    slugPreview,
    activeProject,
    isLoading,
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

export type UseProjectDialogsReturn = ReturnType<typeof useProjectDialogs>;
