"use client";

import { Plus } from "lucide-react";

import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";
import { Button } from "@/components/ui/button";

export function EditorHome() {
  const { openCreate } = useProjectDialogsContext();

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-medium text-copy-primary">
        Create a project or open an existing one
      </h1>
      <p className="mt-2 max-w-md text-sm text-copy-muted">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <Button type="button" className="mt-6" onClick={openCreate}>
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </div>
  );
}
