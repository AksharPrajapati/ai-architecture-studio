import { Lock } from "lucide-react";
import Link from "next/link";

export function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <Lock className="h-8 w-8 text-copy-muted" aria-hidden />
      <h1 className="mt-4 text-lg font-medium text-copy-primary">
        You don&apos;t have access to this project
      </h1>
      <p className="mt-2 max-w-sm text-sm text-copy-muted">
        This workspace may not exist, or you haven&apos;t been invited as a
        collaborator.
      </p>
      <Link
        href="/editor"
        className="mt-6 text-sm font-medium text-brand hover:underline"
      >
        Back to projects
      </Link>
    </div>
  );
}
