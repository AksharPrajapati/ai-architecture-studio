"use client";

import { Copy, Loader2, Trash2, User } from "lucide-react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UseShareDialogReturn } from "@/hooks/use-share-dialog";
import type { Collaborator } from "@/types/collaborator";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  share: UseShareDialogReturn;
}

function CollaboratorAvatar({
  collaborator,
}: {
  collaborator: Collaborator;
}) {
  const label = collaborator.displayName ?? collaborator.email;

  if (collaborator.imageUrl) {
    return (
      <img
        src={collaborator.imageUrl}
        alt={label}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-copy-muted"
      aria-hidden
    >
      <User className="h-4 w-4" />
    </div>
  );
}

function CollaboratorRow({
  collaborator,
  isOwner,
  isRemoving,
  onRemove,
}: {
  collaborator: Collaborator;
  isOwner: boolean;
  isRemoving: boolean;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl px-2 py-2">
      <CollaboratorAvatar collaborator={collaborator} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-copy-primary">
          {collaborator.displayName ?? collaborator.email}
        </p>
        {collaborator.displayName ? (
          <p className="truncate text-xs text-copy-muted">{collaborator.email}</p>
        ) : null}
      </div>
      {isOwner ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${collaborator.email}`}
          disabled={isRemoving}
          onClick={onRemove}
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </Button>
      ) : null}
    </li>
  );
}

export function ShareDialog({ open, onOpenChange, share }: ShareDialogProps) {
  const {
    collaborators,
    inviteEmail,
    setInviteEmail,
    isLoading,
    isInviting,
    removingId,
    error,
    copied,
    isOwner,
    inviteCollaborator,
    removeCollaborator,
    copyProjectLink,
  } = share;

  return (
    <EditorDialog open={open} onOpenChange={onOpenChange}>
      <EditorDialogContent showCloseButton className="sm:max-w-lg">
        <EditorDialogHeader>
          <EditorDialogTitle>Share project</EditorDialogTitle>
          <EditorDialogDescription>
            {isOwner
              ? "Invite collaborators by email or copy the project link."
              : "People with access to this project."}
          </EditorDialogDescription>
        </EditorDialogHeader>

        <EditorDialogBody className="space-y-4">
          {isOwner ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-copy-primary">
                Project link
              </span>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void copyProjectLink()}
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy link"}
              </Button>
            </div>
          ) : null}

          {isOwner ? (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="invite-collaborator-email"
                className="text-sm font-medium text-copy-primary"
              >
                Invite by email
              </label>
              <div className="flex gap-2">
                <EditorDialogInput
                  id="invite-collaborator-email"
                  type="email"
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void inviteCollaborator();
                    }
                  }}
                  disabled={isInviting}
                  autoComplete="email"
                />
                <Button
                  type="button"
                  disabled={!inviteEmail.trim() || isInviting}
                  onClick={() => void inviteCollaborator()}
                >
                  {isInviting ? "Inviting…" : "Invite"}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-copy-primary">
              Collaborators
            </span>
            <ScrollArea className="max-h-48 rounded-2xl border border-surface-border bg-subtle/40">
              {isLoading ? (
                <div className="flex items-center justify-center px-4 py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-copy-muted" />
                </div>
              ) : collaborators.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-copy-muted">
                  No collaborators yet
                </p>
              ) : (
                <ul className="px-2 py-2">
                  {collaborators.map((collaborator) => (
                    <CollaboratorRow
                      key={collaborator.id}
                      collaborator={collaborator}
                      isOwner={isOwner}
                      isRemoving={removingId === collaborator.id}
                      onRemove={() => void removeCollaborator(collaborator.id)}
                    />
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>

          {error ? (
            <p className={cn("text-sm text-destructive")} role="alert">
              {error}
            </p>
          ) : null}
        </EditorDialogBody>

        <EditorDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </EditorDialogFooter>
      </EditorDialogContent>
    </EditorDialog>
  );
}
