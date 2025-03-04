import { useState } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project, ProjectStatus } from "@/types/project";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import {
  Files,
  Server,
  Paintbrush,
  Code2,
  Settings,
  Send,
  CheckCircle2,
  PenLine,
  Trash2,
  Calendar,
  DollarSign,
  GripHorizontal
} from "lucide-react";

interface KanbanProps {
  onEditProject: (projectId: string) => void;
}

const statusConfig: Record<ProjectStatus, { label: string; color: string; icon: React.ReactNode }> = {
  solicitar_arquivos: {
    label: "Solicitar Arquivos",
    color: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#F59E0B]/20",
    icon: <Files className="h-4 w-4" />
  },
  infraestrutura: {
    label: "Infraestrutura",
    color: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20",
    icon: <Server className="h-4 w-4" />
  },
  layout: {
    label: "Layout",
    color: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30 hover:bg-[#EC4899]/20",
    icon: <Paintbrush className="h-4 w-4" />
  },
  implementacao: {
    label: "Implementação",
    color: "bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/30 hover:bg-[#14B8A6]/20",
    icon: <Code2 className="h-4 w-4" />
  },
  otimizacao: {
    label: "Otimização",
    color: "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30 hover:bg-[#06B6D4]/20",
    icon: <Settings className="h-4 w-4" />
  },
  enviar_aprovacao: {
    label: "Enviar Aprovação",
    color: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20",
    icon: <Send className="h-4 w-4" />
  },
  alteracoes_finais: {
    label: "Alterações Finais",
    color: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30 hover:bg-[#EC4899]/20",
    icon: <PenLine className="h-4 w-4" />
  },
  concluido: {
    label: "Concluído",
    color: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/20",
    icon: <CheckCircle2 className="h-4 w-4" />
  }
};

export function ProjectsKanban({ onEditProject }: KanbanProps) {
  const { projects, updateProject, deleteProject } = useProjects();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [draggedStatus, setDraggedStatus] = useState<ProjectStatus | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, projectId: string, status: ProjectStatus) => {
    e.dataTransfer.setData("text/plain", projectId);
    setDraggedStatus(status);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-[#1c2132]');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-[#1c2132]');
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: ProjectStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-[#1c2132]');
    const projectId = e.dataTransfer.getData("text/plain");
    
    if (draggedStatus === newStatus) return;
    
    try {
      await updateProject(projectId, { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
    
    setDraggedStatus(null);
  };

  const handleDeleteClick = (project: { id: string; nome: string }) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div
            key={status}
            className="flex flex-col gap-2 bg-[#222839] p-6 rounded-xl border border-[#2e3446] transition-colors duration-200"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status as ProjectStatus)}
          >
            <div className={`flex items-center gap-2 p-2 rounded-lg ${config.color} transition-colors duration-200`}>
              <div className="p-1 shrink-0">
                {config.icon}
              </div>
              <h3 className="font-medium truncate">
                {config.label}
              </h3>
              <Badge className="ml-auto shrink-0 bg-[#1c2132] text-white border-[#2e3446]">
                {projects.filter((project: Project) => project.status === status).length}
              </Badge>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {projects
                .filter((project: Project) => project.status === status)
                .map((project: Project) => (
                  <Card
                    key={project.id}
                    className="group cursor-move animate-fadeIn bg-[#1c2132] border-[#2e3446] hover:border-[#9b87f5] hover:shadow-md transition-all duration-200"
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id, status as ProjectStatus)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <GripHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          <h4 className="font-medium text-sm text-white">{project.nome}</h4>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Badge className={`w-fit ${config.color}`}>
                            {project.tipo_projeto}
                          </Badge>

                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <DollarSign className="h-3 w-3 shrink-0" />
                            <span>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(project.valor)}
                            </span>
                          </div>

                          {project.prazo_entrega && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span>
                                Prazo: {new Date(project.prazo_entrega).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 pt-2 border-t border-[#2e3446] mt-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-[#2e3446] text-gray-400 hover:text-white"
                            onClick={() => onEditProject(project.id)}
                          >
                            <PenLine className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-[#2e3446] text-gray-400 hover:text-white"
                            onClick={() => handleDeleteClick({ id: project.id, nome: project.nome })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projectName={projectToDelete?.nome || ""}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}