"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  center,
  right,
  className,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center border-b border-surface-border bg-surface px-3",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-[1920px] items-center">
        <div className="flex min-w-0 flex-1 items-center justify-start">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isSidebarOpen}
            onClick={onSidebarToggle}
          >
            <SidebarIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center">
          {center}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {right}
        </div>
      </div>
    </header>
  );
}
