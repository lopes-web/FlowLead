import { useState, useEffect } from "react";
import { useTask } from "@/contexts/TaskContext";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskStatus, TaskPriority } from "@/types/task";
import { TaskDialog } from "./TaskDialog";
import { DeleteDialog } from "./DeleteTaskDialog";
import {
  ListTodo,
  Play,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Calendar,
  GripHorizontal,
  User,
  AlignLeft,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  backlog: {
    label: "Backlog",
    color: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#F59E0B]/20",
    icon: <ListTodo className="h-4 w-4" />
  },
  em_andamento: {
    label: "Em Andamento",
    color: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20",
    icon: <Play className="h-4 w-4" />
  },
  revisao: {
    label: "Revisão",
    color: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30 hover:bg-[#EC4899]/20",
    icon: <FileSearch className="h-4 w-4" />
  },
  bloqueado: {
    label: "Bloqueado",
    color: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/20",
    icon: <AlertTriangle className="h-4 w-4" />
  },
  concluido: {
    label: "Concluído",
    color: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/20",
    icon: <CheckCircle2 className="h-4 w-4" />
  }
};

const prioridadeConfig: Record<TaskPriority, { label: string; color: string }> = {
  baixa: {
    label: "Baixa",
    color: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
  },
  media: {
    label: "Média",
    color: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
  },
  alta: {
    label: "Alta",
    color: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
  },
  urgente: {
    label: "Urgente",
    color: "bg-[#7F1D1D]/10 text-[#EF4444] border-[#7F1D1D]/30 font-bold"
  }
};

export function TasksKanban() {
  const { tasks, updateTask, deleteTask } = useTask();
  const { users } = useUser();
  const { user } = useAuth();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<string | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; titulo: string } | null>(null);
  const [draggedStatus, setDraggedStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    console.log("=== KANBAN DEBUG ===");
    console.log("Usuário atual:", {
      id: user?.id,
      email: user?.email,
      name: user?.user_metadata?.name
    });
    
    console.log("Total de tarefas:", tasks.length);
    console.log("Tarefas disponíveis:", tasks.map(t => ({
      id: t.id,
      titulo: t.titulo,
      responsavel: t.responsavel,
      status: t.status,
      isResponsavel: isCurrentUserResponsible(t.responsavel)
    })));
    
    const minhasTarefas = tasks.filter(t => isCurrentUserResponsible(t.responsavel));
    console.log("Minhas tarefas:", minhasTarefas.map(t => ({
      id: t.id,
      titulo: t.titulo,
      responsavel: t.responsavel
    })));
    
    console.log("Usuários disponíveis:", users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.raw_user_meta_data?.name
    })));
  }, [tasks, users, user]);

  const getResponsavelName = (responsavelId: string | null | undefined) => {
    if (!responsavelId) return "Sem responsável";
    
    const responsavelIdStr = String(responsavelId).trim();
    const responsavel = users.find(u => String(u.id).trim() === responsavelIdStr);
    
    if (responsavel) {
      return responsavel.raw_user_meta_data?.name || responsavel.email;
    }
    
    // Se não encontrar o usuário, tentar buscar por correspondência parcial
    const possibleUser = users.find(u => 
      responsavelIdStr.includes(String(u.id)) || 
      String(u.id).includes(responsavelIdStr)
    );
    
    if (possibleUser) {
      console.log(`Encontrou responsável por correspondência parcial: ${possibleUser.email}`);
      return possibleUser.raw_user_meta_data?.name || possibleUser.email;
    }
    
    return `Usuário não encontrado (${responsavelId})`;
  };

  const isCurrentUserResponsible = (taskResponsavel: string | null | undefined) => {
    if (!user || !taskResponsavel) return false;
    
    const taskResponsavelStr = String(taskResponsavel).trim();
    const currentUserIdStr = String(user.id).trim();
    
    // Verificar correspondência exata
    if (taskResponsavelStr === currentUserIdStr) {
      console.log(`Correspondência exata encontrada para tarefa ${taskResponsavelStr}`);
      return true;
    }
    
    // Verificar correspondência parcial
    const isPartialMatch = taskResponsavelStr.includes(currentUserIdStr) || 
                          currentUserIdStr.includes(taskResponsavelStr);
    
    if (isPartialMatch && taskResponsavelStr.length > 10) {
      console.log(`Correspondência parcial encontrada para tarefa ${taskResponsavelStr}`);
      console.log(`Task ID: ${taskResponsavelStr}`);
      console.log(`User ID: ${currentUserIdStr}`);
      return true;
    }
    
    return false;
  };

  const handleDragStart = (e: React.DragEvent, taskId: string, status: TaskStatus) => {
    e.dataTransfer.setData("text/plain", taskId);
    setDraggedStatus(status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-[#1c2132]');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-[#1c2132]');
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-[#1c2132]');
    const taskId = e.dataTransfer.getData("text/plain");
    
    if (draggedStatus === newStatus) return;
    
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const { id, created_at, updated_at, ...taskData } = task;
        await updateTask(taskId, {
          ...taskData,
          status: newStatus,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
    
    setDraggedStatus(null);
  };

  const handleEditClick = (taskId: string) => {
    setTaskToEdit(taskId);
    setTaskDialogOpen(true);
  };

  const handleDeleteClick = (task: { id: string; titulo: string }) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete.id);
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fadeIn">
        {Object.entries(statusConfig).map(([status, config]) => {
          const tasksInThisStatus = tasks.filter((task) => task.status === status);
          console.log(`Status: ${status}, Tarefas: ${tasksInThisStatus.length}`, 
            tasksInThisStatus.map(t => ({id: t.id, titulo: t.titulo, responsavel: t.responsavel})));
          
          return (
            <div
              key={status}
              className="flex flex-col gap-2 bg-[#222839] p-6 rounded-xl border border-[#2e3446] transition-colors duration-200"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status as TaskStatus)}
            >
              <div className={`flex items-center gap-2 p-2 rounded-lg ${config.color} transition-colors duration-200`}>
                <div className="p-1 shrink-0">
                  {config.icon}
                </div>
                <h3 className="font-medium truncate">
                  {config.label}
                </h3>
                <Badge variant="secondary" className="ml-auto shrink-0 bg-[#1c2132] text-white border-[#2e3446]">
                  {tasksInThisStatus.length}
                </Badge>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {tasksInThisStatus.map((task) => {
                  const isMyTask = isCurrentUserResponsible(task.responsavel);
                  
                  return (
                    <Card
                      key={task.id}
                      className={`group cursor-move animate-fadeIn bg-[#1c2132] border-[#2e3446] 
                        hover:border-[#3b82f6] hover:shadow-md transition-all duration-200`}
                      draggable
                      onDragStart={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('button')) {
                          e.preventDefault();
                          e.stopPropagation();
                          return false;
                        }
                        handleDragStart(e, task.id, status as TaskStatus);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <GripHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <h4 className="font-medium text-sm text-white truncate max-w-[150px] sm:max-w-[180px] md:max-w-[120px] lg:max-w-[180px]">
                                    {isMyTask && <span className="text-[#9b87f5] mr-1">●</span>}
                                    {task.titulo}
                                  </h4>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-[#2e3446] text-white border-[#1c2132]">
                                  {task.titulo}
                                  {isMyTask && <div className="text-[#9b87f5] text-xs mt-1">Você é responsável por esta tarefa</div>}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <Badge className={`w-fit ${prioridadeConfig[task.prioridade].color}`}>
                            {prioridadeConfig[task.prioridade].label}
                          </Badge>

                          {task.responsavel && (
                            <div className="flex items-center gap-2 text-xs">
                              <User className={`h-3 w-3 ${isMyTask ? 'text-[#9b87f5]' : 'text-gray-400'}`} />
                              <span className={`${isMyTask ? 'text-[#9b87f5] font-bold' : 'text-gray-400'} truncate`}>
                                {getResponsavelName(task.responsavel)}
                                {isMyTask && " (você)"}
                              </span>
                            </div>
                          )}

                          {task.descricao && (
                            <div className="flex items-start gap-2 text-xs text-gray-400">
                              <AlignLeft className="h-3 w-3 shrink-0 mt-0.5" />
                              <p className="text-gray-300 line-clamp-2">
                                {task.descricao}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {task.data_limite ? new Date(task.data_limite).toLocaleDateString("pt-BR") : "Sem data"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 pt-2 border-t border-[#2e3446] mt-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-[#2e3446] text-gray-400 hover:text-white"
                              onClick={() => handleEditClick(task.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-[#2e3446] text-gray-400 hover:text-white"
                              onClick={() => handleDeleteClick({ id: task.id, titulo: task.titulo })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        taskId={taskToEdit}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Tarefa"
        description={`Tem certeza que deseja excluir a tarefa "${taskToDelete?.titulo}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
} 