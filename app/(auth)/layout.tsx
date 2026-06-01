import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-base font-sans md:grid md:grid-cols-2">
      <AuthBrandPanel className="max-md:hidden" />
      <main className="flex min-h-screen items-center justify-center bg-base p-6 md:p-10">
        <div className="flex w-full max-w-md justify-center">{children}</div>
      </main>
    </div>
  );
}
