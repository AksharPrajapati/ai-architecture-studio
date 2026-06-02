"use client";

import { createContext, useContext } from "react";

import { ProjectDialogs } from "@/components/editor/project-dialogs";
import {
  useProjectActions,
  type UseProjectActionsReturn,
} from "@/hooks/use-project-actions";

const ProjectDialogsContext = createContext<UseProjectActionsReturn | null>(
  null
);

export function ProjectDialogsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dialogs = useProjectActions();

  return (
    <ProjectDialogsContext.Provider value={dialogs}>
      {children}
      <ProjectDialogs dialogs={dialogs} />
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogsContext(): UseProjectActionsReturn {
  const context = useContext(ProjectDialogsContext);
  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used within ProjectDialogsProvider"
    );
  }
  return context;
}
