import { useState } from "react";
import { TaskProvider, useTask } from "@/contexts/TaskContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { TaskDialog } from "@/components/TaskDialog";
import { 
  PlusCircle, 
  LayoutDashboard, 
  KanbanSquare,
  Timer,
  Zap,
  FolderKanban,
  CheckSquare,
  ListTodo,
  Play,
  FileSearch,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/TaskCard";

function TasksContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks } = useTask();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  // Função para obter as iniciais do email
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Filtrar tarefas por status
  const backlogTasks = tasks.filter(task => task.status === "backlog");
  const emAndamentoTasks = tasks.filter(task => task.status === "em_andamento");
  const revisaoTasks = tasks.filter(task => task.status === "revisao");
  const bloqueadoTasks = tasks.filter(task => task.status === "bloqueado");
  const concluidoTasks = tasks.filter(task => task.status === "concluido");

  return (
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
              <Button
                variant="default"
                onClick={() => {
                  setSelectedTaskId(undefined);
                  setModalOpen(true);
                }}
                className="gap-2"
                size="sm"
              >
                <PlusCircle className="h-4 w-4" />
                Nova Tarefa
              </Button>
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
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-5 gap-4 p-4">
              <div className="bg-[#1c2132] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-5 w-5 text-[#F59E0B]" />
                    <h2 className="text-lg font-semibold text-[#F59E0B]">Backlog</h2>
                  </div>
                  <Badge variant="outline" className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30">
                    {backlogTasks.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {backlogTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>

              <div className="bg-[#1c2132] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-[#8B5CF6]" />
                    <h2 className="text-lg font-semibold text-[#8B5CF6]">Em Andamento</h2>
                  </div>
                  <Badge variant="outline" className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30">
                    {emAndamentoTasks.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {emAndamentoTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>

              <div className="bg-[#1c2132] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-5 w-5 text-[#EC4899]" />
                    <h2 className="text-lg font-semibold text-[#EC4899]">Revisão</h2>
                  </div>
                  <Badge variant="outline" className="bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30">
                    {revisaoTasks.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {revisaoTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>

              <div className="bg-[#1c2132] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
                    <h2 className="text-lg font-semibold text-[#EF4444]">Bloqueado</h2>
                  </div>
                  <Badge variant="outline" className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30">
                    {bloqueadoTasks.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {bloqueadoTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>

              <div className="bg-[#1c2132] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                    <h2 className="text-lg font-semibold text-[#10B981]">Concluído</h2>
                  </div>
                  <Badge variant="outline" className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30">
                    {concluidoTasks.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {concluidoTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <TaskDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        taskId={selectedTaskId}
      />
    </div>
  );
}

export function Tasks() {
  return (
    <TaskProvider>
      <TasksContent />
    </TaskProvider>
  );
} 