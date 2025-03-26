import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Lead, LeadQualityTag } from "@/types/lead";
import { supabase } from "@/lib/supabase";
import { useOffline } from "@/hooks/use-offline";
import { offlineStorage } from "@/services/offline-storage";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { LeadFilters } from "@/components/LeadFilters";
import { toast } from "react-hot-toast";

interface LeadContextType {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  addLead: (lead: Omit<Lead, "id">) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  togglePublic: (id: string, isPublic: boolean) => Promise<void>;
  assignRedesign: (id: string, userId: string | null, deadline: string | null) => Promise<void>;
  isOffline: boolean;
}

// Criando um tipo para o contexto de auth que corresponde à interface no AuthContext
interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
}

// Criando um tipo para o contexto de notificações que corresponde à interface no NotificationContext
interface NotificationContextType {
  addNotification: (type: string, title: string, message: string, data?: any) => Promise<void>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const isOffline = useOffline();
  const { user } = useAuth() as AuthContextType;
  const { addNotification } = useNotifications() as NotificationContextType;

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

      const formattedLeads = data.map((lead: any) => ({
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
        const newLead = { ...lead, id: tempId } as Lead;
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
      } as Lead;

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
      const currentLead = leads.find((l: Lead) => l.id === id);
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
      console.log(`togglePublic iniciado - leadId: ${id}, desejado: ${isPublic}, tipo: ${typeof isPublic}`);
      
      // Forçar o tipo booleano para evitar problemas com null ou undefined
      const newPublicState = isPublic === true;
      console.log(`Novo estado desejado (normalizado): ${newPublicState}, tipo: ${typeof newPublicState}`);
      
      if (isOffline) {
        console.log("Modo offline detectado, processando alteração offline...");
        setLeads((prev: Lead[]) => prev.map((l: Lead) => 
          l.id === id ? { ...l, is_public: newPublicState } : l
        ));
        
        const updatedLeads = leads.map((l: Lead) => 
          l.id === id ? { ...l, is_public: newPublicState } : l
        );
        
        offlineStorage.saveLeads(updatedLeads);
        offlineStorage.addPendingAction({
          type: 'update',
          data: { id, is_public: newPublicState },
          timestamp: Date.now()
        });
        return;
      }

      // Buscar dados atuais do lead do Supabase para verificar permissões
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .select("user_id, is_public")
        .eq("id", id)
        .single();

      if (leadError) {
        console.error("Erro ao buscar informações do lead:", leadError);
        toast.error("Erro ao buscar informações do lead.");
        return;
      }

      console.log(`Lead encontrado:`, leadData);
      console.log(`Estado atual is_public: ${leadData.is_public}, tipo: ${typeof leadData.is_public}`);

      // Se o lead não for público e não pertencer ao usuário atual, não permitir a alteração
      if (leadData.is_public === false && leadData.user_id !== user?.id) {
        console.error(`Sem permissão: lead.is_public=${leadData.is_public}, lead.user_id=${leadData.user_id}, user.id=${user?.id}`);
        toast.error("Você não tem permissão para alterar este lead.");
        return;
      }

      // Criar updates com valores explícitos para garantir tipo correto
      const updates = {
        // Aqui é crucial usar newPublicState, não isPublic, para garantir o valor correto
        is_public: newPublicState,
        // Se estiver tornando privado e há usuário logado, associar ao usuário
        ...((!newPublicState && user) ? { user_id: user.id } : {}),
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
        toast.error("Erro ao alterar visibilidade do lead. Por favor, tente novamente.");
        return;
      }

      console.log("Resposta do Supabase após atualização:", data);
      if (data && data.length > 0) {
        console.log(`Novo estado is_public: ${data[0].is_public}, tipo: ${typeof data[0].is_public}`);
      }

      // Atualiza o estado local primeiramente
      setLeads((prev: Lead[]) => {
        const updatedLeads = prev.map((l: Lead) => 
          l.id === id ? { 
            ...l, 
            is_public: newPublicState, 
            ...((!newPublicState && user) ? { user_id: user.id } : {})
          } : l
        );
        
        const updatedLead = updatedLeads.find((l: Lead) => l.id === id);
        console.log(`Estado local atualizado para o lead ${id}:`, updatedLead);
        console.log(`Novo estado local is_public: ${updatedLead?.is_public}, tipo: ${typeof updatedLead?.is_public}`);
        
        return updatedLeads;
      });
      
      // Indicar ao usuário que a operação foi bem-sucedida
      toast.success(`Lead ${newPublicState ? "público" : "privado"} atualizado com sucesso.`);
      
      // Recarregar leads do servidor para garantir sincronização completa
      console.log("Recarregando leads do servidor...");
      await fetchLeads();
      console.log("togglePublic concluído com sucesso");
    } catch (error) {
      console.error("Erro ao alterar visibilidade do lead:", error);
      toast.error("Ocorreu um erro ao alterar a visibilidade do lead.");
    }
  }

