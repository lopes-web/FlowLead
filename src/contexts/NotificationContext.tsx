import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Notification, NotificationType } from "@/types/notification";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
import { v4 as uuidv4 } from "uuid";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (type: NotificationType, title: string, message: string, data?: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Calcular o número de notificações não lidas
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Carregar notificações do Supabase ao iniciar
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Função para buscar notificações do Supabase
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar notificações:", error);
        return;
      }

      if (data) {
        // Formatar as notificações para o formato esperado
        const formattedNotifications = data.map(notification => ({
          id: notification.id,
          type: notification.type as NotificationType,
          title: notification.title,
          message: notification.message,
          createdAt: notification.created_at,
          read: notification.read_by?.some((id: string) => String(id) === String(user?.id)) || false,
          data: notification.data
        }));

        // Filtrar notificações para mostrar apenas as destinadas ao usuário atual
        // ou notificações gerais sem usuário específico
        const filteredNotifications = formattedNotifications.filter(notification => {
          // Se for notificação de tarefa atribuída, verificar se o usuário atual é o destinatário
          if (notification.type === "task_assigned") {
            const assignedToId = notification.data?.assignedTo;
            const assignedToEmail = notification.data?.assignedToEmail;
            const assignedToName = notification.data?.assignedToName;
            const currentUserId = user?.id;
            const currentUserEmail = user?.email;
            const currentUserName = user?.user_metadata?.name;
            
            // Comparações para verificar se a notificação é para o usuário atual
            const matchId = assignedToId && currentUserId && 
                           String(assignedToId).trim() === String(currentUserId).trim();
            const matchEmail = assignedToEmail && currentUserEmail && 
                              String(assignedToEmail).toLowerCase() === String(currentUserEmail).toLowerCase();
            const matchName = assignedToName && currentUserName && 
                             String(assignedToName).toLowerCase() === String(currentUserName).toLowerCase();
            
            // Log detalhado para diagnóstico
            console.log(`Filtrando notificação ${notification.id} (tipo: ${notification.type}):`, {
              assignedToId, currentUserId, matchId,
              assignedToEmail, currentUserEmail, matchEmail,
              assignedToName, currentUserName, matchName
            });
            
            return matchId || matchEmail || matchName;
          }
          
          // Outras notificações são mostradas para todos por enquanto
          return true;
        });

        setNotifications(filteredNotifications);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  // Adicionar uma nova notificação
  const addNotification = async (
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ) => {
    if (!user) return;

    try {
      const notificationId = uuidv4();
      
      const { error } = await supabase
        .from("notifications")
        .insert([{
          id: notificationId,
          type,
          title,
          message,
          created_at: new Date().toISOString(),
          created_by: String(user.id),
          read_by: [],
          data
        }]);

      if (error) {
        console.error("Erro ao adicionar notificação:", error);
        return;
      }

      // Atualizar o estado local
      const newNotification: Notification = {
        id: notificationId,
        type,
        title,
        message,
        createdAt: new Date().toISOString(),
        read: false,
        data
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      // Recarregar notificações para garantir sincronização
      fetchNotifications();
    } catch (error) {
      console.error("Erro ao adicionar notificação:", error);
    }
  };

  // Marcar uma notificação como lida
  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      // Buscar a notificação atual para obter a lista de leitores
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("read_by")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar notificação:", fetchError);
        return;
      }

      // Adicionar o usuário atual à lista de leitores se ainda não estiver lá
      const readBy = data.read_by || [];
      if (!readBy.some((id: string) => String(id) === String(user.id))) {
        readBy.push(String(user.id));
      }

      // Atualizar a notificação no Supabase
      const { error } = await supabase
        .from("notifications")
        .update({ read_by: readBy })
        .eq("id", id);

      if (error) {
        console.error("Erro ao marcar notificação como lida:", error);
        return;
      }

      // Atualizar o estado local
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      // Para cada notificação não lida, adicionar o usuário à lista de leitores
      const updates = notifications
        .filter(notification => !notification.read)
        .map(async notification => {
          // Buscar a notificação atual para obter a lista de leitores
          const { data, error: fetchError } = await supabase
            .from("notifications")
            .select("read_by")
            .eq("id", notification.id)
            .single();

          if (fetchError) {
            console.error("Erro ao buscar notificação:", fetchError);
            return;
          }

          // Adicionar o usuário atual à lista de leitores
          const readBy = data.read_by || [];
          if (!readBy.some((id: string) => String(id) === String(user.id))) {
            readBy.push(String(user.id));
          }

          // Atualizar a notificação no Supabase
          return supabase
            .from("notifications")
            .update({ read_by: readBy })
            .eq("id", notification.id);
        });

      await Promise.all(updates);

      // Atualizar o estado local
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
    }
  };

  // Limpar todas as notificações (apenas para o usuário atual)
  const clearNotifications = async () => {
    if (!user) return;

    try {
      // Buscar todas as notificações do usuário atual
      const { data: userNotifications, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Erro ao buscar notificações:", fetchError);
        return;
      }

      // Filtrar notificações que têm o usuário atual como criador ou leitor
      const notificationsToDelete = userNotifications.filter(notification => 
        String(notification.created_by) === String(user.id) || 
        (notification.read_by && notification.read_by.some((id: string) => String(id) === String(user.id)))
      );

      if (notificationsToDelete.length > 0) {
        // Excluir as notificações
        const { error: deleteError } = await supabase
          .from("notifications")
          .delete()
          .in("id", notificationsToDelete.map(n => n.id));

        if (deleteError) {
          console.error("Erro ao excluir notificações:", deleteError);
          return;
        }
      }
      
      // Atualizar o estado local
      setNotifications([]);
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
} 