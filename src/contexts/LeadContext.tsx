import { createContext, useContext, useEffect, useState } from "react";
import { Lead } from "@/types/lead";
import { supabase } from "@/lib/supabase";
import { useOffline } from "@/hooks/use-offline";
import { offlineStorage } from "@/services/offline-storage";
import { useAuth } from "@/contexts/AuthContext";

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
      };

      const { data, error } = await supabase
        .from("leads")
        .insert([dbLead])
        .select();

      if (error) {
        console.error("Erro ao adicionar lead:", error);
        return;
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
      await fetchLeads(); // Recarrega os leads após adicionar
    } catch (error) {
      console.error("Erro ao adicionar lead:", error);
    }
  }

  async function updateLead(id: string, lead: Partial<Lead>) {
    try {
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

      const updates = {
        ...restLead,
        ...(tipo_projeto && { tipoprojeto: tipo_projeto }),
        ...(ultimo_contato && { ultimocontato: ultimo_contato })
      };

      const { error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar lead:", error);
        return;
      }

      // Atualiza o estado local e recarrega os leads para garantir sincronização
      setLeads((prev: Lead[]) => prev.map((l: Lead) => l.id === id ? { ...l, ...lead } : l));
      await fetchLeads();
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
    }
  }

  async function togglePublic(id: string, isPublic: boolean) {
    try {
      if (isOffline) {
        console.error("Não é possível alterar a visibilidade do lead no modo offline");
        return;
      }

      // Verificar se o lead existe e se o usuário tem permissão para alterá-lo
      const { data: leadData, error: fetchError } = await supabase
        .from("leads")
        .select("user_id")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar lead:", fetchError);
        return;
      }

      // Usuário só pode alterar leads sem dono (user_id = null) ou seus próprios leads
      if (leadData.user_id !== null && leadData.user_id !== user?.id) {
        console.error("Sem permissão para alterar este lead");
        return;
      }

      // Se o lead não tem dono e o usuário está logado, atribuir o lead ao usuário atual
      let updates: any = { is_public: isPublic };
      
      if (leadData.user_id === null && user) {
        updates.user_id = user.id;
        console.log("Atribuindo lead sem dono ao usuário atual:", user.id);
      }

      const { error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Erro ao alterar visibilidade do lead:", error);
        return;
      }

      // Atualiza o estado local
      setLeads((prev: Lead[]) => prev.map((l: Lead) => 
        l.id === id ? { ...l, is_public: isPublic, ...(leadData.user_id === null && user ? { user_id: user.id } : {}) } : l
      ));
      
      await fetchLeads(); // Recarrega os leads para garantir sincronização
    } catch (error) {
      console.error("Erro ao alterar visibilidade do lead:", error);
    }
  }

  async function deleteLead(id: string) {
    try {
      if (isOffline) {
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

      // Primeiro, verifica se existe um projeto associado
      const { data: projectExists, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("lead_id", id)
        .single();

      if (projectExists) {
        throw new Error("Este lead não pode ser excluído pois já foi convertido em projeto.");
      }

      const { error } = await supabase.from("leads").delete().eq("id", id);

      if (error) {
        console.error("Erro ao deletar lead:", error);
        if (error.code === '23503') {
          throw new Error("Este lead não pode ser excluído pois está vinculado a um projeto.");
        }
        throw error;
      }

      // Atualiza o estado local usando a função de atualização para garantir o estado mais recente
      setLeads((prevLeads: Lead[]) => prevLeads.filter((lead: Lead) => lead.id !== id));
      
      // Atualiza o armazenamento offline com o estado atualizado
      const updatedLeads = leads.filter((lead: Lead) => lead.id !== id);
      offlineStorage.saveLeads(updatedLeads);
      
      // Força uma nova busca dos leads para garantir sincronização com o servidor
      await fetchLeads();
    } catch (error) {
      console.error("Erro ao deletar lead:", error);
      throw error; // Propaga o erro para ser tratado no componente
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