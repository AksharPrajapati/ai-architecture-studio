import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-page font-sans">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[3fr_2fr]">
        <AuthBrandPanel className="max-lg:hidden" />
        <main className="flex min-h-screen items-center justify-center bg-page p-6 lg:p-12 xl:p-16">
          <div className="flex w-full max-w-md justify-center xl:max-w-lg">{children}</div>
        </main>
      </div>
    </div>
  );
}
