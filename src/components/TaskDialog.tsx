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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<TaskStatus>("backlog");
  const [prioridade, setPrioridade] = useState<TaskPriority>("media");
  const [dataLimite, setDataLimite] = useState<Date | undefined>(undefined);
  const [responsavel, setResponsavel] = useState("");
  const [projetoId, setProjetoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

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
    setActiveTab("info");
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
        responsavel: responsavel || null,
        projeto_id: projetoId,
      };

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
      <DialogContent className="sm:max-w-[550px] bg-[#1c2132] border-[#2e3446] text-white overflow-hidden p-0">
        <div className="sticky top-0 z-10 bg-[#1c2132]">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] p-2 rounded-lg">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent">
                {taskId ? "Editar Tarefa" : "Nova Tarefa"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-400 text-sm">
              Preencha os detalhes abaixo para {taskId ? "editar a" : "criar uma nova"} tarefa.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 bg-[#222839]">
                <TabsTrigger value="info" className="data-[state=active]:bg-[#2e3446]">
                  Informações Básicas
                </TabsTrigger>
                <TabsTrigger value="detalhes" className="data-[state=active]:bg-[#2e3446]">
                  Detalhes
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pt-2 pb-6 max-h-[calc(85vh-180px)] overflow-y-auto">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="info" className="mt-2 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="titulo" className="font-medium">Título*</Label>
                </div>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="bg-[#222839] border-[#2e3446] focus:border-[#9b87f5]"
                  placeholder="Digite o título da tarefa"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="descricao" className="font-medium">Descrição</Label>
                </div>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="bg-[#222839] border-[#2e3446] focus:border-[#9b87f5] min-h-[100px]"
                  placeholder="Descreva os detalhes da tarefa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#9b87f5]" />
                    <Label htmlFor="status" className="font-medium">Status*</Label>
                  </div>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as TaskStatus)}
                  >
                    <SelectTrigger
                      id="status"
                      className="bg-[#222839] border-[#2e3446] focus:border-[#9b87f5]"
                    >
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222839] border-[#2e3446]">
                      {Object.entries(statusConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value} className="flex items-center">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${config.color}`}>
                              {config.icon}
                            </div>
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge className={`w-fit mt-1 ${statusConfig[status].color}`}>
                    <div className="flex items-center gap-1">
                      {statusConfig[status].icon}
                      <span>{statusConfig[status].label}</span>
                    </div>
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-[#9b87f5]" />
                    <Label htmlFor="prioridade" className="font-medium">Prioridade*</Label>
                  </div>
                  <Select
                    value={prioridade}
                    onValueChange={(value) => setPrioridade(value as TaskPriority)}
                  >
                    <SelectTrigger
                      id="prioridade"
                      className="bg-[#222839] border-[#2e3446] focus:border-[#9b87f5]"
                    >
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222839] border-[#2e3446]">
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className={`w-fit mt-1 ${prioridadeConfig[prioridade].color}`}>
                    {prioridadeConfig[prioridade].label}
                  </Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detalhes" className="mt-2 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="data_limite" className="font-medium">Data Limite</Label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-[#222839] border-[#2e3446] hover:bg-[#2e3446]",
                        !dataLimite && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataLimite ? (
                        format(dataLimite, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecionar data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#222839] border-[#2e3446]">
                    <Calendar
                      mode="single"
                      selected={dataLimite}
                      onSelect={setDataLimite}
                      initialFocus
                      className="bg-[#222839]"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="responsavel" className="font-medium">Responsável</Label>
                </div>
                <Input
                  id="responsavel"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="bg-[#222839] border-[#2e3446] focus:border-[#9b87f5]"
                  placeholder="Nome do responsável pela tarefa"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-6 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-[#222839] border-[#2e3446] hover:bg-[#2e3446]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] hover:opacity-90"
            >
              {loading ? "Salvando..." : taskId ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}