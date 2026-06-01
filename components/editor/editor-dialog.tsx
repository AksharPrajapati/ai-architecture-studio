"use client";

import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Styled dialog content using design tokens — use for future editor modals. */
function EditorDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        "gap-0 overflow-hidden rounded-3xl border border-surface-border bg-elevated p-0 text-copy-primary ring-foreground/10 sm:max-w-md",
        className
      )}
      {...props}
    />
  );
}

function EditorDialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  return (
    <DialogHeader
      className={cn("gap-1 border-b border-surface-border px-6 py-5", className)}
      {...props}
    />
  );
}

function EditorDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn("text-base font-medium text-copy-primary", className)}
      {...props}
    />
  );
}

function EditorDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      className={cn("text-sm text-copy-muted", className)}
      {...props}
    />
  );
}

function EditorDialogBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("space-y-5 px-6 py-5", className)} {...props} />;
}

const EditorDialogInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(function EditorDialogInput({ className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      className={cn(
        "h-9 border-surface-border bg-subtle text-copy-primary placeholder:text-copy-muted focus-visible:border-brand focus-visible:ring-brand/25 dark:bg-subtle",
        className
      )}
      {...props}
    />
  );
});

function EditorDialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn(
        "mx-0 mb-0 flex flex-col-reverse gap-3 rounded-none border-t border-surface-border bg-subtle/50 px-6 pt-4 pb-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog as EditorDialog,
  DialogClose as EditorDialogClose,
  DialogTrigger as EditorDialogTrigger,
  EditorDialogBody,
  EditorDialogContent,
  EditorDialogDescription,
  EditorDialogFooter,
  EditorDialogHeader,
  EditorDialogInput,
  EditorDialogTitle,
};
