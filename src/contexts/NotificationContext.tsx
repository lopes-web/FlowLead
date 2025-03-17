import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Notification, NotificationType } from "@/types/notification";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
import { v4 as uuidv4 } from "uuid";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (type: NotificationType, title: string, message: string, data?: any) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Calcular o número de notificações não lidas
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Carregar notificações do localStorage ao iniciar
  useEffect(() => {
    if (user) {
      const storedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (storedNotifications) {
        try {
          setNotifications(JSON.parse(storedNotifications));
        } catch (error) {
          console.error("Erro ao carregar notificações:", error);
        }
      }
    }
  }, [user]);

  // Salvar notificações no localStorage quando mudar
  useEffect(() => {
    if (user && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  // Adicionar uma nova notificação
  const addNotification = (
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ) => {
    const newNotification: Notification = {
      id: uuidv4(),
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      data
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Limitar a 50 notificações
  };

  // Marcar uma notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Limpar todas as notificações
  const clearNotifications = () => {
    setNotifications([]);
    if (user) {
      localStorage.removeItem(`notifications_${user.id}`);
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