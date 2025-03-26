import React, { createContext, useContext, useEffect, useState } from "react";
import { Lead } from "@/types/lead";
import { supabase } from "@/lib/supabase";
import { useOffline } from "@/hooks/use-offline";
import { offlineStorage } from "@/services/offline-storage";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { LeadFilters } from "@/components/LeadFilters";

interface LeadContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id">) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  togglePublic: (id: string, isPublic: boolean) => Promise<void>;
  isOffline: boolean;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const isOffline = useOffline();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!isOffline) {
      fetchLeads();
      offlineStorage.syncWithServer();
    } else {
      const offlineLeads = offlineStorage.getLeads();
      setLeads(offlineLeads);
    }
  }, [isOffline, user]);

  async function fetchLeads() {
    try {
      let query = supabase
        .from("leads")
        .select("*");
      
      // Se o usuário estiver logado, busca leads públicos OU leads do usuário atual
      if (user) {
        query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
      } else {
        // Se não estiver logado, busca apenas leads públicos
        query = query.eq('is_public', true);
      }
      
      const { data, error } = await query.order("updated_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar leads:", error);
        return;
      }

      console.log("Leads carregados:", data);

      const formattedLeads = data.map(lead => ({
        ...lead,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        tipo_projeto: lead.tipoprojeto,
        ultimo_contato: lead.ultimocontato,
      }));

      setLeads(formattedLeads);
      offlineStorage.saveLeads(formattedLeads);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      const offlineLeads = offlineStorage.getLeads();
      setLeads(offlineLeads);
    }
  }

  async function addLead(lead: Omit<Lead, "id">) {
    try {
      if (isOffline) {
        const tempId = `temp_${Date.now()}`;
        const newLead = { ...lead, id: tempId };
        setLeads((prev: Lead[]) => [newLead, ...prev]);
        offlineStorage.saveLeads([newLead, ...leads]);
        offlineStorage.addPendingAction({
          type: 'add',
          data: lead,
          timestamp: Date.now()
        });
        return;
      }

      const { created_at, updated_at, tipo_projeto, ultimo_contato, ...restLead } = lead;

      const dbLead = {
        ...restLead,
        created_at: created_at || new Date().toISOString(),
        updated_at: updated_at || new Date().toISOString(),
        tipoprojeto: tipo_projeto,
        ultimocontato: ultimo_contato,
        user_id: user?.id || null,
        is_public: user ? false : true, // Se não houver usuário logado, o lead é público por padrão
        necessidades: lead.necessidades || null,
        observacoes: lead.observacoes || null
      };

      const { data, error } = await supabase
        .from("leads")
        .insert([dbLead])
        .select();

      if (error) {
        console.error("Erro ao adicionar lead:", error);
        throw error;
      }

      const formattedLead = {
        ...data[0],
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
        tipo_projeto: data[0].tipoprojeto,
        ultimo_contato: data[0].ultimocontato,
      };

      setLeads((prevLeads: Lead[]) => [formattedLead, ...prevLeads]);
      offlineStorage.saveLeads([formattedLead, ...leads]);
      
      // Adicionar notificação de novo lead
      addNotification(
        "lead_created",
        "Novo lead adicionado",
        `${user?.email || "Você"} adicionou o lead "${lead.nome}"`,
        {
          leadId: formattedLead.id,
          leadName: lead.nome,
          userId: user?.id,
          userName: user?.email
        }
      );
      
      await fetchLeads(); // Recarrega os leads após adicionar
    } catch (error) {
      console.error("Erro ao adicionar lead:", error);
      throw error; // Propaga o erro para ser tratado no componente
    }
  }

  async function updateLead(id: string, lead: Partial<Lead>) {
    try {
      // Encontrar o lead atual para comparação
      const currentLead = leads.find(l => l.id === id);
      if (!currentLead) {
        console.error("Lead não encontrado para atualização");
        return;
      }

      // Log para debug - verificar se is_public está sendo passado corretamente
      if (lead.is_public !== undefined) {
        console.log(`updateLead - alterando is_public de ${currentLead.is_public} para ${lead.is_public}`);
      }

      if (isOffline) {
        setLeads((prev: Lead[]) => prev.map((l: Lead) => l.id === id ? { ...l, ...lead } : l));
        const updatedLeads = leads.map((l: Lead) => l.id === id ? { ...l, ...lead } : l);
        offlineStorage.saveLeads(updatedLeads);
        offlineStorage.addPendingAction({
          type: 'update',
          data: { id, ...lead },
          timestamp: Date.now()
        });
        return;
      }

      const { created_at, updated_at, tipo_projeto, ultimo_contato, ...restLead } = lead;

      // Garantir que is_public seja tratado como booleano, se estiver presente
      const updates = {
        ...restLead,
        ...(tipo_projeto && { tipoprojeto: tipo_projeto }),
        ...(ultimo_contato && { ultimocontato: ultimo_contato }),
        ...(lead.is_public !== undefined && { is_public: lead.is_public === true })
      };

      console.log("Enviando atualização para o Supabase:", updates);

      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Erro ao atualizar lead:", error);
        return;
      }

      console.log("Resposta do Supabase após atualização:", data);

      // Atualiza o estado local e recarrega os leads para garantir sincronização
      setLeads((prev: Lead[]) => prev.map((l: Lead) => l.id === id ? { ...l, ...lead } : l));
      
      // Verificar se o status mudou para criar uma notificação específica
      if (lead.status && lead.status !== currentLead.status) {
        addNotification(
          "lead_status_changed",
          "Status de lead alterado",
          `${user?.email || "Você"} moveu "${currentLead.nome}" para ${statusToText(lead.status)}`,
          {
            leadId: id,
            leadName: currentLead.nome,
            userId: user?.id,
            userName: user?.email,
            userMetadata: user?.user_metadata
          }
        );
      } else {
        // Notificação genérica de atualização
        addNotification(
          "lead_updated",
          "Lead atualizado",
          `${user?.email || "Você"} atualizou o lead "${currentLead.nome}"`,
          {
            leadId: id,
            leadName: currentLead.nome,
            userId: user?.id,
            userName: user?.email,
            userMetadata: user?.user_metadata
          }
        );
      }
      
      await fetchLeads();
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
    }
  }

  // Função auxiliar para converter status em texto legível
  const statusToText = (status: string): string => {
    const statusMap: Record<string, string> = {
      nao_contatado: "Não Contatado",
      primeiro_contato: "Primeiro Contato",
      proposta_enviada: "Proposta Enviada",
      em_negociacao: "Em Negociação",
      fechado: "Fechado",
      perdido: "Perdido"
    };
    return statusMap[status] || status;
  };

  async function togglePublic(id: string, isPublic: boolean) {
    try {
      console.log(`togglePublic iniciado - ID: ${id}, tornar para isPublic: ${isPublic}`);
      
      if (isOffline) {
        console.error("Não é possível alterar a visibilidade do lead no modo offline");
        return;
      }

      // Verificar se o lead existe e se o usuário tem permissão para alterá-lo
      console.log(`Buscando lead no Supabase com ID: ${id}`);
      const { data: leadData, error: fetchError } = await supabase
        .from("leads")
        .select("user_id, is_public")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar lead:", fetchError);
        return;
      }

      console.log(`Lead encontrado:`, leadData);
      console.log(`Estado atual is_public: ${leadData.is_public}, tipo: ${typeof leadData.is_public}`);

      // Se o lead não for público e não pertencer ao usuário atual, não permitir a alteração
      if (leadData.is_public === false && leadData.user_id !== user?.id) {
        console.error(`Sem permissão: lead.is_public=${leadData.is_public}, lead.user_id=${leadData.user_id}, user.id=${user?.id}`);
        return;
      }

      // Criar updates com valores explícitos para garantir tipo correto
      const updates = {
        // Converter explicitamente para booleano
        is_public: isPublic === true,
        // Se estiver tornando privado e há usuário logado, associar ao usuário
        ...((!isPublic && user) ? { user_id: user.id } : {}),
        // Atualizar timestamp
        updated_at: new Date().toISOString()
      };
      
      console.log("Enviando atualização para o Supabase:", updates);
      
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Erro ao alterar visibilidade do lead:", error);
        return;
      }

      console.log("Resposta do Supabase após atualização:", data);
      if (data && data.length > 0) {
        console.log(`Novo estado is_public: ${data[0].is_public}, tipo: ${typeof data[0].is_public}`);
      }

      // Atualiza o estado local
      setLeads((prev: Lead[]) => {
        const updatedLeads = prev.map((l: Lead) => 
          l.id === id ? { 
            ...l, 
            is_public: isPublic === true, // Garante um booleano
            ...((!isPublic && user) ? { user_id: user.id } : {})
          } : l
        );
        const updatedLead = updatedLeads.find(l => l.id === id);
        console.log(`Estado local atualizado para o lead ${id}:`, updatedLead);
        console.log(`Novo estado local is_public: ${updatedLead?.is_public}, tipo: ${typeof updatedLead?.is_public}`);
        return updatedLeads;
      });
      
      console.log("Recarregando leads do servidor...");
      await fetchLeads(); // Recarrega os leads para garantir sincronização
      console.log("togglePublic concluído com sucesso");
    } catch (error) {
      console.error("Erro ao alterar visibilidade do lead:", error);
    }
  }

  async function deleteLead(id: string) {
    try {
      console.log("Iniciando processo de exclusão do lead:", id);
      
      // Encontrar o lead atual para a notificação
      const leadToDelete = leads.find(l => l.id === id);
      console.log("Lead encontrado para exclusão:", leadToDelete);
      
      if (isOffline) {
        console.log("Modo offline detectado, processando exclusão offline");
        setLeads((prev: Lead[]) => prev.filter((lead: Lead) => lead.id !== id));
        const filteredLeads = leads.filter((lead: Lead) => lead.id !== id);
        offlineStorage.saveLeads(filteredLeads);
        offlineStorage.addPendingAction({
          type: 'delete',
          data: { id },
          timestamp: Date.now()
        });
        return;
      }

      console.log("Verificando projetos associados ao lead...");
      // Primeiro, verifica se existe um projeto associado
      const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("lead_id", id);

      console.log("Resultado da verificação de projetos:", { projects, projectError });

      if (projectError) {
        console.error("Erro ao verificar projetos:", projectError);
        throw new Error("Erro ao verificar projetos associados ao lead.");
      }

      if (projects && projects.length > 0) {
        console.log("Projetos encontrados, não é possível excluir:", projects);
        throw new Error("Este lead não pode ser excluído pois já foi convertido em projeto.");
      }

      console.log("Executando exclusão no Supabase...");
      const { error, data } = await supabase
        .from("leads")
        .delete()
        .eq("id", id)
        .select();

      console.log("Resultado da exclusão:", { error, data });

      if (error) {
        console.error("Erro ao deletar lead:", error);
        if (error.code === '23503') {
          throw new Error("Este lead não pode ser excluído pois está vinculado a um projeto.");
        }
        throw error;
      }

      console.log("Atualizando estado local...");
      // Atualiza o estado local usando a função de atualização para garantir o estado mais recente
      setLeads((prevLeads: Lead[]) => {
        const newLeads = prevLeads.filter((lead: Lead) => lead.id !== id);
        console.log("Novo estado após exclusão:", newLeads);
        return newLeads;
      });
      
      // Atualiza o armazenamento offline com o estado atualizado
      const updatedLeads = leads.filter((lead: Lead) => lead.id !== id);
      offlineStorage.saveLeads(updatedLeads);
      
      // Adicionar notificação de exclusão
      if (leadToDelete) {
        console.log("Adicionando notificação de exclusão...");
        addNotification(
          "lead_deleted",
          "Lead excluído",
          `${user?.email || "Você"} excluiu o lead "${leadToDelete.nome}"`,
          {
            leadId: id,
            leadName: leadToDelete.nome,
            userId: user?.id,
            userName: user?.email
          }
        );
      }

      console.log("Processo de exclusão concluído com sucesso");
      await fetchLeads(); // Recarrega os leads para garantir sincronização
    } catch (error) {
      console.error("Erro ao deletar lead:", error);
      throw error;
    }
  }

  return (
    <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead, togglePublic, isOffline }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadProvider");
  }
  return context;
}

