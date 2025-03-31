import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Task, TaskStatus } from "@/types/task";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNotifications } from "./NotificationContext";
import { useUser } from "./UserContext";

interface TaskContextProps {
  tasks: Task[];
  loading: boolean;
  createTask: (task: Omit<Task, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>;
  updateTask: (id: string, task: Omit<Task, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectedTaskId: string | undefined;
  setSelectedTaskId: (id: string | undefined) => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { users } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  useEffect(() => {
    console.log("Estado atual das tarefas:", tasks);
  }, [tasks]);

  // Função para buscar tarefas - definida fora do useEffect para poder ser exportada
  const fetchTasks = async () => {
    if (!user) return;
    
    const currentUserId = user.id;
    console.log("=== INÍCIO DO PROCESSO DE BUSCA DE TAREFAS ===");
    console.log("Buscando tarefas para usuário:", currentUserId);
    console.log("Email do usuário:", user.email);
    
    try {
      setLoading(true);
      
      // Buscar todas as tarefas primeiro
      const { data: allTasks, error: allTasksError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (allTasksError) {
        console.error("Erro ao buscar tarefas:", allTasksError);
        return;
      }
      
      if (!allTasks) {
        console.log("Nenhuma tarefa encontrada");
        setTasks([]);
        return;
      }
      
      console.log("Total de tarefas no sistema:", allTasks.length);
      
      // Filtrar tarefas relevantes para o usuário
      const userTasks = allTasks.filter(task => {
        const isCreator = String(task.user_id).trim() === String(currentUserId).trim();
        const isResponsible = String(task.responsavel).trim() === String(currentUserId).trim();
        
        if (isCreator || isResponsible) {
          console.log("Tarefa relevante encontrada:", {
            id: task.id,
            titulo: task.titulo,
            responsavel: task.responsavel,
            user_id: task.user_id,
            isCreator,
            isResponsible
          });
        }
        
        return isCreator || isResponsible;
      });
      
      console.log("Tarefas do usuário após filtro:", userTasks.length);
      userTasks.forEach(task => {
        console.log(`- ${task.titulo} (ID: ${task.id})`);
        console.log(`  Responsável: ${task.responsavel}`);
        console.log(`  Criador: ${task.user_id}`);
        console.log(`  Status: ${task.status}`);
      });
      
      setTasks(userTasks);
      
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      toast({
        title: "Erro ao carregar tarefas",
        description: "Ocorreu um erro ao carregar as tarefas. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("=== FIM DO PROCESSO DE BUSCA DE TAREFAS ===");
    }
  };

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // Expor a função de recarregar tarefas no contexto
    const intervalId = setInterval(() => {
      console.log("Recarregando tarefas (verificação periódica)...");
      fetchTasks();
    }, 30000); // Verificar a cada 30 segundos

    fetchTasks();

    // Configurar subscription para mudanças na tabela tasks
    const subscription = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        async (payload) => {
          console.log("Subscription payload:", payload);
          
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            // Verificar se a tarefa é do usuário ou foi atribuída a ele
            const payloadUserId = String(payload.new.user_id);
            const payloadResponsavel = String(payload.new.responsavel);
            const currentUserId = String(user.id);
            
            console.log("Verificando relevância da tarefa atualizada:");
            console.log("Task user_id:", payloadUserId, "Current user:", currentUserId, "Match:", payloadUserId === currentUserId);
            console.log("Task responsavel:", payloadResponsavel, "Current user:", currentUserId, "Match:", payloadResponsavel === currentUserId);
            
            if (payloadUserId === currentUserId || payloadResponsavel === currentUserId) {
              console.log("Mudança detectada em tarefa relevante para o usuário, recarregando...");
              await fetchTasks();
            } else {
              console.log("Mudança em tarefa não relevante para o usuário.");
            }
          } else if (payload.eventType === "DELETE") {
            console.log("Task excluída:", payload.old);
            setTasks((prev) =>
              prev.filter((task) => task.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Configurar subscription para mudanças na tabela notifications
    const notificationSubscription = supabase
      .channel("notification-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          console.log("Nova notificação recebida:", payload.new);
          
          // Verificar se é uma notificação de tarefa atribuída ao usuário atual
          if (
            payload.new.type === "task_assigned" && 
            payload.new.read_by && 
            !payload.new.read_by.includes(String(user.id))
          ) {
            console.log("Notificação de tarefa atribuída, recarregando tarefas...");
            await fetchTasks();
          }
        }
      )
      .subscribe();
      
    // Ouvir eventos de atribuição de tarefas
    const taskAssignmentChannel = supabase.channel('task-assignments')
      .on('broadcast', { event: 'task-assigned' }, async (payload) => {
        console.log('Recebido evento de tarefa atribuída:', payload);
        
        // Se a tarefa foi atribuída ao usuário atual
        if (String(payload.payload.assignedTo) === String(user.id)) {
          console.log('Tarefa foi atribuída a mim, atualizando lista...');
          await fetchTasks();
        }
      })
      .subscribe();

    return () => {
      clearInterval(intervalId);
      subscription.unsubscribe();
      notificationSubscription.unsubscribe();
      taskAssignmentChannel.unsubscribe();
    };
  }, [user, toast]);

  const createTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      console.log("Criando tarefa com dados:", taskData);
      
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar tarefa:", error);
        toast({
          title: "Erro ao criar tarefa",
          description: "Ocorreu um erro ao criar a tarefa. Tente novamente mais tarde.",
          variant: "destructive",
        });
        throw error;
      }

      console.log("Tarefa criada com sucesso:", data);
      
      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso.",
      });

      // Adicionar notificação se a tarefa tiver um responsável
      // Agora estamos verificando o ID do usuário
      if (data.responsavel && String(data.responsavel) !== String(user.id)) {
        // Buscar usuário diretamente da lista de usuários no contexto
        const responsavelUser = users.find(u => String(u.id) === String(data.responsavel));
        
        // Definir nome do responsável a partir dos dados locais
        const responsavelNome = responsavelUser 
          ? (responsavelUser.raw_user_meta_data?.name || responsavelUser.email) 
          : data.responsavel;
            
        console.log("Usando dados do usuário do contexto:", responsavelUser);
            
        await addNotification(
          "task_assigned",
          "Nova tarefa atribuída a você",
          `Você foi designado como responsável pela tarefa: ${data.titulo}`,
          {
            taskId: data.id,
            taskTitle: data.titulo,
            assignedBy: user.user_metadata?.name || user.email,
            assignedTo: data.responsavel, // ID do responsável
            assignedToName: responsavelNome, // Nome do responsável para exibição
            assignedToEmail: responsavelUser?.email // Email do responsável para identificação adicional
          }
        );
          
        // Registrar que o usuário foi notificado da atribuição
        try {
          console.log(`Enviando mensagem na task assignment channel para ${data.responsavel}`);
          
          // Enviar mensagem no canal para forçar atualização no cliente do responsável
          await supabase.channel('task-assignments')
            .send({
              type: 'broadcast',
              event: 'task-assigned',
              payload: {
                taskId: data.id,
                assignedTo: data.responsavel,
                timestamp: new Date().toISOString()
              }
            });
        } catch (error) {
          console.error("Erro ao enviar mensagem de atribuição:", error);
        }
      }

      setTasks((prev) => [data, ...prev]);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: Omit<Task, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      // Obter a tarefa atual para verificar se o responsável mudou
      const { data: currentTask, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();
        
      if (fetchError) {
        console.error("Erro ao buscar tarefa atual:", fetchError);
        throw fetchError;
      }
      
      console.log("Atualizando tarefa com dados:", taskData);
      
      const { data, error } = await supabase
        .from("tasks")
        .update({ ...taskData })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar tarefa:", error);
        toast({
          title: "Erro ao atualizar tarefa",
          description: "Ocorreu um erro ao atualizar a tarefa. Tente novamente mais tarde.",
          variant: "destructive",
        });
        throw error;
      }

      console.log("Tarefa atualizada com sucesso:", data);
      
      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      });

