import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getClerkAuthPaths } from "@/lib/clerk";

const { signIn, signUp } = getClerkAuthPaths();

const isPublicRoute = createRouteMatcher([
  `${signIn}(.*)`,
  `${signUp}(.*)`,
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isPublicRoute(req)) {
      return;
    }

    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
      const signInUrl = new URL(signIn, req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  },
  {
    signInUrl: signIn,
    signUpUrl: signUp,
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