// Função para filtrar os leads com base nos filtros
export function filterLeads(leads: Lead[], filters: LeadFilters) {
  return leads.filter((lead) => {
    // Filtro de texto
    const matchesSearch = !filters.search 
      ? true 
      : lead.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.tipo_projeto.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.origem.toLowerCase().includes(filters.search.toLowerCase());

    // Filtro de status
    const matchesStatus = filters.status === "todos" || lead.status === filters.status;
    
    // Filtro de motivo de perda
    const matchesMotivo = filters.motivo_perda === "todos" || lead.motivo_perda === filters.motivo_perda;
    
    // Filtro de redesign
    let matchesRedesign = true;
    if (filters.redesign) {
      switch (filters.redesign) {
        case "com_redesign":
          matchesRedesign = lead.tags.includes("redesign") || !!lead.redesign_assigned_to;
          break;
        case "meus_redesigns":
          // Aqui precisamos do user.id do contexto de autenticação
          const userId = localStorage.getItem('userID');
          matchesRedesign = lead.redesign_assigned_to === userId;
          break;
        case "sem_redesign":
          matchesRedesign = !lead.tags.includes("redesign") && !lead.redesign_assigned_to;
          break;
        default:
          matchesRedesign = true;
      }
    }

    return matchesSearch && matchesStatus && matchesMotivo && matchesRedesign;
  });
}