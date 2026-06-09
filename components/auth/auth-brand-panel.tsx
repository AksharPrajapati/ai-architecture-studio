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
        "auth-brand-panel relative flex min-h-screen w-full flex-col bg-subtle px-10 py-10 font-sans lg:px-14 lg:py-12 xl:px-20 xl:py-14 2xl:px-24",
        className
      )}
    >
      {/* Inner wrapper: constrain content width, push it toward the right (center divider) */}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col 2xl:max-w-2xl">
        <div className="flex items-center gap-2.5">
          <span
            className="size-7 shrink-0 rounded-md bg-brand xl:size-8"
            aria-hidden
          />
          <span className="text-base font-semibold tracking-tight text-white xl:text-lg">SpecForge</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10 xl:py-14">
          <h1 className="font-sans text-3xl font-semibold leading-tight tracking-tight text-white lg:text-4xl xl:text-5xl 2xl:text-6xl">
            Design systems at the speed of thought.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/75 lg:text-base xl:mt-6 xl:text-lg">
            Describe your architecture in plain English. SpecForge maps it to a
            shared canvas your whole team can refine in real time.
          </p>

          <ul className="mt-10 space-y-5 xl:mt-14 xl:space-y-7">
            {features.map(({ title, description, icon: Icon }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand-dim text-brand xl:size-12 xl:rounded-2xl">
                  <Icon className="size-4 xl:size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white xl:text-base">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/60 xl:text-base">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/40 xl:text-sm">
          © {new Date().getFullYear()} SpecForge. All rights reserved.
        </p>
      </div>
    </aside>
  );
}
