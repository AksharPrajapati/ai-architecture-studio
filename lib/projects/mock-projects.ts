import type { Project, SharedProject } from "@/types/project";

export const MOCK_OWNED_PROJECTS: Project[] = [
  { id: "owned-1", name: "E-commerce Platform", slug: "e-commerce-platform" },
  { id: "owned-2", name: "Real-time Chat", slug: "real-time-chat" },
];

export const MOCK_SHARED_PROJECTS: SharedProject[] = [
  {
    id: "shared-1",
    name: "Team Dashboard",
    slug: "team-dashboard",
    ownerName: "Alex Chen",
  },
  {
    id: "shared-2",
    name: "Payment Gateway",
    slug: "payment-gateway",
    ownerName: "Jordan Lee",
  },
];
