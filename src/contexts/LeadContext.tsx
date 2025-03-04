import { createContext, useContext, useEffect, useState } from "react";
import { Lead } from "@/types/lead";
import { supabase } from "@/lib/supabase";
import { useOffline } from "@/hooks/use-offline";
import { offlineStorage } from "@/services/offline-storage";

interface LeadContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id">) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  isOffline: boolean;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
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
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("updatedat", { ascending: false });

      if (error) {
        console.error("Erro ao buscar leads:", error);
        return;
      }

      const formattedLeads = data.map(lead => ({
        ...lead,
        created_at: lead.createdat,
        updated_at: lead.updatedat,
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
        createdat: created_at || new Date().toISOString(),
        updatedat: updated_at || new Date().toISOString(),
        tipoprojeto: tipo_projeto,
        ultimocontato: ultimo_contato,
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
        created_at: data[0].createdat,
        updated_at: data[0].updatedat,
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
        updatedat: new Date().toISOString(), // Sempre atualiza o updatedat
        ...(tipo_projeto && { tipoprojeto: tipo_projeto }),
        ...(ultimo_contato && { ultimocontato: ultimo_contato }),
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
      setLeads((prev: Lead[]) => prev.map((l: Lead) => l.id === id ? { ...l, ...lead, updated_at: new Date().toISOString() } : l));
      await fetchLeads();
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

      const { error } = await supabase.from("leads").delete().eq("id", id);

      if (error) {
        console.error("Erro ao deletar lead:", error);
        return;
      }

      setLeads((prevLeads: Lead[]) => prevLeads.filter((lead: Lead) => lead.id !== id));
      offlineStorage.saveLeads(leads.filter((lead: Lead) => lead.id !== id));
    } catch (error) {
      console.error("Erro ao deletar lead:", error);
    }
  }

  return (
    <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead, isOffline }}>
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