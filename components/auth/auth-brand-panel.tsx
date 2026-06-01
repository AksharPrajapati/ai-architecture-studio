import { FileText, Sparkles, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const features = [
  {
    title: "AI architecture generation",
    description:
      "Describe your system; AI maps it to nodes and edges on a live canvas.",
    icon: Sparkles,
  },
  {
    title: "Real-time collaboration",
    description:
      "Live cursors, presence indicators, and shared node editing across your team.",
    icon: Users,
  },
  {
    title: "Instant spec generation",
    description:
      "Export a complete Markdown technical spec directly from the canvas graph.",
    icon: FileText,
  },
] as const;

export function AuthBrandPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "auth-brand-panel relative flex min-h-screen w-full flex-col bg-subtle px-10 py-10 font-sans md:px-14 md:py-12",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="size-7 shrink-0 rounded-md bg-brand"
          aria-hidden
        />
        <span className="text-base text-white font-semibold tracking-tight">SpecForge</span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        <h1 className="max-w-md font-sans text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          Design systems at the speed of thought.
        </h1>
        <p className="auth-brand-panel__lede mt-4 max-w-md text-sm leading-relaxed md:text-base">
          Describe your architecture in plain English. SpecForge maps it to a
          shared canvas your whole team can refine in real time.
        </p>

        <ul className="mt-10 space-y-6">
          {features.map(({ title, description, icon: Icon }) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-surface-border bg-elevated text-brand">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{title}</p>
                <p className="auth-brand-panel__feature-desc mt-0.5 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="auth-brand-panel__footer text-xs">
        © {new Date().getFullYear()} SpecForge. All rights reserved.
      </p>
    </aside>
  );
}
