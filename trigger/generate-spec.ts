import { task, logger } from "@trigger.dev/sdk/v3";

interface Payload {
  projectId: string;
  userId: string;
  specId: string;
}

export const generateSpecTask = task({
  id: "generate-spec",
  maxDuration: 300,
  run: async (payload: Payload) => {
    const { projectId, userId, specId } = payload;

    logger.info("Spec generation started", { projectId, userId, specId });

    // TODO: implement
    // 1. Load the current canvas graph from Vercel Blob (GET /canvas/{projectId}.json)
    // 2. Call Claude to convert the graph into a Markdown technical specification
    // 3. Save the Markdown output to Vercel Blob at specs/{projectId}/{specId}.md
    // 4. Update the Spec record with the blob URL and mark TaskRun as COMPLETED

    return { projectId, specId };
  },
});
