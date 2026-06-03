"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";

interface ProjectListItemProps {
  project: Project;
  subtitle?: string;
  isActive?: boolean;
  showActions?: boolean;
  onRename?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectListItem({
  project,
  subtitle,
  isActive = false,
  showActions = false,
  onRename,
  onDelete,
}: ProjectListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-subtle/80",
        isActive && "bg-accent-dim ring-1 ring-brand/30",
      )}
    >
      <Link
        href={`/editor/${project.id}`}
        className="min-w-0 flex-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-lg"
      >
        <p className="truncate text-sm font-medium text-copy-primary">
          {project.name}
        </p>
        {subtitle ? (
          <p className="truncate text-xs text-copy-muted">{subtitle}</p>
        ) : (
          <p className="truncate font-mono text-xs text-copy-faint">
            {project.slug}
          </p>
        )}
      </Link>

      {showActions ? (
        <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Rename ${project.name}`}
            onClick={() => onRename?.(project)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${project.name}`}
            onClick={() => onDelete?.(project)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
