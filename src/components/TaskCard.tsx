import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ListTodo,
  Play,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  User,
  Pencil,
  Trash2,
  Clock,
  CalendarDays,
  AlignLeft
} from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { useUser } from "@/contexts/UserContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskCardProps {
  task: Task;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  backlog: {
    label: "Backlog",
    color: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    icon: <ListTodo className="h-4 w-4" />
  },
  em_andamento: {
    label: "Em Andamento",
    color: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30",
    icon: <Play className="h-4 w-4" />
  },
  revisao: {
    label: "Revisão",
    color: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30",
    icon: <FileSearch className="h-4 w-4" />
  },
  bloqueado: {
    label: "Bloqueado",
    color: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
    icon: <AlertTriangle className="h-4 w-4" />
  },
  concluido: {
    label: "Concluído",
    color: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30",
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

export function TaskCard({ task }: TaskCardProps) {
  const { deleteTask, setSelectedTaskId } = useTask();
  const { users } = useUser();

  console.log("RENDER TASK CARD:", {
    id: task.id,
    titulo: task.titulo,
    descricao: task.descricao,
    responsavel: task.responsavel,
    tipo_responsavel: typeof task.responsavel
  });

  const handleEdit = () => {
    setSelectedTaskId(task.id);
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      await deleteTask(task.id);
    }
  };

  // Calcula o tempo restante até a data limite
  const getTimeRemaining = () => {
    if (!task.data_limite) return null;
    
    const now = new Date();
    const deadline = new Date(task.data_limite);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Atrasado";
    if (diffDays === 0) return "Vence hoje";
    if (diffDays === 1) return "Vence amanhã";
    return `${diffDays} dias restantes`;
  };

  const timeRemaining = getTimeRemaining();

  // Encontrar o nome do responsável com base no ID
  const getResponsibleUserName = () => {
    if (!task.responsavel) return "Sem responsável";
    
    const responsibleUser = users.find(u => u.id === task.responsavel);
    if (responsibleUser) {
      return responsibleUser.raw_user_meta_data?.name || responsibleUser.email;
    }
    
    return `ID: ${task.responsavel}`;
  };

  return (
    <div className="bg-[#222839] rounded-lg p-3 space-y-3 border border-[#2e3446] hover:border-[#3b82f6] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="font-medium text-sm text-white line-clamp-2 cursor-default">
                {task.titulo}
              </h3>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#2e3446] text-white border-[#1c2132]">
              {task.titulo}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-white hover:bg-[#2e3446]"
            onClick={handleEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-[#2e3446]"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* RESPONSÁVEL - AGORA MOSTRA O NOME BASEADO NO ID */}
      <div className="flex items-center gap-2 text-xs">
        <User className="h-3 w-3 text-[#9b87f5]" />
        <span className="font-semibold text-[#9b87f5]">
          {getResponsibleUserName()}
        </span>
      </div>

      {/* DESCRIÇÃO */}
      {task.descricao && (
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <AlignLeft className="h-3 w-3 shrink-0 mt-0.5" />
          <p className="line-clamp-2 text-gray-300">
            {task.descricao}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge className={`text-xs ${statusConfig[task.status].color}`}>
          <div className="flex items-center gap-1">
            {statusConfig[task.status].icon}
            <span>{statusConfig[task.status].label}</span>
          </div>
        </Badge>

        <Badge className={`text-xs ${prioridadeConfig[task.prioridade].color}`}>
          {prioridadeConfig[task.prioridade].label}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-[#2e3446]">
        {task.data_limite && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`text-xs flex items-center gap-1 bg-[#2e3446]/50 ${
                    timeRemaining === "Atrasado" ? "text-red-400" : ""
                  }`}
                >
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(task.data_limite), "dd/MM/yyyy", { locale: ptBR })}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#2e3446] text-white border-[#1c2132]">
                {timeRemaining}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <Badge variant="outline" className="text-xs flex items-center gap-1 bg-[#2e3446]/50">
          <Clock className="h-3 w-3" />
          {format(new Date(task.created_at), "dd/MM/yyyy", { locale: ptBR })}
        </Badge>
      </div>
    </div>
  );
} 