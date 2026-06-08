"use client";

import { Loader2 } from "lucide-react";
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
      {dialogs.isNavigating && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-page/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm text-copy-muted">Setting up your workspace…</p>
        </div>
      )}
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
