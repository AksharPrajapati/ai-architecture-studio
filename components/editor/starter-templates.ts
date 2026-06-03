import { DEFAULT_NODE_COLOR, NODE_COLORS } from "@/types/canvas";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function node(
  id: string,
  label: string,
  x: number,
  y: number,
  shape: CanvasNode["data"]["shape"],
  colorIndex: number,
  width = 140,
  height = 70,
): CanvasNode {
  const color = NODE_COLORS[colorIndex] ?? DEFAULT_NODE_COLOR;
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, shape, color: color.fill, textColor: color.text },
    width,
    height,
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  label?: string,
): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: { label },
  };
}

// ─── Microservices ────────────────────────────────────────────────────────────

const microservicesNodes: CanvasNode[] = [
  node("ms-gw", "API Gateway", 280, 0, "rectangle", 1, 160, 70),
  node("ms-a", "Auth Service", 60, 140, "pill", 2, 140, 60),
  node("ms-b", "User Service", 260, 140, "pill", 0, 140, 60),
  node("ms-c", "Order Service", 460, 140, "pill", 3, 140, 60),
  node("ms-q", "Message Queue", 260, 280, "cylinder", 4, 140, 80),
  node("ms-db", "Primary DB", 60, 280, "cylinder", 1, 140, 80),
];

const microservicesEdges: CanvasEdge[] = [
  edge("me-1", "ms-gw", "ms-a"),
  edge("me-2", "ms-gw", "ms-b"),
  edge("me-3", "ms-gw", "ms-c"),
  edge("me-4", "ms-b", "ms-db"),
  edge("me-5", "ms-c", "ms-q", "async"),
  edge("me-6", "ms-b", "ms-q"),
];

// ─── CI/CD Pipeline ───────────────────────────────────────────────────────────

const cicdNodes: CanvasNode[] = [
  node("ci-code", "Source Code", 0, 60, "rectangle", 0, 140, 60),
  node("ci-build", "Build", 200, 60, "rectangle", 1, 120, 60),
  node("ci-test", "Test Suite", 380, 60, "rectangle", 6, 120, 60),
  node("ci-stg", "Deploy Staging", 200, 200, "pill", 3, 140, 60),
  node("ci-prod", "Deploy Prod", 380, 200, "pill", 4, 140, 60),
  node("ci-gate", "Approval Gate", 290, 130, "diamond", 2, 100, 100),
];

const cicdEdges: CanvasEdge[] = [
  edge("ce-1", "ci-code", "ci-build", "push"),
  edge("ce-2", "ci-build", "ci-test"),
  edge("ce-3", "ci-test", "ci-gate"),
  edge("ce-4", "ci-gate", "ci-stg", "auto"),
  edge("ce-5", "ci-stg", "ci-prod", "manual"),
];

// ─── Event-Driven System ──────────────────────────────────────────────────────

const eventDrivenNodes: CanvasNode[] = [
  node("ev-src", "Event Source", 20, 120, "hexagon", 1, 130, 90),
  node("ev-bus", "Event Bus", 220, 120, "cylinder", 2, 130, 90),
  node("ev-ca", "Consumer A", 420, 20, "pill", 6, 140, 60),
  node("ev-cb", "Consumer B", 420, 120, "pill", 3, 140, 60),
  node("ev-cc", "Consumer C", 420, 220, "pill", 4, 140, 60),
  node("ev-st", "Event Store", 220, 270, "cylinder", 0, 130, 80),
];

const eventDrivenEdges: CanvasEdge[] = [
  edge("ee-1", "ev-src", "ev-bus", "publish"),
  edge("ee-2", "ev-bus", "ev-ca", "subscribe"),
  edge("ee-3", "ev-bus", "ev-cb", "subscribe"),
  edge("ee-4", "ev-bus", "ev-cc", "subscribe"),
  edge("ee-5", "ev-bus", "ev-st", "persist"),
];

// ─── Export ───────────────────────────────────────────────────────────────────

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "API gateway routing to independent services with a message queue and database.",
    nodes: microservicesNodes,
    edges: microservicesEdges,
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "End-to-end deployment pipeline from source commit to production release.",
    nodes: cicdNodes,
    edges: cicdEdges,
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Event source publishing to a bus with multiple consumers and an event store.",
    nodes: eventDrivenNodes,
    edges: eventDrivenEdges,
  },
];
