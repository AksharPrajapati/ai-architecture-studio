"use client";

import { Bot, Download, FileText, Loader2, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useEventListener } from "@liveblocks/react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  isStatus?: boolean;
}

interface AiArchitectTabProps {
  projectId: string;
}

function AiArchitectTab({ projectId }: AiArchitectTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { run } = useRealtimeRun(runId ?? "", {
    accessToken: publicToken ?? "",
    enabled: !!runId && !!publicToken,
  });

  // Track run completion / failure
  useEffect(() => {
    if (!run) return;

    if (run.status === "COMPLETED") {
      const summary = (run.metadata as Record<string, string> | undefined)?.summary;
      if (summary) {
        setMessages((prev) => [
          ...prev.filter((m) => !m.isStatus),
          { role: "assistant", content: summary },
        ]);
      }
      setRunId(null);
      setPublicToken(null);
    }

    if (run.status === "FAILED" || run.status === "CRASHED" || run.status === "CANCELED") {
      setMessages((prev) => [
        ...prev.filter((m) => !m.isStatus),
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
      setRunId(null);
      setPublicToken(null);
    }
  }, [run?.status]);

  // Listen for AI status broadcasts
  useEventListener(({ event }) => {
    if (event.type === "ai-status") {
      if (event.phase === "start" || event.phase === "processing") {
        setMessages((prev) => {
          const withoutPrev = prev.filter((m) => !m.isStatus);
          return [...withoutPrev, { role: "assistant", content: event.message, isStatus: true }];
        });
      }
    }
  });

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTriggering || !!runId) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "72px";
    setIsTriggering(true);

    try {
      const triggerRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, roomId: projectId, projectId }),
      });

      if (!triggerRes.ok) {
        throw new Error("Failed to start design task");
      }

      const { runId: newRunId } = (await triggerRes.json()) as { runId: string };

      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to get run token");
      }

      const { token } = (await tokenRes.json()) as { token: string };

      setRunId(newRunId);
      setPublicToken(token);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to start the design agent. Please try again." },
      ]);
    } finally {
      setIsTriggering(false);
    }
  }, [input, isTriggering, runId, projectId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  const handleChipClick = useCallback((chip: string) => {
    setInput(chip);
    textareaRef.current?.focus();
  }, []);

  const isRunning = !!runId || isTriggering;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1 px-4 py-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-elevated">
              <Bot className="h-6 w-6 text-ai-text" />
            </div>
            <div>
              <p className="text-sm font-medium text-copy-primary">
                Ghost AI Architect
              </p>
              <p className="mt-1 text-xs text-copy-muted">
                Describe a system and I&apos;ll design it for you.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              {STARTER_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="rounded-xl bg-subtle px-3 py-2 text-left text-xs text-ai-text transition-colors hover:bg-elevated"
                  onClick={() => handleChipClick(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl border-2 border-brand/50 bg-brand-dim px-3 py-2 text-xs text-copy-primary">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start gap-2">
                  {msg.isStatus ? (
                    <Loader2 className="mt-1 h-3.5 w-3.5 shrink-0 animate-spin text-ai-text" />
                  ) : (
                    <Bot className="mt-1 h-3.5 w-3.5 shrink-0 text-ai-text" />
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl border px-3 py-2 text-xs text-copy-primary",
                      msg.isStatus
                        ? "border-ai/30 bg-ai/10 text-copy-muted"
                        : "border-surface-border bg-elevated",
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </ScrollArea>
      <div className="flex flex-col gap-2 border-t border-surface-border p-3">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Describe an architecture…"
          disabled={isRunning}
          className="max-h-[160px] min-h-[72px] resize-none border-surface-border bg-elevated text-xs text-copy-primary placeholder:text-copy-muted disabled:opacity-50"
        />
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            className="bg-ai text-white hover:bg-ai/80"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isRunning}
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {isRunning ? "Working…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SpecsTab() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <Button type="button" className="w-full bg-ai text-white hover:bg-ai/80">
        Generate Spec
      </Button>
      <div className="flex items-start gap-3 rounded-2xl border border-surface-border bg-elevated p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-subtle">
          <FileText className="h-4 w-4 text-ai-text" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-copy-primary">
            Microservices Architecture
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-copy-muted">
            API Gateway, Auth Service, Product Service, Order Service, Event
            Bus…
          </p>
          <button
            type="button"
            disabled
            className="mt-2 flex cursor-not-allowed items-center gap-1 text-xs text-copy-faint"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export function AiSidebar({ isOpen, onClose, projectId }: AiSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "absolute top-0 right-0 z-40 flex h-full w-80 flex-col border-l border-surface-border bg-surface/95 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "pointer-events-none translate-x-full",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-surface-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-elevated">
            <Bot className="h-4 w-4 text-ai-text" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-copy-primary">
              AI Workspace
            </h2>
            <p className="text-xs text-copy-muted">Collaborate with Ghost AI</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close AI sidebar"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="architect"
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="mx-4 mt-3 shrink-0 border border-surface-border bg-elevated">
          <TabsTrigger
            value="architect"
            className="flex-1 text-copy-muted data-active:bg-subtle data-active:text-brand"
          >
            AI Architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="flex-1 text-copy-muted data-active:bg-subtle data-active:text-brand"
          >
            Specs
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="architect"
          className="mt-0 flex min-h-0 flex-1 flex-col"
        >
          <AiArchitectTab projectId={projectId} />
        </TabsContent>
        <TabsContent
          value="specs"
          className="mt-0 flex min-h-0 flex-1 flex-col"
        >
          <SpecsTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
