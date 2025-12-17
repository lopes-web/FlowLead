import React from "react";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Função para verificar se o TaskContext está disponível
const useOptionalTask = () => {
  try {
    // Importamos dinamicamente para evitar erro de referência
    const { useTask } = require("@/contexts/TaskContext");
    return useTask();
  } catch (error) {
    // Retorna funções dummy se o contexto não estiver disponível
    return {
      refreshTasks: () => console.log("TaskContext não disponível"),
      setSelectedTaskId: () => console.log("TaskContext não disponível"),
      setModalOpen: () => console.log("TaskContext não disponível"),
      // Valores padrão para outras propriedades que possam ser necessárias
      tasks: [],
      loading: false,
      selectedTaskId: undefined,
      modalOpen: false,
      createTask: async () => { throw new Error("TaskContext não disponível") },
      updateTask: async () => { throw new Error("TaskContext não disponível") },
      deleteTask: async () => { throw new Error("TaskContext não disponível") }
    };
  }
};

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const taskContext = useOptionalTask();
  const [open, setOpen] = useState(false);
  const [hasTaskContext, setHasTaskContext] = useState(false);

  // Verificar se o TaskContext está disponível
  useEffect(() => {
    try {
      if (taskContext.refreshTasks) {
        setHasTaskContext(true);
      }
    } catch (error) {
      setHasTaskContext(false);
    }
  }, [taskContext]);

  // Log para diagnóstico de notificações
  useEffect(() => {
    console.log("Notificações disponíveis no dropdown:", notifications.length);
    notifications.forEach(notification => {
      console.log(`Notificação ${notification.id}:`, {
        tipo: notification.type,
        titulo: notification.title,
        lida: notification.read,
        dados: notification.data
      });
    });
  }, [notifications]);

  // Marcar todas as notificações como lidas quando o dropdown for fechado
  useEffect(() => {
    if (!open && unreadCount > 0) {
      markAllAsRead();
    }
  }, [open, unreadCount, markAllAsRead]);

  // Atualizar tarefas quando o dropdown é aberto
  useEffect(() => {
    if (open && hasTaskContext) {
      console.log("Dropdown de notificações aberto, atualizando tarefas...");
      taskContext.refreshTasks();
    }
  }, [open, taskContext, hasTaskContext]);

  // Função para formatar a data relativa (ex: "há 5 minutos")
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (error) {
      return "data desconhecida";
    }
  };

  // Função para extrair o nome do usuário da mensagem
  const formatUserMessage = (notification: any) => {
    if (!notification.message) return "";
    
    // Para notificações de tarefas atribuídas, usar o campo assignedToName se disponível
    if (notification.type === "task_assigned" && notification.data?.assignedToName) {
      return notification.message.replace(/Você foi designado/i, 
        `${notification.data.assignedToName} foi designado`);
    }
    
    // Padrão para encontrar emails na mensagem
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const emailMatch = notification.message.match(emailRegex);
    
    if (emailMatch && emailMatch[1]) {
      const email = emailMatch[1];
      
      // Verificar se temos dados adicionais com o nome do usuário
      if (notification.data && notification.data.userName) {
        // Se o email no data for o mesmo que encontramos na mensagem
        if (notification.data.userName === email) {
          // Verificar se temos um nome de usuário nos metadados
          if (notification.data.userMetadata && notification.data.userMetadata.name) {
            return notification.message.replace(email, notification.data.userMetadata.name);
          }
          
          // Caso contrário, extrair um nome do email
          const username = email.split('@')[0];
          const formattedName = username
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
          
          return notification.message.replace(email, formattedName);
        }
      }
      
      // Fallback: extrair nome do email
      const username = email.split('@')[0];
      const formattedName = username
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
      
      return notification.message.replace(email, formattedName);
    }
    
    return notification.message;
  };

  // Função para obter o ícone baseado no tipo de notificação
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "lead_created":
        return "🟢";
      case "lead_updated":
        return "🔄";
      case "lead_deleted":
        return "🗑️";
      case "lead_status_changed":
        return "📋";
      case "project_created":
        return "📁";
      case "project_updated":
        return "📝";
      case "task_assigned":
        return "📌";
      default:
        return "📣";
    }
  };

  // Função para lidar com o clique em uma notificação
  const handleNotificationClick = (notification: any) => {
    // Verificar se é uma notificação de tarefa atribuída e se o TaskContext está disponível
    if (hasTaskContext && notification.type === "task_assigned" && notification.data?.taskId) {
      console.log("Abrindo tarefa da notificação:", notification.data.taskId);
      taskContext.setSelectedTaskId(notification.data.taskId);
      taskContext.setModalOpen(true);
      setOpen(false); // Fechar o dropdown
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#9b87f5]"
              variant="default"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificações</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => clearNotifications()}
            >
              Limpar tudo
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="py-4 px-2 text-center text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className={`flex flex-col items-start gap-1 p-3 ${
                    hasTaskContext && notification.type === "task_assigned" ? "cursor-pointer hover:bg-[#222839]" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span>{getNotificationIcon(notification.type)}</span>
                    <span className="font-medium flex-1">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {formatUserMessage(notification)}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{formatUserMessage(notification)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {hasTaskContext && notification.type === "task_assigned" && notification.data?.taskId && (
                    <div className="mt-1 text-xs text-[#9b87f5] hover:text-[#8B5CF6] transition-colors">
                      Clique para ver a tarefa
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 