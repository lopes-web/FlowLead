import { createContext, useContext, useEffect, useState } from "react";
import { Lead, LeadStatus, LeadQualityTag } from "@/types/lead";
import { supabase } from "@/lib/supabase";
import { useOffline } from "@/hooks/use-offline";
import { offlineStorage } from "@/services/offline-storage";

interface LeadContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id">) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  isOffline: boolean;
  isLoading: boolean;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isOffline = useOffline();

  useEffect(() => {
    if (!isOffline) {
      fetchLeads();
      offlineStorage.syncWithServer();
    } else {
      const offlineLeads = offlineStorage.getLeads();
      setLeads(offlineLeads);
    }
  }, [isOffline]);

  async function fetchLeads() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("id, nome, email, whatsapp, instagram, website, origem, tipoprojeto, orcamento, status, ultimocontato, anotacoes, tags, created_at, updated_at")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar leads:", error);
        return;
      }

      setLeads(data || []);
      offlineStorage.saveLeads(data || []);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      const offlineLeads = offlineStorage.getLeads();
      setLeads(offlineLeads);
    } finally {
      setIsLoading(false);
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

      const now = new Date().toISOString();
      const { id: _, created_at, updated_at, ...restLead } = lead as any;

      const dbLead = {
        ...restLead,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase
        .from("leads")
        .insert([dbLead])
        .select();

      if (error) {
        console.error("Erro ao adicionar lead:", error);
        return;
      }

      setLeads((prevLeads: Lead[]) => [data[0], ...prevLeads]);
      offlineStorage.saveLeads([data[0], ...leads]);
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

      // Se estiver atualizando apenas o status (caso do Kanban)
      if (Object.keys(lead).length === 1 && 'status' in lead) {
        const { error } = await supabase
          .from("leads")
          .update({
            status: lead.status,
            updated_at: new Date().toISOString()
          })
          .eq("id", id);

        if (error) {
          console.error("Erro ao atualizar lead:", error);
          return;
        }
      } else {
        // Remove campos que não devem ser enviados ao banco
        const { id: _, created_at, updated_at, ...cleanLead } = lead as any;

        const updates = {
          ...cleanLead,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("leads")
          .update(updates)
          .eq("id", id);

        if (error) {
          console.error("Erro ao atualizar lead:", error);
          return;
        }
      }

      // Atualiza o estado local
      setLeads((prev: Lead[]) => 
        prev.map((l: Lead) => 
          l.id === id 
            ? { 
                ...l, 
                ...lead,
                updated_at: new Date().toISOString() 
              } 
            : l
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
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

      setLeads((prevLeads: Lead[]) => prevLeads.filter((lead: Lead) => lead.id !== id));
      offlineStorage.saveLeads(leads.filter((lead: Lead) => lead.id !== id));
    } catch (error) {
      console.error("Erro ao deletar lead:", error);
      throw error; // Propaga o erro para ser tratado no componente
    }
  }

  return (
    <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead, isOffline, isLoading }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error("useLeads must be used within a LeadProvider");
  }
  return context;
}