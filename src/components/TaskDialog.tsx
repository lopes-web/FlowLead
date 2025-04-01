import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTask } from "@/contexts/TaskContext";
import { useUser } from "@/contexts/UserContext";
import { TaskPriority, TaskStatus } from "@/types/task";
import { 
  CalendarIcon, 
  ClipboardList, 
  AlignLeft,
  Activity,
  Clock,
  User,
  ListTodo,
  Play,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  GripVertical,
  XIcon
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { TaskForm } from "./TaskForm";
import { TaskChecklist } from "./TaskChecklist";
import { Separator } from "./ui/separator";
import { ErrorBoundary } from "./ErrorBoundary";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
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

export function TaskDialog({ open, onOpenChange, taskId }: TaskDialogProps) {
  const { tasks, createTask, updateTask, addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useTask();
  const { users } = useUser();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<TaskStatus>("backlog");
  const [prioridade, setPrioridade] = useState<TaskPriority>("media");
  const [dataLimite, setDataLimite] = useState<Date | undefined>(undefined);
  const [responsavel, setResponsavel] = useState("");
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const task = tasks.find((t) => t.id === taskId);

  const handleErrorReset = () => {
    console.log("Resetando após erro no formulário");
    onOpenChange(false);
  };

  useEffect(() => {
    if (taskId && open) {
      const task = tasks.find((task) => task.id === taskId);
      if (task) {
        setTitulo(task.titulo);
        setDescricao(task.descricao || "");
        setStatus(task.status);
        setPrioridade(task.prioridade);
        setDataLimite(
          task.data_limite ? new Date(task.data_limite) : undefined
        );
        setResponsavel(task.responsavel || "");
      }
    } else {
      resetForm();
    }
    setFormSubmitted(false);
  }, [taskId, open, tasks]);

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setStatus("backlog");
    setPrioridade("media");
    setDataLimite(undefined);
    setResponsavel("");
  };

  const handleFormSuccess = () => {
    setFormSubmitted(true);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const data = {
        titulo,
        descricao,
        status,
        prioridade,
        data_limite: dataLimite ? dataLimite.toISOString() : null,
        responsavel: responsavel || null,
      };
      
      if (taskId) {
        await updateTask(taskId, data);
      } else {
        await createTask(data);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0 bg-[#1c2132] border-[#2e3446] text-white">
        <DialogHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-medium">
            {taskId ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-full text-gray-400 hover:text-white hover:bg-[#2e3446]"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-5">
          <DialogDescription className="text-gray-400 text-sm">
            {taskId ? "Preencha os detalhes abaixo para editar a tarefa." : "Preencha os detalhes abaixo para criar uma nova tarefa."}
          </DialogDescription>
          
          <ErrorBoundary
            onReset={handleErrorReset}
            fallback={
              <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-md text-red-300">
                <h3 className="text-lg font-medium text-red-300">Erro ao carregar formulário</h3>
                <p className="mt-2 text-sm">
                  Ocorreu um erro ao carregar o formulário de tarefa. Por favor, tente fechar e abrir o modal novamente.
                </p>
                <button
                  className="mt-3 px-3 py-1 text-sm font-medium text-white bg-red-700/50 rounded-md hover:bg-red-700"
                  onClick={() => onOpenChange(false)}
                >
                  Fechar
                </button>
              </div>
            }
          >
            <TaskForm taskId={taskId} onSuccess={handleFormSuccess} />
          </ErrorBoundary>
          
          {taskId && (
            <>
              <Separator className="bg-[#2e3446]" />
              
              <TaskChecklist
                items={task?.checklist_items || []}
                onAddItem={(content) => addChecklistItem(taskId, content)}
                onToggleItem={(itemId) => toggleChecklistItem(taskId, itemId)}
                onDeleteItem={(itemId) => deleteChecklistItem(taskId, itemId)}
              />
            </>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-[#2e3446] text-gray-300 hover:bg-[#2e3446] hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#a08af7] hover:bg-[#8a76e4] text-white"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Salvando..." : (taskId ? "Salvar Alterações" : "Criar Tarefa")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}