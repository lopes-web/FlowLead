import { useState } from "react";
import { useLeads } from "@/contexts/LeadContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "@/types/lead";
import { DeleteLeadDialog } from "./DeleteLeadDialog";
import { useAuth } from "@/contexts/AuthContext";
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
  Unlock
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KanbanProps {
  onEditLead: (leadId: string) => void;
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
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [draggedStatus, setDraggedStatus] = useState<LeadStatus | null>(null);
  const [showPerdidos, setShowPerdidos] = useState(false);

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

  const handleMoveToPerdido = async (leadId: string) => {
    try {
      await updateLead(leadId, { status: "perdido" });
    } catch (error) {
      console.error('Erro ao mover para perdido:', error);
    }
  };

  const handleTogglePublic = async (leadId: string, isCurrentlyPublic: boolean | null | undefined) => {
    try {
      await togglePublic(leadId, !isCurrentlyPublic);
    } catch (error) {
      console.error('Erro ao alterar visibilidade do lead:', error);
    }
  };

  // Função para renderizar o ícone de visibilidade do lead
  const renderVisibilityIcon = (lead: any) => {
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
                onClick={() => user && lead.user_id === user.id ? handleTogglePublic(lead.id, true) : null}
                disabled={!user || lead.user_id !== user.id}
              >
                <Unlock className="h-3 w-3 text-green-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {user && lead.user_id === user.id 
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
              onClick={() => handleTogglePublic(lead.id, false)}
            >
              <Lock className="h-3 w-3 text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Lead privado (clique para tornar público)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const filteredStatuses = Object.keys(statusConfig).filter(status => 
    status !== "perdido" || showPerdidos
  ) as LeadStatus[];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPerdidos(!showPerdidos)}
          className="gap-2"
        >
          {showPerdidos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPerdidos ? "Ocultar Perdidos" : "Mostrar Perdidos"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fadeIn">
        {filteredStatuses.map((status) => (
          <div
            key={status}
            className="flex flex-col gap-2 bg-[#222839] p-6 rounded-xl border border-[#2e3446] transition-colors duration-200"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className={`flex items-center gap-2 p-2 rounded-lg ${statusConfig[status].color} transition-colors duration-200`}>
              <div className="p-1 shrink-0">
                {statusConfig[status].icon}
              </div>
              <h3 className="font-medium truncate">
                {statusConfig[status].label}
              </h3>
              <Badge variant="secondary" className="ml-auto shrink-0 bg-[#1c2132] text-white border-[#2e3446]">
                {leads.filter((lead) => lead.status === status).length}
              </Badge>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {leads
                .filter((lead) => lead.status === status)
                .map((lead) => (
                  <Card
                    key={lead.id}
                    className="group cursor-move animate-fadeIn bg-[#1c2132] border-[#2e3446] hover:border-[#9b87f5] hover:shadow-md transition-all duration-200"
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id, status)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <GripHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          <h4 className="font-medium text-sm text-white">{lead.nome}</h4>
                          
                          {/* Renderiza o ícone de visibilidade */}
                          {renderVisibilityIcon(lead)}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Badge className={`w-fit ${statusConfig[status].color}`}>
                            {lead.tipo_projeto}
                          </Badge>

                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <DollarSign className="h-3 w-3 shrink-0" />
                            <span>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(lead.orcamento)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>
                              Último contato: {" "}
                              {new Date(lead.ultimo_contato).toLocaleDateString("pt-BR")}
                            </span>
                          </div>

                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {lead.tags.map(tag => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-[10px] py-0 bg-[#2e3446] text-gray-400 border-[#2e3446]"
                                >
                                  {tag.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 pt-2 border-t border-[#2e3446] mt-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-[#2e3446] text-gray-400 hover:text-white"
                            onClick={() => onEditLead(lead.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {status !== "perdido" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-[#2e3446] text-gray-400 hover:text-white"
                              onClick={() => handleMoveToPerdido(lead.id)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-[#2e3446] text-gray-400 hover:text-white"
                            onClick={() => handleDeleteClick({ id: lead.id, nome: lead.nome })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      <DeleteLeadDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        leadName={leadToDelete?.nome || ""}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}