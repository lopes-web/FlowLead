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
          read: notification.read_by?.includes(user?.id || "") || false,
          data: notification.data
        }));

        setNotifications(formattedNotifications);
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
          created_by: user.id,
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
      if (!readBy.includes(user.id)) {
        readBy.push(user.id);
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
          if (!readBy.includes(user.id)) {
            readBy.push(user.id);
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
      // Não vamos excluir as notificações, apenas marcá-las como lidas
      await markAllAsRead();
      
      // Atualizar o estado local para esconder as notificações
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