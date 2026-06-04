import { task, logger } from "@trigger.dev/sdk/v3";

interface Payload {
  projectId: string;
  userId: string;
  prompt: string;
}

export const generateArchitectureTask = task({
  id: "generate-architecture",
  maxDuration: 300,
  run: async (payload: Payload) => {
    const { projectId, userId, prompt } = payload;

    logger.info("Architecture generation started", { projectId, userId, prompt });

    // TODO: implement
    // 1. Load current canvas state from Vercel Blob (GET /canvas/{projectId}.json)
    // 2. Call Claude with the canvas state + user prompt to produce nodes and edges
    // 3. Write the result into the shared Liveblocks room
    // 4. Update the TaskRun record status to COMPLETED in the database

    return { projectId };
  },
});
