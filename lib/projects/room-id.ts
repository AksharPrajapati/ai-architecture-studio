import { slugifyProjectName } from "@/lib/projects/slug";

const ROOM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function generateShortSuffix(length = 4): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}

export function buildProjectRoomId(name: string, suffix?: string): string {
  const slug = slugifyProjectName(name);
  const unique = suffix ?? generateShortSuffix();
  return `${slug}-${unique}`;
}

export function isValidProjectRoomId(id: string): boolean {
  return id.length >= 3 && id.length <= 128 && ROOM_ID_PATTERN.test(id);
}
