import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getClerkAuthPaths } from "@/lib/clerk";

export default async function Home() {
  const { isAuthenticated } = await auth();
  const { signIn } = getClerkAuthPaths();

  if (isAuthenticated) {
    redirect("/editor");
  }

  redirect(signIn);
}
