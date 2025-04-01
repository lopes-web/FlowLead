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
  GripVertical
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
  const { tasks, addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useTask();
  const task = tasks.find((t) => t.id === taskId);

  const handleErrorReset = () => {
    console.log("Resetando após erro no formulário");
    // Se um erro ocorrer, fechar o modal é uma boa estratégia de recuperação
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0 bg-[#1c2132] border-[#2e3446] text-white">
        <div className="p-6 space-y-6">
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
            <TaskForm taskId={taskId} onSuccess={() => onOpenChange(false)} />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}