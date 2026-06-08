import { dark } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimary: "#00c8d4",
    colorBackground: "#111114",
    colorInputBackground: "#18181c",
    colorInputText: "#f0f0f4",
    colorText: "#f0f0f4",
    colorTextSecondary: "#c0c0cc",
    colorTextOnPrimaryBackground: "#080809",
    colorDanger: "#ff4d4f",
    colorSuccess: "#34d399",
    colorWarning: "#fbbf24",
    colorNeutral: "#808090",
    colorShimmer: "#1e1e23",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons:
      "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
} as const;

export function getClerkAuthPaths() {
  const signIn = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
  const signUp = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

  return { signIn, signUp };
}
