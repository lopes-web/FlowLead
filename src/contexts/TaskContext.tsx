import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Task, TaskStatus } from "@/types/task";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface TaskContextProps {
  tasks: Task[];
  loading: boolean;
  createTask: (task: Omit<Task, "id" | "created_at" | "updated_at">) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const TaskContext = createContext<TaskContextProps>({
  tasks: [],
  loading: false,
  createTask: async () => {
    throw new Error("createTask não implementado");
  },
  updateTask: async () => {
    throw new Error("updateTask não implementado");
  },
  deleteTask: async () => {
    throw new Error("deleteTask não implementado");
  },
});

export const useTask = () => useContext(TaskContext);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao buscar tarefas:", error);
          throw error;
        }

        if (data) {
          setTasks(data as Task[]);
        }
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        toast({
          title: "Erro ao carregar tarefas",
          description: "Ocorreu um erro ao carregar as tarefas. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

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
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [payload.new as Task, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === payload.new.id ? (payload.new as Task) : task
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) =>
              prev.filter((task) => task.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, toast]);

  const createTask = async (newTask: Omit<Task, "id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      const now = new Date().toISOString();
      const taskData = {
        ...newTask,
        user_id: user.id,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert(taskData)
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

      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso.",
      });

      return data as Task;
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      throw error;
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar tarefa:", error);
        toast({
          title: "Erro ao atualizar tarefa",
          description: "Ocorreu um erro ao atualizar a tarefa. Tente novamente mais tarde.",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}; 