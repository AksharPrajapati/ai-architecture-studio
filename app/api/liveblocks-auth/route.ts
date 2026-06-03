import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

import { getLiveblocks, userIdToColor } from "@/lib/liveblocks";
import { getAccessibleProject } from "@/lib/project-access";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const room = typeof body?.room === "string" ? body.room : null;

  if (!room) {
    return NextResponse.json({ error: "Missing room" }, { status: 400 });
  }

  const result = await getAccessibleProject(room);

  if (result.kind === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (result.kind === "not_found" || result.kind === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clerkUser = await currentUser();
  const name =
    clerkUser?.fullName ?? clerkUser?.username ?? result.identity.userId;
  const avatar = clerkUser?.imageUrl ?? "";
  const color = userIdToColor(result.identity.userId);

  const lb = getLiveblocks();
  await lb.getOrCreateRoom(room, { defaultAccesses: [] });

  const session = lb.prepareSession(result.identity.userId, {
    userInfo: { name, avatar, color },
  });

  session.allow(room, session.FULL_ACCESS);

  const { body: token, status } = await session.authorize();
  return new NextResponse(token, { status });
}