      // Verificar se o responsável mudou e criar notificação
      const currentTaskResponsavel = currentTask?.responsavel ? String(currentTask.responsavel) : null;
      const newTaskResponsavel = taskData.responsavel ? String(taskData.responsavel) : null;
      const currentUserId = String(user.id);
      
      console.log("Verificando mudança de responsável:");
      console.log("Responsável anterior:", currentTaskResponsavel);
      console.log("Novo responsável:", newTaskResponsavel);
      console.log("Usuário atual:", currentUserId);
      
      if (
        newTaskResponsavel && 
        newTaskResponsavel !== currentTaskResponsavel && 
        newTaskResponsavel !== currentUserId
      ) {
        console.log("Responsável alterado, enviando notificação");
        
        // Buscar usuário diretamente da lista de usuários no contexto
        const responsavelUser = users.find(u => String(u.id) === String(taskData.responsavel));
        
        // Definir nome do responsável a partir dos dados locais
        const responsavelNome = responsavelUser 
          ? (responsavelUser.raw_user_meta_data?.name || responsavelUser.email) 
          : taskData.responsavel;
            
        console.log("Usando dados do usuário do contexto:", responsavelUser);
          
        await addNotification(
          "task_assigned",
          "Tarefa atribuída a você",
          `Você foi designado como responsável pela tarefa: ${data.titulo}`,
          {
            taskId: data.id,
            taskTitle: data.titulo,
            assignedBy: user.user_metadata?.name || user.email,
            assignedTo: data.responsavel, // ID do responsável
            assignedToName: responsavelNome, // Nome do responsável para exibição
            assignedToEmail: responsavelUser?.email // Email do responsável para identificação adicional
          }
        );
          
        // Registrar que o usuário foi notificado da atribuição
        try {
          console.log(`Enviando mensagem na task assignment channel para ${taskData.responsavel}`);
          
          // Enviar mensagem no canal para forçar atualização no cliente do responsável
          await supabase.channel('task-assignments')
            .send({
              type: 'broadcast',
              event: 'task-assigned',
              payload: {
                taskId: data.id,
                assignedTo: taskData.responsavel,
                timestamp: new Date().toISOString()
              }
            });
        } catch (error) {
          console.error("Erro ao enviar mensagem de atribuição:", error);
        }
      }

      setTasks((prev) => prev.map((task) => (task.id === id ? data : task)));
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir tarefa:", error);
        toast({
          title: "Erro ao excluir tarefa",
          description: "Ocorreu um erro ao excluir a tarefa. Tente novamente mais tarde.",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });

      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      throw error;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        createTask,
        updateTask,
        deleteTask,
        selectedTaskId,
        setSelectedTaskId,
        modalOpen,
        setModalOpen,
        refreshTasks: fetchTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask deve ser usado dentro de um TaskProvider");
  }
  return context;
} 