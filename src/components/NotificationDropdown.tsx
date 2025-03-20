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

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [open, setOpen] = useState(false);

  // Marcar todas as notificações como lidas quando o dropdown for fechado
  useEffect(() => {
    if (!open && unreadCount > 0) {
      markAllAsRead();
    }
  }, [open, unreadCount, markAllAsRead]);

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
      default:
        return "📣";
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
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
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
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 