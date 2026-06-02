import { EditorLayout } from "@/components/editor/editor-layout";
import { getEditorProjectLists } from "@/lib/projects/data";

export default async function EditorRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { ownedProjects, sharedProjects } = await getEditorProjectLists();

  return (
    <EditorLayout
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    >
      {children}
    </EditorLayout>
  );
}
