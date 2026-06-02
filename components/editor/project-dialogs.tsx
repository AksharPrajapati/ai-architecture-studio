"use client";

import { useEffect, useRef } from "react";

import {
  EditorDialog,
  EditorDialogBody,
  EditorDialogContent,
  EditorDialogDescription,
  EditorDialogFooter,
  EditorDialogHeader,
  EditorDialogInput,
  EditorDialogTitle,
} from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import type { UseProjectActionsReturn } from "@/hooks/use-project-actions";

interface ProjectDialogsProps {
  dialogs: UseProjectActionsReturn;
}

function ProjectNameField({
  id,
  label,
  value,
  onChange,
  onSubmit,
  inputRef,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={id} className="text-sm font-medium text-copy-primary">
        {label}
      </label>
      <EditorDialogInput
        ref={inputRef}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit();
          }
        }}
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  );
}

export function ProjectDialogs({ dialogs }: ProjectDialogsProps) {
  const renameInputRef = useRef<HTMLInputElement>(null);

  const {
    mode,
    projectName,
    setProjectName,
    roomIdPreview,
    activeProject,
    isLoading,
    submitCreate,
    submitRename,
    submitDelete,
    handleDialogOpenChange,
    closeDialog,
  } = dialogs;

  useEffect(() => {
    if (mode !== "rename") return;
    const frame = requestAnimationFrame(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  return (
    <>
      <EditorDialog
        open={mode === "create"}
        onOpenChange={handleDialogOpenChange}
      >
        <EditorDialogContent showCloseButton>
          <EditorDialogHeader>
            <EditorDialogTitle>Create Project</EditorDialogTitle>
            <EditorDialogDescription>
              Give your architecture workspace a name.
            </EditorDialogDescription>
          </EditorDialogHeader>
          <EditorDialogBody>
            <ProjectNameField
              id="create-project-name"
              label="Project name"
              value={projectName}
              onChange={setProjectName}
              onSubmit={() => void submitCreate()}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-copy-primary">
                Room ID preview
              </span>
              <p className="font-mono text-sm text-copy-secondary">
                {roomIdPreview}
              </p>
            </div>
          </EditorDialogBody>
          <EditorDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!projectName.trim() || isLoading}
              onClick={() => void submitCreate()}
            >
              {isLoading ? "Creating…" : "Create Project"}
            </Button>
          </EditorDialogFooter>
        </EditorDialogContent>
      </EditorDialog>

      <EditorDialog
        open={mode === "rename"}
        onOpenChange={handleDialogOpenChange}
      >
        <EditorDialogContent showCloseButton>
          <EditorDialogHeader>
            <EditorDialogTitle>Rename Project</EditorDialogTitle>
            <EditorDialogDescription>
              Current name: {activeProject?.name ?? ""}
            </EditorDialogDescription>
          </EditorDialogHeader>
          <EditorDialogBody>
            <ProjectNameField
              id="rename-project-name"
              label="Project name"
              value={projectName}
              onChange={setProjectName}
              onSubmit={() => void submitRename()}
              inputRef={renameInputRef}
              disabled={isLoading}
            />
          </EditorDialogBody>
          <EditorDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!projectName.trim() || isLoading}
              onClick={() => void submitRename()}
            >
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </EditorDialogFooter>
        </EditorDialogContent>
      </EditorDialog>

      <EditorDialog
        open={mode === "delete"}
        onOpenChange={handleDialogOpenChange}
      >
        <EditorDialogContent showCloseButton>
          <EditorDialogHeader>
            <EditorDialogTitle>Delete Project</EditorDialogTitle>
            <EditorDialogDescription>
              This will permanently delete &ldquo;{activeProject?.name}&rdquo;.
              This action cannot be undone.
            </EditorDialogDescription>
          </EditorDialogHeader>
          <EditorDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={() => void submitDelete()}
            >
              {isLoading ? "Deleting…" : "Delete Project"}
            </Button>
          </EditorDialogFooter>
        </EditorDialogContent>
      </EditorDialog>
    </>
  );
}
