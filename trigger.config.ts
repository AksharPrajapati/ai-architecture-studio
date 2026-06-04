import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  // Replace with your Trigger.dev project ref from the dashboard (e.g. proj_xxxxxxxxxxxxxxxx)
  project: process.env.TRIGGER_PROJECT_REF ?? "",
  runtime: "node",
  maxDuration: 3600, // 1 hour
  dirs: ["trigger"],
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
});
