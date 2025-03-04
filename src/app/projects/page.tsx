import { ProjectsKanban } from "@/components/ProjectsKanban";
import { useProjects } from "@/contexts/ProjectContext";

export default function ProjectsPage() {
  const { projects, updateProject, deleteProject } = useProjects();

  return (
    <main className="flex-1 overflow-hidden">
      <div className="h-full">
        <ProjectsKanban
          projects={projects}
          onEditProject={(project) => {
            // TODO: Implementar modal de edição
            console.log("Editar projeto:", project);
          }}
          onDeleteProject={deleteProject}
        />
      </div>
    </main>
  );
} 