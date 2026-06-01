"use client";

import { createContext, useContext } from "react";

import { ProjectDialogs } from "@/components/editor/project-dialogs";
import {
  useProjectDialogs,
  type UseProjectDialogsReturn,
} from "@/hooks/use-project-dialogs";

const ProjectDialogsContext = createContext<UseProjectDialogsReturn | null>(
  null
);

export function ProjectDialogsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dialogs = useProjectDialogs();

  return (
    <ProjectDialogsContext.Provider value={dialogs}>
      {children}
      <ProjectDialogs dialogs={dialogs} />
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogsContext(): UseProjectDialogsReturn {
  const context = useContext(ProjectDialogsContext);
  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used within ProjectDialogsProvider"
    );
  }
  return context;
}
