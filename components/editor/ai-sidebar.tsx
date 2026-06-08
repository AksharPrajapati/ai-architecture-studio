"use client";

import { Bot, Download, FileText, Loader2, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import {
  useEventListener,
  useMyPresence,
  useMutation,
  useOthers,
  useStorage,
} from "@liveblocks/react";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AiStatusPayloadSchema, ChatMessageSchema } from "@/types/tasks";
import type { ChatMessage } from "@/types/tasks";

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

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AiArchitectTab({ projectId }: { projectId: string }) {
  const [input, setInput] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const senderName = user?.fullName ?? user?.firstName ?? "You";

  const others = useOthers();
  const [, updateMyPresence] = useMyPresence();

  // ai-chat feed: ordered collaborative chat messages
  const rawMessages = useStorage((root) => root.chatMessages);
  // ai-status-feed: latest AI generation status
  const aiStatusRaw = useStorage((root) => root.aiStatus);

  // Validate chat messages before rendering (spec 25)
  const messages: ChatMessage[] = (rawMessages ?? []).flatMap((item) => {
    const result = ChatMessageSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });

  // Validate AI status before displaying (spec 24)
  const validStatus = aiStatusRaw
    ? AiStatusPayloadSchema.safeParse(aiStatusRaw)
    : null;
  const statusMessage =
    validStatus?.success &&
    validStatus.data.phase !== "complete" &&
    validStatus.data.message
      ? validStatus.data.message
      : null;

  // Push a message to the ai-chat feed (spec 25)
  const addMessage = useMutation(({ storage }, msg: ChatMessage) => {
    storage.get("chatMessages")?.push(msg);
  }, []);

  // Update ai-status-feed from broadcast events (spec 24)
  const updateAiStatus = useMutation(
    ({ storage }, status: { message: string; phase: string }) => {
      storage.get("aiStatus")?.update(status);
    },
    [],
  );

  const { run } = useRealtimeRun(runId ?? "", {
    accessToken: publicToken ?? "",
    enabled: !!runId && !!publicToken,
  });

  // Track run completion and push AI reply to chat feed (spec 26)
  useEffect(() => {
    if (!run) return;

    if (run.status === "COMPLETED") {
      const summary = (run.metadata as Record<string, string> | undefined)
        ?.summary;
      addMessage({
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: summary ?? "Architecture design complete.",
        sender: "SpecForge",
        timestamp: new Date().toISOString(),
      });
      setRunId(null);
      setPublicToken(null);
      updateMyPresence({ thinking: false });
    }

    if (
      run.status === "FAILED" ||
      run.status === "CRASHED" ||
      run.status === "CANCELED"
    ) {
      addMessage({
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: "Something went wrong. Please try again.",
        sender: "SpecForge",
        timestamp: new Date().toISOString(),
      });
      setRunId(null);
      setPublicToken(null);
      updateMyPresence({ thinking: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.status]);

  // Listen for AI status broadcast events and write to ai-status-feed (spec 24)
  useEventListener(({ event }) => {
    if (event.type === "ai-status") {
      updateAiStatus({ message: event.message, phase: event.phase });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTriggering || !!runId) return;

    // Push user message to ai-chat feed (spec 25/26)
    addMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      sender: senderName,
      timestamp: new Date().toISOString(),
    });

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "72px";
    setIsTriggering(true);
    // Broadcast thinking state to all room participants (spec 24)
    updateMyPresence({ thinking: true });

    try {
      const triggerRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, roomId: projectId, projectId }),
      });

      if (!triggerRes.ok) throw new Error("Failed to start design task");
      const { runId: newRunId } = (await triggerRes.json()) as {
        runId: string;
      };

      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      });

      if (!tokenRes.ok) throw new Error("Failed to get run token");
      const { token } = (await tokenRes.json()) as { token: string };

      setRunId(newRunId);
      setPublicToken(token);
    } catch {
      addMessage({
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: "Failed to start the design agent. Please try again.",
        sender: "SpecForge",
        timestamp: new Date().toISOString(),
      });
      updateMyPresence({ thinking: false });
    } finally {
      setIsTriggering(false);
    }
  }, [
    input,
    isTriggering,
    runId,
    projectId,
    senderName,
    addMessage,
    updateMyPresence,
  ]);

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
  // Disable input for all users when anyone is generating (spec 24)
  const someoneElseThinking = others.some((o) => o.presence.thinking);
  const isInputDisabled = isRunning || someoneElseThinking;
  // Show status strip above input only when a run is active (spec 26)
  const showStatusStrip = (isRunning || someoneElseThinking) && !!statusMessage;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1 px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-elevated">
              <Bot className="h-6 w-6 text-ai-text" />
            </div>
            <div>
              <p className="text-sm font-medium text-copy-primary">
                SpecForge Architect
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
          <div className="flex flex-col gap-3 pb-2">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="flex max-w-[85%] flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-copy-muted">
                      <span>{msg.sender}</span>
                      <span>{formatTime(msg.timestamp)}</span>
                    </div>
                    <div
                      className="rounded-2xl px-3 py-2 text-xs font-medium text-white"
                      style={{ backgroundColor: "#62C073" }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex justify-start gap-2">
                  <Bot className="mt-5 h-3.5 w-3.5 shrink-0 text-ai-text" />
                  <div className="flex max-w-[85%] flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-copy-muted">
                      <span>{msg.sender}</span>
                      <span>{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className="rounded-2xl border border-surface-border bg-elevated px-3 py-2 text-xs text-copy-primary">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Status strip: compact bar above input showing ai-status-feed message (spec 24/26) */}
      {showStatusStrip && (
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl border border-[#62C073]/20 bg-elevated px-3 py-1.5 text-xs text-copy-muted">
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#62C073]" />
          <span className="truncate">{statusMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-surface-border p-3">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            someoneElseThinking ? "AI is working…" : "Describe an architecture…"
          }
          disabled={isInputDisabled}
          className="max-h-[160px] min-h-[72px] resize-none border-surface-border bg-elevated text-xs text-copy-primary placeholder:text-copy-muted disabled:opacity-50"
        />
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            className={cn(
              "text-white transition-colors",
              !input.trim() || isInputDisabled
                ? "cursor-not-allowed bg-[#62C073]/40 hover:bg-[#62C073]/40"
                : "bg-[#62C073] hover:bg-[#62C073]/90",
            )}
            onClick={() => void handleSend()}
            disabled={!input.trim() || isInputDisabled}
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

interface ProjectSpec {
  id: string;
  filePath: string;
  createdAt: string;
}

function formatSpecDate(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function specFilename(spec: ProjectSpec): string {
  return `spec-${spec.id.slice(-8)}.md`;
}

function SpecPreviewModal({
  spec,
  projectId,
  onClose,
}: {
  spec: ProjectSpec;
  projectId: string;
  onClose: () => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(
          `/api/projects/${projectId}/specs/${spec.id}/download`,
        );
        if (res.ok) {
          setContent(await res.text());
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [spec.id, projectId]);

  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = `/api/projects/${projectId}/specs/${spec.id}/download`;
    a.download = specFilename(spec);
    a.click();
  }, [spec, projectId]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col border-surface-border bg-surface">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center justify-between text-sm font-semibold text-copy-primary">
            <span>{specFilename(spec)}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 border-surface-border text-xs text-copy-muted hover:text-copy-primary"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3" />
              Download
            </Button>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1 rounded-xl border border-surface-border bg-elevated p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-copy-muted" />
            </div>
          ) : content ? (
            <div className="prose prose-invert prose-sm max-w-none text-copy-primary [&_code]:rounded [&_code]:bg-subtle [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_li]:text-xs [&_p]:text-xs">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-xs text-copy-muted">
              Failed to load spec content.
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function SpecsTab({ projectId }: { projectId: string }) {
  const [specs, setSpecs] = useState<ProjectSpec[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genRunId, setGenRunId] = useState<string | null>(null);
  const [genToken, setGenToken] = useState<string | null>(null);
  const [previewSpec, setPreviewSpec] = useState<ProjectSpec | null>(null);

  const rawMessages = useStorage((root) => root.chatMessages);

  const { run: genRun } = useRealtimeRun(genRunId ?? "", {
    accessToken: genToken ?? "",
    enabled: !!genRunId && !!genToken,
  });

  const fetchSpecs = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/specs`);
    if (res.ok) {
      const data = (await res.json()) as { specs: ProjectSpec[] };
      setSpecs(data.specs);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchSpecs();
  }, [fetchSpecs]);

  // Refresh spec list when generation completes
  useEffect(() => {
    if (!genRun) return;
    if (genRun.status === "COMPLETED") {
      setGenRunId(null);
      setGenToken(null);
      void fetchSpecs();
    }
    if (
      genRun.status === "FAILED" ||
      genRun.status === "CRASHED" ||
      genRun.status === "CANCELED"
    ) {
      setGenRunId(null);
      setGenToken(null);
    }
  }, [genRun?.status, fetchSpecs]);

  const handleGenerate = useCallback(async () => {
    if (isGenerating || !!genRunId) return;
    setIsGenerating(true);

    try {
      const chatHistory = (rawMessages ?? []).flatMap((item) => {
        const r = ChatMessageSchema.safeParse(item);
        return r.success ? [r.data] : [];
      });

      const triggerRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: projectId,
          chatHistory,
          nodes: [],
          edges: [],
        }),
      });
      if (!triggerRes.ok) throw new Error("Failed to start spec task");
      const { runId } = (await triggerRes.json()) as { runId: string };

      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      if (!tokenRes.ok) throw new Error("Failed to get run token");
      const { token } = (await tokenRes.json()) as { token: string };

      setGenRunId(runId);
      setGenToken(token);
    } catch {
      // silent failure — user can retry
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, genRunId, projectId, rawMessages]);

  const handleDownload = useCallback(
    (spec: ProjectSpec, e: React.MouseEvent) => {
      e.stopPropagation();
      const a = document.createElement("a");
      a.href = `/api/projects/${projectId}/specs/${spec.id}/download`;
      a.download = specFilename(spec);
      a.click();
    },
    [projectId],
  );

  const isWorking = isGenerating || !!genRunId;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <Button
        type="button"
        className={cn(
          "w-full text-white transition-colors",
          isWorking
            ? "cursor-not-allowed bg-[#62C073]/40"
            : "bg-[#62C073] hover:bg-[#62C073]/90",
        )}
        disabled={isWorking}
        onClick={() => void handleGenerate()}
      >
        {isWorking ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Generating…
          </>
        ) : (
          "Generate Spec"
        )}
      </Button>

      <ScrollArea className="min-h-0 flex-1">
        {specs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 pt-6 text-center">
            <FileText className="h-8 w-8 text-copy-faint" />
            <p className="text-xs text-copy-muted">
              No specs yet. Generate one above.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {specs.map((spec) => (
              <button
                key={spec.id}
                type="button"
                className="flex w-full items-start gap-3 rounded-2xl border border-surface-border bg-elevated p-3 text-left transition-colors hover:bg-subtle"
                onClick={() => setPreviewSpec(spec)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-subtle">
                  <FileText className="h-4 w-4 text-ai-text" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-copy-primary">
                    {specFilename(spec)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-copy-muted">
                    {formatSpecDate(spec.createdAt)}
                  </p>
                  <button
                    type="button"
                    className="mt-1.5 flex items-center gap-1 text-xs text-copy-muted hover:text-copy-primary"
                    onClick={(e) => handleDownload(spec, e)}
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {previewSpec && (
        <SpecPreviewModal
          spec={previewSpec}
          projectId={projectId}
          onClose={() => setPreviewSpec(null)}
        />
      )}
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
            <p className="text-xs text-copy-muted">
              Collaborate with SpecForge
            </p>
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
      <Tabs defaultValue="architect" className="flex min-h-0 flex-1 flex-col">
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
          <SpecsTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
