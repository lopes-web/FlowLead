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
  const { tasks, createTask, updateTask } = useTask();
  const { users, loading: loadingUsers } = useUser();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<TaskStatus>("backlog");
  const [prioridade, setPrioridade] = useState<TaskPriority>("media");
  const [dataLimite, setDataLimite] = useState<Date | undefined>(undefined);
  const [responsavel, setResponsavel] = useState("");
  const [projetoId, setProjetoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskId && open) {
      const task = tasks.find((task) => task.id === taskId);
      if (task) {
        console.log("Carregando tarefa para edição:", task);
        setTitulo(task.titulo);
        setDescricao(task.descricao || "");
        setStatus(task.status);
        setPrioridade(task.prioridade);
        setDataLimite(
          task.data_limite ? new Date(task.data_limite) : undefined
        );
        setResponsavel(task.responsavel || "");
        setProjetoId(task.projeto_id);
      }
    } else {
      resetForm();
    }
  }, [taskId, open, tasks]);

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setStatus("backlog");
    setPrioridade("media");
    setDataLimite(undefined);
    setResponsavel("");
    setProjetoId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        titulo,
        descricao,
        status,
        prioridade,
        data_limite: dataLimite ? dataLimite.toISOString() : null,
        responsavel: responsavel === "none" ? null : String(responsavel),
        projeto_id: projetoId,
      };

      console.log('Saving task with data:', taskData); // Debug log
      console.log('Responsável exato sendo salvo:', responsavel);
      console.log('Tipo do responsável:', typeof responsavel);
      console.log('Pessoas que deveriam ver esta tarefa:', responsavel === "none" ? "ninguém" : responsavel);

      if (taskId) {
        await updateTask(taskId, taskData);
      } else {
        await createTask(taskData);
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-[#1c2132] border-[#2e3446] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {taskId ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Preencha os detalhes abaixo para {taskId ? "editar a" : "criar uma nova"} tarefa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-gray-400" />
              <Label htmlFor="titulo" className="font-medium">Título*</Label>
            </div>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="bg-[#222839] border-[#2e3446] focus:border-[#3b82f6]"
              placeholder="Digite o título da tarefa"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-gray-400" />
              <Label htmlFor="descricao" className="font-medium">Descrição</Label>
            </div>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-[#222839] border-[#2e3446] focus:border-[#3b82f6] min-h-[100px]"
              placeholder="Descreva os detalhes da tarefa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <Label htmlFor="status" className="font-medium">Status*</Label>
              </div>
              <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                <SelectTrigger className="bg-[#222839] border-[#2e3446] focus:border-[#3b82f6]">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-[#222839] border-[#2e3446]">
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="text-white focus:bg-[#2e3446] focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded", config.color)}>
                          {config.icon}
                        </div>
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <Label htmlFor="prioridade" className="font-medium">Prioridade*</Label>
              </div>
              <Select value={prioridade} onValueChange={(value: TaskPriority) => setPrioridade(value)}>
                <SelectTrigger className="bg-[#222839] border-[#2e3446] focus:border-[#3b82f6]">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent className="bg-[#222839] border-[#2e3446]">
                  {Object.entries(prioridadeConfig).map(([value, config]) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="text-white focus:bg-[#2e3446] focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className={cn("rounded", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <Label htmlFor="data_limite" className="font-medium">Data Limite</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#222839] border-[#2e3446] focus:border-[#3b82f6] hover:bg-[#2e3446]",
                      !dataLimite && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataLimite ? (
                      format(dataLimite, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#222839] border-[#2e3446]">
                  <Calendar
                    mode="single"
                    selected={dataLimite}
                    onSelect={setDataLimite}
                    initialFocus
                    locale={ptBR}
                    className="bg-[#222839]"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <Label htmlFor="responsavel" className="font-medium">Responsável</Label>
              </div>
              <Select 
                value={responsavel || undefined} 
                onValueChange={(value) => {
                  console.log("Responsável selecionado:", value);
                  setResponsavel(value);
                }}
              >
                <SelectTrigger className="bg-[#222839] border-[#2e3446] focus:border-[#3b82f6]">
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent className="bg-[#222839] border-[#2e3446]">
                  <SelectItem 
                    value="none"
                    className="text-white focus:bg-[#2e3446] focus:text-white"
                  >
                    Sem responsável
                  </SelectItem>
                  {users.map((user) => {
                    const displayName = user.raw_user_meta_data?.name || user.email;
                    console.log("User option:", { 
                      id: user.id, 
                      type: typeof user.id,
                      display: displayName, 
                      meta: user.raw_user_meta_data 
                    });
                    return (
                      <SelectItem
                        key={user.id}
                        value={String(user.id)}
                        className="text-white focus:bg-[#2e3446] focus:text-white"
                      >
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-[#2e3446] hover:bg-[#2e3446] text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#9b87f5] hover:bg-[#8B5CF6] text-white"
            >
              {loading ? "Salvando..." : taskId ? "Salvar Alterações" : "Criar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}