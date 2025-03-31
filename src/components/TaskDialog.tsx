import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
}

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
      <DialogContent className="sm:max-w-[500px] bg-[#1c2132] border-[#2e3446] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent">
            {taskId ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título*</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="bg-[#222839] border-[#2e3446] focus:border-[#9b87f5]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-[#222839] border-[#2e3446] focus:border-[#9b87f5] min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status*</Label>
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
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="revisao">Revisão</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade*</Label>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_limite">Data Limite</Label>
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
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="bg-[#222839] border-[#2e3446] focus:border-[#9b87f5]"
            />
          </div>

          <DialogFooter>
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