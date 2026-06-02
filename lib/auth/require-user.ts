import { auth } from "@clerk/nextjs/server";

import { unauthorized } from "@/lib/api/responses";

export async function requireUserId(): Promise<
  { userId: string } | Response
> {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return unauthorized();
  }

  return { userId };
}
