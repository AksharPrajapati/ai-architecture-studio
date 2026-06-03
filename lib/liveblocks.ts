import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#E57373",
  "#FFB74D",
  "#FFF176",
  "#81C784",
  "#4FC3F7",
  "#7986CB",
  "#CE93D8",
  "#F48FB1",
  "#80CBC4",
  "#FFCC80",
];

export function userIdToColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) & 0xffff;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

declare global {
  // eslint-disable-next-line no-var
  var _liveblocksClient: Liveblocks | undefined;
}

export function getLiveblocks(): Liveblocks {
  if (global._liveblocksClient) {
    return global._liveblocksClient;
  }

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not defined");
  }

  const client = new Liveblocks({ secret });

  if (process.env.NODE_ENV !== "production") {
    global._liveblocksClient = client;
  }

  return client;
}
