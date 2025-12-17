import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeads } from "@/contexts/LeadContext";
import { Users, DollarSign, Clock, CheckCircle, CalendarClock, ListTodo } from "lucide-react";
import { DashboardCharts } from "./DashboardCharts";
import { useTask } from "@/contexts/TaskContext";
import { format, isBefore, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useState } from "react";
import { TaskDialog } from "./TaskDialog";
import { useAuth } from "@/contexts/AuthContext";

export function Dashboard() {
  const { leads } = useLeads();
  const { tasks } = useTask();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  const totalLeads = leads.length;
  const leadsEmNegociacao = leads.filter(
    (lead) => {
      const status = lead.status as string;
      return status.includes("negociacao") || status.includes("proposta");
    }
  ).length;
  const leadsFechados = leads.filter((lead) => lead.status === "fechado").length;
  const valorTotal = leads
    .filter((lead) => lead.status === "fechado")
    .reduce((acc, lead) => acc + lead.orcamento, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fadeIn bg-accent/50 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Leads cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fadeIn [animation-delay:100ms] bg-accent/50 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsEmNegociacao}</div>
            <p className="text-xs text-muted-foreground">
              Em processo de negociação
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fadeIn [animation-delay:200ms] bg-accent/50 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Fechados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsFechados}</div>
            <p className="text-xs text-muted-foreground">
              Projetos convertidos
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fadeIn [animation-delay:300ms] bg-accent/50 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(valorTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em projetos fechados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Tarefas */}
      <Card className="bg-accent/50 border-accent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium">Tarefas Pendentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ListTodo className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente</p>
                </div>
              ) : (
                [...tasks]
                  .sort((a, b) => {
                    // Primeiro, ordenar por prioridade
                    const prioridadePeso = {
                      'urgente': 0,
                      'alta': 1,
                      'media': 2,
                      'baixa': 3
                    };
                    
                    const pesoPrioridadeA = prioridadePeso[a.prioridade];
                    const pesoPrioridadeB = prioridadePeso[b.prioridade];
                    
                    if (pesoPrioridadeA !== pesoPrioridadeB) {
                      return pesoPrioridadeA - pesoPrioridadeB;
                    }
                    
                    // Se a prioridade for igual, ordenar por data
                    const dataA = a.data_limite ? new Date(a.data_limite) : new Date('9999-12-31');
                    const dataB = b.data_limite ? new Date(b.data_limite) : new Date('9999-12-31');
                    
                    return dataA.getTime() - dataB.getTime();
                  })
                  .filter(task => task.status !== 'concluido') // Filtra apenas tarefas não concluídas
                  .slice(0, 10) // Limita a 10 tarefas
                  .map(task => {
                    // Determina se a tarefa está atrasada
                    const isAtrasada = task.data_limite && isBefore(new Date(task.data_limite), new Date());
                    const isHoje = task.data_limite && isToday(new Date(task.data_limite));

                    return (
                      <div 
                        key={task.id} 
                        className={`group flex flex-col p-3 rounded-lg border transition-all hover:shadow-md ${
                          isAtrasada ? 'bg-red-500/10 border-red-500/30' :
                          task.prioridade === 'urgente' ? 'bg-red-500/10 border-red-500/30' :
                          isHoje ? 'bg-amber-500/10 border-amber-500/30' :
                          'bg-background/50 border-border hover:bg-background/70'
                        }`}
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setModalOpen(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium group-hover:text-primary transition-colors">
                              {task.responsavel === user?.id && <span className="text-[#9b87f5] mr-1">●</span>}
                              {task.titulo}
                            </h4>
                            {task.descricao && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.descricao}
                              </p>
                            )}
                          </div>
                          {task.data_limite && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-md ${
                                    isAtrasada ? 'bg-red-500/20 text-red-400' :
                                    task.prioridade === 'urgente' ? 'bg-red-500/20 text-red-400' :
                                    isHoje ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-background/50 text-muted-foreground'
                                  }`}>
                                    <CalendarClock className="h-4 w-4" />
                                    {format(new Date(task.data_limite), isHoje ? "HH:mm" : "dd/MM - HH:mm", { locale: ptBR })}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{
                                    isAtrasada ? "Tarefa atrasada" :
                                    task.prioridade === 'urgente' ? "Tarefa urgente" :
                                    isHoje ? "Vence hoje" :
                                    "Data limite"
                                  }</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={
                            task.prioridade === 'baixa' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/20' :
                            task.prioridade === 'media' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#F59E0B]/20' :
                            task.prioridade === 'alta' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/20' :
                            'bg-[#7F1D1D]/10 text-[#EF4444] border-[#7F1D1D]/30 hover:bg-[#7F1D1D]/20 font-bold'
                          }>
                            {task.prioridade.charAt(0).toUpperCase() + task.prioridade.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={
                            task.status === 'backlog' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#F59E0B]/20' :
                            task.status === 'em_andamento' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20' :
                            task.status === 'revisao' ? 'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30 hover:bg-[#EC4899]/20' :
                            task.status === 'bloqueado' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/20' :
                            'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/20'
                          }>
                            {task.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <DashboardCharts />

      <TaskDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        taskId={selectedTaskId}
      />
    </div>
  );
}