import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-page font-sans">
      <div className="grid min-h-screen lg:grid-cols-2">
        <AuthBrandPanel className="max-lg:hidden" />
        <main className="flex min-h-screen items-center justify-center bg-page p-6 lg:p-8 xl:p-10">
          <div className="flex w-full max-w-md justify-center lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
