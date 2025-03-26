import { useState, useMemo, useEffect } from "react";
import { useLeads } from "@/contexts/LeadContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "@/types/lead";
import { DeleteLeadDialog } from "./DeleteLeadDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  MessageSquare,
  Send,
  CheckCircle2,
  Archive,
  UserPlus,
  GripHorizontal,
  Inbox,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Clock,
  Palette
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LeadFilters as LeadFiltersComponent, type LeadFilters } from "./LeadFilters";
import { LossReasonDialog } from "./LossReasonDialog";
import { RedesignAssignModal } from "./RedesignAssignModal";
import { CountdownTimer } from "./CountdownTimer";
import { supabase } from "@/lib/supabase";

interface KanbanProps {
  onEditLead: (id: string) => void;
}

const statusConfig: Record<LeadStatus, { label: string; color: string; icon: React.ReactNode }> = {
  nao_contatado: {
    label: "Não Contatado",
    color: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#F59E0B]/20",
    icon: <Inbox className="h-4 w-4" />
  },
  primeiro_contato: {
    label: "Primeiro Contato",
    color: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20",
    icon: <UserPlus className="h-4 w-4" />
  },
  proposta_enviada: {
    label: "Proposta Enviada",
    color: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30 hover:bg-[#EC4899]/20",
    icon: <Send className="h-4 w-4" />
  },
  em_negociacao: {
    label: "Em Negociação",
    color: "bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/30 hover:bg-[#14B8A6]/20",
    icon: <MessageSquare className="h-4 w-4" />
  },
  fechado: {
    label: "Fechado",
    color: "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30 hover:bg-[#06B6D4]/20",
    icon: <CheckCircle2 className="h-4 w-4" />
  },
  perdido: {
    label: "Perdido",
    color: "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/30 hover:bg-[#6B7280]/20",
    icon: <Archive className="h-4 w-4" />
  },
};

export function Kanban({ onEditLead }: KanbanProps) {
  const { leads, updateLead, deleteLead, togglePublic } = useLeads();
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lossReasonDialogOpen, setLossReasonDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [leadToArchive, setLeadToArchive] = useState<{ id: string; nome: string } | null>(null);
  const [draggedStatus, setDraggedStatus] = useState<LeadStatus | null>(null);
  const [showPerdidos, setShowPerdidos] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>({
    search: "",
    status: "todos",
    motivo_perda: "todos",
    redesign: "todos"
  });
  
  // Estado para o modal de atribuição de redesign
  const [redesignModalOpen, setRedesignModalOpen] = useState(false);
  const [leadForRedesign, setLeadForRedesign] = useState<{ id: string; nome: string } | null>(null);

  // Adicione essas funções para gerenciar os usuários atribuídos ao redesign
  const [userCache, setUserCache] = useState<Record<string, { name: string, avatar_url?: string }>>({});

  // Buscar informações do usuário pelo ID
  const getUserInfo = async (userId: string) => {
    if (userCache[userId]) {
      return userCache[userId];
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, raw_user_meta_data')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const name = data?.raw_user_meta_data?.name || data?.email?.split('@')[0] || 'Usuário';
      const avatar_url = data?.raw_user_meta_data?.avatar_url;
      
      // Salvar no cache para não precisar buscar novamente
      setUserCache(prev => ({
        ...prev,
        [userId]: { name, avatar_url }
      }));
      
      return { name, avatar_url };
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
      return { name: "Usuário" };
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = lead.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.tipo_projeto.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === "todos" || lead.status === filters.status;
      
      const matchesMotivo = filters.motivo_perda === "todos" || lead.motivo_perda === filters.motivo_perda;

      return matchesSearch && matchesStatus && matchesMotivo;
    });
  }, [leads, filters]);

  const handleDragStart = (e: React.DragEvent, leadId: string, status: LeadStatus) => {
    e.dataTransfer.setData("text/plain", leadId);
    setDraggedStatus(status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-[#1c2132]');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-[#1c2132]');
  };

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-[#1c2132]');
    const leadId = e.dataTransfer.getData("text/plain");
    
    if (draggedStatus === newStatus) return;
    
    try {
      await updateLead(leadId, { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
    
    setDraggedStatus(null);
  };

  const handleDeleteClick = (lead: { id: string; nome: string }) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (leadToDelete) {
      await deleteLead(leadToDelete.id);
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleMoveToPerdido = (lead: { id: string; nome: string }) => {
    setLeadToArchive(lead);
    setLossReasonDialogOpen(true);
  };

  const handleConfirmArchive = async (data: { motivo_perda: LeadLossReason; detalhes_perda: string }) => {
    if (leadToArchive) {
      try {
        await updateLead(leadToArchive.id, {
          status: "perdido",
          motivo_perda: data.motivo_perda,
          detalhes_perda: data.detalhes_perda,
        });
        setLossReasonDialogOpen(false);
        setLeadToArchive(null);
      } catch (error) {
        console.error('Erro ao mover para perdido:', error);
      }
    }
  };

  const handleTogglePublic = async (leadId: string, newPublicState: boolean) => {
    try {
      console.log(`handleTogglePublic - leadId: ${leadId}, novo estado desejado: ${newPublicState}, tipo: ${typeof newPublicState}`);
      
      // Encontra o lead no estado local para debug
      const leadBeforeUpdate = leads.find((l) => l.id === leadId);
      
      // O estado atual é crucial para entender o problema
      const currentState = leadBeforeUpdate?.is_public === true;
      
      console.log(`Estado atual do lead antes da atualização:`, {
        id: leadId,
        is_public: currentState,
        is_public_raw: leadBeforeUpdate?.is_public,
        tipo: typeof leadBeforeUpdate?.is_public,
        user_id: leadBeforeUpdate?.user_id
      });

      // Verificar se estamos realmente alternando o estado
      if (currentState === newPublicState) {
        console.warn(`Estado não vai mudar - atual: ${currentState}, desejado: ${newPublicState}`);
      }

      // Forçar o booleano explícito aqui também é importante
      await togglePublic(leadId, newPublicState === true);
      
      // Verificar se o estado foi atualizado corretamente depois de um tempo
      setTimeout(() => {
        const leadAfterUpdate = leads.find((l) => l.id === leadId);
        const newState = leadAfterUpdate?.is_public === true;
        
        console.log(`Estado do lead após atualização:`, {
          id: leadId,
          is_public: newState,
          is_public_raw: leadAfterUpdate?.is_public,
          tipo: typeof leadAfterUpdate?.is_public,
          user_id: leadAfterUpdate?.user_id
        });
        
        // Verificar se o estado realmente mudou como esperado
        if (currentState === newState) {
          console.error("❌ O estado não mudou como esperado!");
        } else {
          console.log("✅ O estado foi alterado com sucesso!");
        }
      }, 1000); // Aumentamos o tempo para garantir que fetchLeads tenha terminado
    } catch (error) {
      console.error('Erro ao alterar visibilidade do lead:', error);
    }
  };

  // Função para gerar as iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Função para gerar uma cor de fundo baseada no nome
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-[#F59E0B]",
      "bg-[#8B5CF6]",
      "bg-[#EC4899]",
      "bg-[#14B8A6]",
      "bg-[#06B6D4]",
      "bg-[#3B82F6]"
    ];
    
    if (!name) return colors[0];
    
    // Gera um índice baseado na soma dos códigos ASCII dos caracteres
    const sumChars = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[sumChars % colors.length];
  };

  // Função para renderizar o ícone de visibilidade do lead
  const renderVisibilityIcon = (lead: any) => {
    // Verificar quem pode editar este lead
    // Um lead público pode ser editado por qualquer usuário
    // Um lead privado só pode ser editado pelo seu proprietário
    const canEdit = lead.is_public || (user && lead.user_id === user.id);
    
    // Função para impedir a propagação do evento de drag
    const preventDrag = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
    };
    
    // Se o lead for público, mostra o ícone de desbloqueado
    if (lead.is_public) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-auto hover:bg-[#2e3446] text-gray-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (canEdit) handleTogglePublic(lead.id, false);
                }}
                onMouseDown={preventDrag}
                onTouchStart={preventDrag}
                disabled={!canEdit}
                draggable="false"
              >
                <Unlock className="h-3 w-3 text-green-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {canEdit 
                ? "Lead público (clique para tornar privado)" 
                : "Lead público compartilhado"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Se o lead for privado, mostra o ícone de bloqueado
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-auto hover:bg-[#2e3446] text-gray-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (canEdit) handleTogglePublic(lead.id, true);
              }}
              onMouseDown={preventDrag}
              onTouchStart={preventDrag}
              disabled={!canEdit}
              draggable="false"
            >
              <Lock className="h-3 w-3 text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {canEdit 
              ? "Lead privado (clique para tornar público)"
              : "Lead privado (sem permissão para editar)"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const filteredStatuses = Object.keys(statusConfig).filter(status => 
    status !== "perdido" || showPerdidos
  ) as LeadStatus[];

  // Adicionar função para abrir o modal de redesign
  const handleRedesignClick = (lead: { id: string; nome: string }) => {
    setLeadForRedesign(lead);
    setRedesignModalOpen(true);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Leads ({filteredLeads.length})</h2>
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full"
                    onClick={() => setShowPerdidos(!showPerdidos)}
                  >
                    {showPerdidos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showPerdidos ? "Ocultar perdidos" : "Mostrar perdidos"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <LeadFiltersComponent
          filters={filters}
          onChange={setFilters}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          if (status === "perdido" && !showPerdidos) return null;
          
          const leadsInColumn = filteredLeads.filter(lead => lead.status === status);
          
          return (
            <div
              key={status}
              className="flex flex-col space-y-2"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status as LeadStatus)}
            >
              <div className="flex items-center justify-between p-2 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center gap-1.5">
                    {config.icon}
                    <span className="font-medium">{config.label}</span>
                  </span>
                  <Badge variant="outline" className="bg-[#1c2132]/50">
                    {leadsInColumn.length}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                {leadsInColumn.map(lead => (
                  <Card
                    key={lead.id}
                    className="bg-[#1c2132] border-[#2e3446] shadow-md hover:border-[#9b87f5]/40 transition-all duration-200"
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id, status as LeadStatus)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-base font-medium truncate max-w-[70%]">
                          {lead.nome}
                        </div>

                        <div className="flex space-x-1">
                          {/* Indicador de visibilidade */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Garantir que o estado atual seja um booleano
                                    const isCurrentlyPublic = lead.is_public === true;
                                    // Queremos alterar para o oposto do estado atual
                                    const newState = !isCurrentlyPublic;
                                    console.log(`Alterando visibilidade do lead ${lead.id}, estado atual: ${isCurrentlyPublic}, mudando para: ${newState}`);
                                    // Chamar a função com o novo estado explícito
                                    handleTogglePublic(lead.id, newState);
                                  }}
                                >
                                  {lead.is_public === true ? 
                                    <Unlock className="h-3.5 w-3.5 text-green-400" /> : 
                                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                                  }
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{lead.is_public === true ? "Tornar privado" : "Tornar público"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {/* Botão de redesign */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRedesignClick({
                                      id: lead.id, 
                                      nome: lead.nome
                                    });
                                  }}
                                >
                                  <Palette className={`h-3.5 w-3.5 ${lead.redesign_assigned_to ? 'text-[#9b87f5]' : 'text-gray-400'}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {lead.redesign_assigned_to 
                                    ? (lead.redesign_assigned_to === user?.id 
                                        ? "Gerenciar meu redesign" 
                                        : "Gerenciar redesign atribuído") 
                                    : "Atribuir redesign"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {/* Botão de edição */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditLead(lead.id);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                          </Button>
                          
                          {/* Botão de exclusão */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(lead);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-gray-400 mb-3 max-w-full overflow-hidden">
                        <div className="flex items-center mr-2 shrink-0">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center truncate">
                          <DollarSign className="h-3 w-3 mr-1 shrink-0" />
                          <span className="truncate">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.orcamento)}
                          </span>
                        </div>
                      </div>

                      {/* Redesign badge - mostrar apenas se tiver tag redesign ou responsável atribuído */}
                      {(lead.tags?.includes("redesign") || lead.redesign_assigned_to) && (
                        <div className="mb-2 flex flex-wrap gap-1 items-center">
                          <Badge 
                            className="bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30 hover:bg-[#9b87f5]/30"
                          >
                            Redesign
                          </Badge>
                          
                          {lead.redesign_assigned_to && (
                            <div className="flex items-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="ml-1">
                                      <Avatar className={`h-5 w-5 ${lead.redesign_assigned_to === user?.id ? 'ring-2 ring-[#9b87f5]' : ''}`}>
                                        <AvatarImage src={userCache[lead.redesign_assigned_to]?.avatar_url || ""} />
                                        <AvatarFallback className={`${getAvatarColor(lead.redesign_assigned_to)} text-[10px]`}>
                                          {userCache[lead.redesign_assigned_to]?.name?.substring(0, 2).toUpperCase() || 'RD'}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1">
                                      <p className="font-medium">
                                        {lead.redesign_assigned_to === user?.id ? 
                                          'Redesign atribuído a mim' : 
                                          `Atribuído a ${userCache[lead.redesign_assigned_to]?.name || 'outro usuário'}`
                                        }
                                      </p>
                                      {lead.redesign_deadline && (
                                        <p className="text-xs flex items-center text-gray-300">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          Prazo: {new Date(lead.redesign_deadline).toLocaleDateString('pt-BR')}
                                        </p>
                                      )}
                                      {lead.redesign_deadline && (
                                        <CountdownTimer 
                                          deadline={new Date(lead.redesign_deadline)} 
                                          isMyTask={lead.redesign_assigned_to === user?.id}
                                        />
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-1">
                        {lead.tags.filter(tag => tag !== "redesign").map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className={getTagColor(tag)}
                          >
                            {tag.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>

                      {/* Mostrar dados do usuário proprietário apenas se o lead não for público */}
                      {(!lead.is_public && lead.user_id) && (
                        <div className="mt-2 flex items-center">
                          <div className="flex text-xs text-gray-400 items-center">
                            <Avatar className="h-4 w-4 mr-1">
                              <AvatarImage src={""} />
                              <AvatarFallback className={`${getAvatarColor(lead.user_id)} text-[10px]`}>
                                {getInitials(lead.user_id)}
                              </AvatarFallback>
                            </Avatar>
                            Privado
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {leadsInColumn.length === 0 && (
                  <div className="flex justify-center items-center p-4 border border-dashed border-[#2e3446] rounded-lg bg-[#1c2132]/50 h-20">
                    <span className="text-sm text-gray-500">Nenhum lead</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Diálogos de confirmação */}
      <DeleteLeadDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        leadNome={leadToDelete?.nome || ""}
        onConfirm={handleConfirmDelete}
      />
      
      <LossReasonDialog
        open={lossReasonDialogOpen}
        onOpenChange={setLossReasonDialogOpen}
        onConfirm={handleConfirmArchive}
      />
      
      {/* Modal de atribuição de redesign */}
      {leadForRedesign && (
        <RedesignAssignModal
          open={redesignModalOpen}
          onOpenChange={setRedesignModalOpen}
          leadId={leadForRedesign.id}
          leadName={leadForRedesign.nome}
        />
      )}
    </div>
  );
}