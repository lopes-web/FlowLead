import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Task, TaskStatus } from "@/types/task";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";

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
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
          .eq("user_id", user.id)
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

  const createTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
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

      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso.",
      });

      setTasks((prev) => [data, ...prev]);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: Omit<Task, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ ...taskData, user_id: user.id })
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

      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      });

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