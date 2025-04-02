import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { SimpleSelect } from "@/components/ui/simple-select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  AlertCircle, 
  AlignLeft, 
  CalendarIcon, 
  User,
  Hash, 
  Activity 
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [date, setDate] = useState<Date | undefined>(
    task?.data_limite ? new Date(task.data_limite) : undefined
  );

  // Garantir valores padrão seguros
  const defaultValues: TaskFormData = {
    titulo: task?.titulo || "",
    descricao: task?.descricao || "",
    status: task?.status || "backlog",
    prioridade: task?.prioridade || "media",
    responsavel: task?.responsavel || "",
    data_limite: task?.data_limite
      ? format(new Date(task.data_limite), "yyyy-MM-dd")
      : "",
  };

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  // Reset do formulário quando a task mudar
  useEffect(() => {
    const newDate = task?.data_limite ? new Date(task.data_limite) : undefined;
    setDate(newDate);
    
    form.reset({
      titulo: task?.titulo || "",
      descricao: task?.descricao || "",
      status: task?.status || "backlog",
      prioridade: task?.prioridade || "media",
      responsavel: task?.responsavel || "",
      data_limite: task?.data_limite
        ? format(new Date(task.data_limite), "yyyy-MM-dd")
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

  // Preparar a lista de usuários para o select
  const userOptions = [
    { value: "", label: "Sem responsável" },
    ...users.map(user => ({
      value: user.id,
      label: user.raw_user_meta_data?.name || user.email
    }))
  ];

  // Atualizar o campo de data quando a data selecionada mudar
  const onDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      form.setValue("data_limite", format(newDate, "yyyy-MM-dd"));
    } else {
      form.setValue("data_limite", "");
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
              <FormLabel className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-[#a08af7]" />
                Título
              </FormLabel>
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
              <FormLabel className="flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-[#a08af7]" />
                Descrição
              </FormLabel>
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
          {/* Status usando SimpleSelect */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-[#a08af7]" />
                  Status
                </FormLabel>
                <FormControl>
                  <SimpleSelect
                    options={STATUS_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione o status"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prioridade usando SimpleSelect */}
          <FormField
            control={form.control}
            name="prioridade"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#a08af7]" />
                  Prioridade
                </FormLabel>
                <FormControl>
                  <SimpleSelect
                    options={PRIORITY_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione a prioridade"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Responsável usando SimpleSelect */}
          <FormField
            control={form.control}
            name="responsavel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#a08af7]" />
                  Responsável
                </FormLabel>
                <FormControl>
                  <SimpleSelect
                    options={userOptions}
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Selecione o responsável"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data Limite com Popover de Calendário */}
          <FormField
            control={form.control}
            name="data_limite"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-[#a08af7]" />
                  Data Limite
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-[#1c2132] border-[#2e3446] hover:bg-[#252a3d] text-white",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1c2132] border-[#2e3446] text-white">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={onDateChange}
                      initialFocus
                      className="bg-[#1c2132] text-white"
                      classNames={{
                        day_selected: "bg-[#a08af7] text-white hover:bg-[#a08af7] hover:text-white focus:bg-[#a08af7] focus:text-white",
                        day_today: "bg-[#2e3446] text-white",
                        day: "text-white hover:bg-[#2e3446] text-xs",
                        day_outside: "text-gray-500 opacity-50 hover:bg-[#2e3446] hover:text-gray-400 text-xs",
                        head_cell: "text-gray-400 text-xs w-8",
                        cell: "text-white h-7 w-7 p-0 text-xs relative focus-within:relative focus-within:z-20",
                        nav_button: "bg-[#1c2132] text-gray-400 hover:bg-[#2e3446] hover:text-white border-[#2e3446] h-6 w-6",
                        caption_label: "text-white text-sm font-medium",
                        table: "border-[#2e3446] max-w-full",
                        row: "flex w-full mt-1 justify-center",
                        months: "flex flex-col space-y-2",
                        month: "space-y-2 w-full"
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
} 