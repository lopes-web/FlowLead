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
  Calendar,
  User,
  Pencil,
  Trash2
} from "lucide-react";
import { useTask } from "@/contexts/TaskContext";

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
  const { deleteTask, setSelectedTaskId, setModalOpen } = useTask();

  const handleEdit = () => {
    setSelectedTaskId(task.id);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      await deleteTask(task.id);
    }
  };

  return (
    <div className="bg-[#222839] rounded-lg p-3 space-y-3 border border-[#2e3446] hover:border-[#3b82f6] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm text-white line-clamp-2">{task.titulo}</h3>
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

      {task.descricao && (
        <p className="text-xs text-gray-400 line-clamp-2">{task.descricao}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge className={`text-xs ${prioridadeConfig[task.prioridade].color}`}>
          {prioridadeConfig[task.prioridade].label}
        </Badge>

        {task.data_limite && (
          <Badge variant="outline" className="text-xs flex items-center gap-1 bg-[#2e3446]/50">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.data_limite), "dd/MM/yyyy", { locale: ptBR })}
          </Badge>
        )}

        {task.responsavel && (
          <Badge variant="outline" className="text-xs flex items-center gap-1 bg-[#2e3446]/50">
            <User className="h-3 w-3" />
            {task.responsavel}
          </Badge>
        )}
      </div>
    </div>
  );
} 