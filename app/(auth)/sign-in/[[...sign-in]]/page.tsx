import { SignIn } from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/clerk";

export default function SignInPage() {
  return (
    <SignIn
      appearance={clerkAppearance}
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
    />
  );
}
