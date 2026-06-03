"use client";

import { useCallback, useEffect, useState } from "react";

import type { Collaborator } from "@/types/collaborator";

async function parseJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function readCollaborators(payload: unknown): Collaborator[] {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("collaborators" in payload) ||
    !Array.isArray((payload as { collaborators: unknown }).collaborators)
  ) {
    return [];
  }

  return (payload as { collaborators: Collaborator[] }).collaborators;
}

function readCollaborator(payload: unknown): Collaborator | null {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("collaborator" in payload) ||
    typeof (payload as { collaborator: unknown }).collaborator !== "object"
  ) {
    return null;
  }

  return (payload as { collaborator: Collaborator }).collaborator;
}

export function useShareDialog(projectId: string, isOwner: boolean, open: boolean) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadCollaborators = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`);
      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof (payload as { error: unknown }).error === "string"
            ? (payload as { error: string }).error
            : "Failed to load collaborators";
        setError(message);
        return;
      }

      setCollaborators(readCollaborators(payload));
    } catch {
      setError("Failed to load collaborators");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void loadCollaborators();
  }, [open, loadCollaborators]);

  useEffect(() => {
    if (!open) {
      setInviteEmail("");
      setError(null);
      setCopied(false);
    }
  }, [open]);

  const inviteCollaborator = useCallback(async () => {
    const trimmed = inviteEmail.trim();
    if (!trimmed) {
      return;
    }

    setIsInviting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof (payload as { error: unknown }).error === "string"
            ? (payload as { error: string }).error
            : "Failed to invite collaborator";
        setError(message);
        return;
      }

      const collaborator = readCollaborator(payload);
      if (collaborator) {
        setCollaborators((current) => {
          if (current.some((entry) => entry.id === collaborator.id)) {
            return current;
          }
          return [...current, collaborator];
        });
      }

      setInviteEmail("");
    } catch {
      setError("Failed to invite collaborator");
    } finally {
      setIsInviting(false);
    }
  }, [inviteEmail, projectId]);

  const removeCollaborator = useCallback(
    async (collaboratorId: string) => {
      setRemovingId(collaboratorId);
      setError(null);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators/${collaboratorId}`,
          { method: "DELETE" },
        );

        if (!response.ok) {
          const payload = await parseJsonResponse(response);
          const message =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof (payload as { error: unknown }).error === "string"
              ? (payload as { error: string }).error
              : "Failed to remove collaborator";
          setError(message);
          return;
        }

        setCollaborators((current) =>
          current.filter((entry) => entry.id !== collaboratorId),
        );
      } catch {
        setError("Failed to remove collaborator");
      } finally {
        setRemovingId(null);
      }
    },
    [projectId],
  );

  const copyProjectLink = useCallback(async () => {
    const url = `${window.location.origin}/editor/${projectId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy link");
    }
  }, [projectId]);

  return {
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
    reloadCollaborators: loadCollaborators,
  };
}

export type UseShareDialogReturn = ReturnType<typeof useShareDialog>;
