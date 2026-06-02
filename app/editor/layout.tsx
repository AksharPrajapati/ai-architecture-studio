import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-provider";

export default function EditorRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProjectDialogsProvider>{children}</ProjectDialogsProvider>;
}
