import { useState } from "react";
import { TasksKanban } from "@/components/TasksKanban";
import { TaskProvider } from "@/contexts/TaskContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { 
  PlusCircle, 
  LayoutDashboard, 
  KanbanSquare,
  Timer,
  Zap,
  FolderKanban,
  CheckSquare
} from "lucide-react";

export function Tasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // Função para obter as iniciais do email
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <TaskProvider>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent tracking-tight">
                FlowLead
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="gap-2"
                  size="sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/leads")}
                  className="gap-2"
                  size="sm"
                >
                  <KanbanSquare className="h-4 w-4" />
                  Leads
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/projects")}
                  className="gap-2"
                  size="sm"
                >
                  <FolderKanban className="h-4 w-4" />
                  Projetos
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/tarefas")}
                  className="gap-2"
                  size="sm"
                >
                  <CheckSquare className="h-4 w-4" />
                  Tarefas
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/time")}
                  className="gap-2"
                  size="sm"
                >
                  <Timer className="h-4 w-4" />
                  Tempo
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <Button
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  className="gap-2 p-0"
                  size="sm"
                >
                  <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                    <AvatarImage 
                      src={user?.user_metadata?.avatar_url || ""} 
                      alt={user?.email || "Usuário"} 
                    />
                    <AvatarFallback className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] text-white text-xs">
                      {user ? getInitials(user.email) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-hidden">
            <TasksKanban />
          </main>
        </div>
      </div>
    </TaskProvider>
  );
} 