  async function deleteLead(id: string) {
    try {
      console.log("Iniciando processo de exclusão do lead:", id);
      
      // Encontrar o lead atual para a notificação
      const leadToDelete = leads.find((l: Lead) => l.id === id);
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

  async function assignRedesign(id: string, userId: string | null, deadline: string | null) {
    try {
      console.log(`Atribuindo redesign para o lead ${id} ao usuário ${userId || 'nenhum'}`);
      
      // Encontrar o lead atual para referência
      const currentLead = leads.find((l: Lead) => l.id === id);
      if (!currentLead) {
        console.error("Lead não encontrado para atribuir redesign");
        toast.error("Lead não encontrado.");
        return;
      }
      
      if (isOffline) {
        // Atualizar o estado local
        setLeads((prev: Lead[]) => prev.map((l: Lead) => 
          l.id === id 
            ? { 
                ...l, 
                redesign_assigned_to: userId, 
                redesign_deadline: deadline,
                // Se estiver atribuindo um redesign, adiciona a tag "redesign" automaticamente
                tags: userId 
                  ? (l.tags.includes("redesign" as LeadQualityTag) 
                      ? l.tags 
                      : [...l.tags, "redesign" as LeadQualityTag]) 
                  : l.tags
              } 
            : l
        ));
        
        // Atualizar o armazenamento offline
        const updatedLeads = leads.map((l: Lead) => 
          l.id === id 
            ? { 
                ...l, 
                redesign_assigned_to: userId, 
                redesign_deadline: deadline,
                tags: userId 
                  ? (l.tags.includes("redesign" as LeadQualityTag) 
                      ? l.tags 
                      : [...l.tags, "redesign" as LeadQualityTag]) 
                  : l.tags
              } 
            : l
        );
        
        offlineStorage.saveLeads(updatedLeads);
        offlineStorage.addPendingAction({
          type: 'update',
          data: { 
            id, 
            redesign_assigned_to: userId, 
            redesign_deadline: deadline,
            tags: userId 
              ? (currentLead.tags.includes("redesign" as LeadQualityTag) 
                  ? currentLead.tags 
                  : [...currentLead.tags, "redesign" as LeadQualityTag]) 
              : currentLead.tags
          },
          timestamp: Date.now()
        });
        
        return;
      }
      
      // Criar o objeto de atualizações
      const updates: Record<string, any> = {
        redesign_assigned_to: userId,
        redesign_deadline: deadline,
        updated_at: new Date().toISOString()
      };
      
      // Se estiver atribuindo um redesign, adiciona a tag "redesign" automaticamente
      if (userId && !currentLead.tags.includes("redesign" as LeadQualityTag)) {
        updates.tags = [...currentLead.tags, "redesign" as LeadQualityTag];
      }
      
      console.log("Enviando atualizações para o Supabase:", updates);
      
      // Enviar atualização para o Supabase
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select();
      
      if (error) {
        console.error("Erro ao atribuir redesign:", error);
        toast.error("Erro ao atribuir redesign. Por favor, tente novamente.");
        return;
      }
      
      console.log("Resposta do Supabase após atribuição de redesign:", data);
      
      // Atualizar o estado local
      setLeads((prev: Lead[]) => prev.map((l: Lead) => 
        l.id === id 
          ? { 
              ...l, 
              redesign_assigned_to: userId, 
              redesign_deadline: deadline,
              tags: userId 
                ? (l.tags.includes("redesign" as LeadQualityTag) 
                    ? l.tags 
                    : [...l.tags, "redesign" as LeadQualityTag]) 
                : l.tags
            } 
          : l
      ));
      
      // Obter informações dos usuários para as notificações
      let assignedUserName = "outro designer";
      let assignerName = user?.email || "Alguém";
      
      try {
        if (userId) {
          const { data: userData } = await supabase
            .from("users")
            .select("email, raw_user_meta_data")
            .eq("id", userId)
            .single();
          
          if (userData) {
            assignedUserName = userData.raw_user_meta_data?.name || userData.email || "outro designer";
          }
        }
        
        assignerName = user?.user_metadata?.name || user?.email || "Alguém";
      } catch (err) {
        console.error("Erro ao buscar informações de usuário para notificação:", err);
      }
      
      // Determinar o tipo de notificação e mensagem
      let notificationType = "redesign_assigned";
      let notificationTitle = "Redesign atribuído";
      let notificationMessage = "";
      
      if (userId) {
        if (userId === user?.id) {
          // Usuário está atribuindo a si mesmo
          notificationType = "redesign_self_assigned";
          notificationMessage = `${assignerName} assumiu o redesign de "${currentLead.nome}"`;
        } else {
          // Usuário está atribuindo a outro
          notificationMessage = `${assignerName} atribuiu o redesign de "${currentLead.nome}" para ${assignedUserName}`;
        }
      } else if (currentLead.redesign_assigned_to) {
        // Está removendo a atribuição
        notificationType = "redesign_unassigned";
        notificationTitle = "Redesign removido";
        notificationMessage = `${assignerName} removeu a atribuição de redesign de "${currentLead.nome}"`;
      } else {
        // Só está atualizando o prazo, sem mudar a atribuição
        notificationType = "redesign_updated";
        notificationTitle = "Redesign atualizado";
        notificationMessage = `${assignerName} atualizou o redesign de "${currentLead.nome}"`;
      }
      
      // Adicionar notificação sobre a atribuição de redesign
      addNotification(
        notificationType,
        notificationTitle,
        notificationMessage,
        {
          leadId: id,
          leadName: currentLead.nome,
          userId: user?.id,
          assignedToId: userId,
          deadline: deadline
        }
      );
      
      // Mostrar toast de confirmação
      if (userId) {
        if (userId === user?.id) {
          toast.success(`Você assumiu o redesign de "${currentLead.nome}"`);
        } else {
          toast.success(`Redesign de "${currentLead.nome}" atribuído para ${assignedUserName}`);
        }
      } else {
        toast.success(`Atribuição de redesign removida de "${currentLead.nome}"`);
      }
      
      // Recarregar os leads para garantir sincronização
      await fetchLeads();
      
    } catch (error) {
      console.error("Erro ao atribuir redesign:", error);
      toast.error("Ocorreu um erro ao atribuir o redesign.");
    }
  }

  return (
    <LeadContext.Provider value={{ leads, setLeads, addLead, updateLead, deleteLead, togglePublic, assignRedesign, isOffline }}>
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