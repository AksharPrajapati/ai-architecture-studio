import { EditorHome } from "@/components/editor/editor-home";
import { EditorLayout } from "@/components/editor/editor-layout";
import { getEditorProjectLists } from "@/lib/projects/data";

export default async function EditorPage() {
  const { ownedProjects, sharedProjects } = await getEditorProjectLists();

  return (
    <EditorLayout
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    >
      <EditorHome />
    </EditorLayout>
  );
}
