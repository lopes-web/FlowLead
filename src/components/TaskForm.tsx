import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTask } from "@/contexts/TaskContext";
import { useUser } from "@/contexts/UserContext";
import { TaskPriority, TaskStatus } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define status e prioridade como constantes para evitar problemas
const STATUS_OPTIONS = [
  { value: "backlog", label: "Backlog" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "revisao", label: "Revisão" },
  { value: "bloqueado", label: "Bloqueado" },
  { value: "concluido", label: "Concluído" }
];

const PRIORITY_OPTIONS = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" }
];

const taskFormSchema = z.object({
  titulo: z.string().min(1, "O título é obrigatório"),
  descricao: z.string().optional(),
  status: z.enum(["backlog", "em_andamento", "revisao", "bloqueado", "concluido"] as const),
  prioridade: z.enum(["baixa", "media", "alta", "urgente"] as const),
  responsavel: z.string().optional(),
  data_limite: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  taskId?: string;
  onSuccess?: () => void;
}

export function TaskForm({ taskId, onSuccess }: TaskFormProps) {
  const { tasks, createTask, updateTask } = useTask();
  const { users } = useUser();
  const task = tasks.find((t) => t.id === taskId);

  // Garantir valores padrão seguros
  const defaultValues: TaskFormData = {
    titulo: task?.titulo || "",
    descricao: task?.descricao || "",
    status: task?.status || "backlog",
    prioridade: task?.prioridade || "media",
    responsavel: task?.responsavel || "",
    data_limite: task?.data_limite
      ? format(new Date(task.data_limite), "yyyy-MM-dd'T'HH:mm")
      : "",
  };

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  // Reset do formulário quando a task mudar
  useEffect(() => {
    form.reset({
      titulo: task?.titulo || "",
      descricao: task?.descricao || "",
      status: task?.status || "backlog",
      prioridade: task?.prioridade || "media",
      responsavel: task?.responsavel || "",
      data_limite: task?.data_limite
        ? format(new Date(task.data_limite), "yyyy-MM-dd'T'HH:mm")
        : "",
    });
  }, [task, form]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (taskId) {
        await updateTask(taskId, data);
      } else {
        await createTask(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da tarefa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite uma descrição para a tarefa"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Status usando Controller diretamente para maior controle */}
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prioridade usando Controller diretamente para maior controle */}
          <Controller
            control={form.control}
            name="prioridade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Responsável */}
          <Controller
            control={form.control}
            name="responsavel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Sem responsável</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.raw_user_meta_data?.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data_limite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Limite</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            {taskId ? "Salvar Alterações" : "Criar Tarefa"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 