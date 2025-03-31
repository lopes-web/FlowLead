import { useState } from "react";
import { useTask } from "@/contexts/TaskContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { TaskDialog } from "@/components/TaskDialog";
import { TasksKanban } from "@/components/TasksKanban";
import { useUser } from "@/contexts/UserContext";
import { 
  PlusCircle, 
  LayoutDashboard, 
  KanbanSquare,
  Timer,
  Zap,
  FolderKanban,
  CheckSquare,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TasksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setSelectedTaskId, setModalOpen, modalOpen, selectedTaskId, tasks, refreshTasks } = useTask();
  const { users } = useUser();
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);

  // Função para obter as iniciais do email
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Função para obter o nome do responsável
  const getResponsavelName = (responsavelId: string) => {
    if (!responsavelId) return "Nenhum";
    
    const responsavelIdStr = String(responsavelId);
    const responsavel = users.find(user => String(user.id) === responsavelIdStr);
    
    return responsavel 
      ? `${responsavel.raw_user_meta_data?.name || responsavel.email} (${responsavelIdStr})` 
      : `ID não encontrado: ${responsavelIdStr}`;
  };

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
              <Button
                variant="ghost"
                onClick={() => {
                  // Primeiro recarregar a lista de usuários, então recarregar tarefas
                  // e finalmente abrir o diálogo de diagnóstico
                  Promise.all([
                    refreshTasks()
                  ]).then(() => setDebugDialogOpen(true));
                }}
                className="gap-2"
                size="sm"
              >
                <Search className="h-4 w-4" />
                Diagnóstico
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
          <div className="h-full">
            <TasksKanban />
          </div>
        </main>
      </div>

      <TaskDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        taskId={selectedTaskId}
      />

      {/* Modal de diagnóstico */}
      <Dialog open={debugDialogOpen} onOpenChange={setDebugDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] bg-[#1c2132] border-[#2e3446] text-white">
          <DialogHeader>
            <DialogTitle>Diagnóstico de Tarefas</DialogTitle>
            <DialogDescription className="text-gray-400">
              Informações detalhadas sobre tarefas e usuários
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto flex-1 space-y-6">
            {/* Usuário atual */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#9b87f5]">Usuário Atual</h3>
              <div className="bg-[#222839] p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {user ? JSON.stringify({
                    id: user.id,
                    email: user.email,
                    nome: user.user_metadata?.name || "Não definido"
                  }, null, 2) : "Não autenticado"}
                </pre>
              </div>
            </div>
            
            {/* Lista de usuários */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#9b87f5]">Lista de Usuários ({users.length})</h3>
              <div className="bg-[#222839] p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(users.map(u => ({
                    id: u.id,
                    email: u.email,
                    nome: u.raw_user_meta_data?.name || "Não definido"
                  })), null, 2)}
                </pre>
              </div>
            </div>
            
            {/* Lista de tarefas */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#9b87f5]">Lista de Tarefas ({tasks.length})</h3>
              <div className="grid grid-cols-1 gap-4">
                {tasks.map(task => {
                  const isMyTask = String(task.responsavel) === String(user?.id);
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`bg-[#222839] p-4 rounded-lg ${
                        isMyTask ? 'border-l-4 border-l-[#9b87f5]' : ''
                      }`}
                    >
                      <h4 className="font-bold mb-2">
                        {isMyTask && <span className="text-[#9b87f5] mr-1">●</span>}
                        {task.titulo}
                        {isMyTask && <span className="text-[#9b87f5] text-xs ml-2">(Atribuída a você)</span>}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <strong>ID:</strong> {task.id}
                        </div>
                        <div>
                          <strong>Status:</strong> {task.status}
                        </div>
                        <div>
                          <strong>Criador:</strong> {getResponsavelName(task.user_id)}
                        </div>
                        <div>
                          <strong>Responsável:</strong> {getResponsavelName(task.responsavel)}
                        </div>
                        <div className="col-span-2">
                          <strong>Descrição:</strong> {task.descricao || "Sem descrição"}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {tasks.length === 0 && (
                  <div className="bg-[#222839] p-4 rounded-lg text-center">
                    Nenhuma tarefa encontrada
                  </div>
                )}
              </div>
            </div>
            
            {/* Minhas tarefas atribuídas */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#9b87f5]">Minhas Tarefas Atribuídas</h3>
              <div className="grid grid-cols-1 gap-4">
                {tasks
                  .filter(t => String(t.responsavel) === String(user?.id))
                  .map(task => (
                    <div key={task.id} className="bg-[#222839] p-4 rounded-lg border-2 border-[#9b87f5]">
                      <h4 className="font-bold mb-2">{task.titulo}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <strong>ID:</strong> {task.id}
                        </div>
                        <div>
                          <strong>Status:</strong> {task.status}
                        </div>
                        <div>
                          <strong>Criador:</strong> {getResponsavelName(task.user_id)}
                        </div>
                        <div>
                          <strong>Responsável:</strong> {getResponsavelName(task.responsavel)}
                          <div className="mt-1 text-xs bg-[#1c2132] p-1 rounded">
                            ID: {task.responsavel} ({typeof task.responsavel})
                          </div>
                        </div>
                        <div className="col-span-2">
                          <strong>Descrição:</strong> {task.descricao || "Sem descrição"}
                        </div>
                      </div>
                    </div>
                  ))}
                {tasks.filter(t => String(t.responsavel) === String(user?.id)).length === 0 && (
                  <div className="bg-[#222839] p-4 rounded-lg text-center">
                    Nenhuma tarefa atribuída a você
                  </div>
                )}
              </div>
            </div>
            
            {/* Diagnóstico de comparação */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#9b87f5]">Teste de Comparação de IDs</h3>
              <div className="bg-[#222839] p-4 rounded-lg">
                <p className="mb-4">Seu ID: <strong>{String(user?.id)}</strong></p>
                {tasks.map(task => (
                  <div key={task.id} className={`mb-2 p-2 border rounded ${
                    String(task.responsavel) === String(user?.id) 
                      ? 'border-[#9b87f5] bg-[#9b87f5]/10' 
                      : 'border-[#2e3446]'
                  }`}>
                    <p>Tarefa: {task.titulo}</p>
                    <p>Responsável: {task.responsavel || "Nenhum"}</p>
                    <p>Tipo do responsável: {typeof task.responsavel}</p>
                    <p>ID iguais (===): 
                      {String(task.responsavel) === String(user?.id) 
                        ? <span className="text-green-400 font-bold"> ✅ SIM</span> 
                        : <span className="text-red-400"> ❌ NÃO</span>}
                    </p>
                    <p>Comparação alternativa: 
                      {String(task.responsavel) == String(user?.id) 
                        ? <span className="text-green-400 font-bold"> ✅ SIM</span> 
                        : <span className="text-red-400"> ❌ NÃO</span>}
                    </p>
                    <div className="mt-2 text-xs grid grid-cols-2 gap-2">
                      <div className="bg-[#1c2132] p-1 rounded">
                        <strong>Responsável:</strong> {[...String(task.responsavel || '')].map(c => c.charCodeAt(0)).join(',')}
                      </div>
                      <div className="bg-[#1c2132] p-1 rounded">
                        <strong>Seu ID:</strong> {[...String(user?.id || '')].map(c => c.charCodeAt(0)).join(',')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 