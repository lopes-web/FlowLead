import { ProjectsKanban } from "@/components/ProjectsKanban";

export default function ProjectsPage() {
  return (
    <main className="flex-1 overflow-hidden">
      <div className="h-full">
        <ProjectsKanban
          onEditProject={(projectId) => {
            // TODO: Implementar modal de edição
            console.log("Editar projeto:", projectId);
          }}
        />
      </div>
    </main>
  );
} 