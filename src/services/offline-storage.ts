import { Lead } from '@/types/lead';
import { supabase } from '@/lib/supabase';

const LEADS_STORAGE_KEY = 'offline_leads';
const PENDING_ACTIONS_KEY = 'pending_actions';

interface PendingAction {
  type: 'add' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export const offlineStorage = {
  // Salvar leads no armazenamento local
  saveLeads(leads: Lead[]) {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  },

  // Recuperar leads do armazenamento local
  getLeads(): Lead[] {
    const leads = localStorage.getItem(LEADS_STORAGE_KEY);
    return leads ? JSON.parse(leads) : [];
  },

  // Adicionar uma ação pendente
  addPendingAction(action: PendingAction) {
    const actions = this.getPendingActions();
    actions.push(action);
    localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));
  },

  // Recuperar ações pendentes
  getPendingActions(): PendingAction[] {
    const actions = localStorage.getItem(PENDING_ACTIONS_KEY);
    return actions ? JSON.parse(actions) : [];
  },

  // Limpar ações pendentes
  clearPendingActions() {
    localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify([]));
  },

  // Sincronizar dados quando voltar online
  async syncWithServer() {
    const pendingActions = this.getPendingActions();
    
    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'add': {
            const { created_at, updated_at, tipo_projeto, ultimo_contato, ...restLead } = action.data;
            const dbLead = {
              ...restLead,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              tipoprojeto: tipo_projeto,
              ultimocontato: ultimo_contato,
            };
            await supabase.from("leads").insert([dbLead]);
            break;
          }
          case 'update': {
            const { id, created_at, updated_at, tipo_projeto, ultimo_contato, ...restLead } = action.data;
            const updates = {
              ...restLead,
              updatedat: new Date().toISOString(),
              ...(tipo_projeto && { tipoprojeto: tipo_projeto }),
              ...(ultimo_contato && { ultimocontato: ultimo_contato }),
            };
            await supabase.from("leads").update(updates).eq("id", id);
            break;
          }
          case 'delete': {
            await supabase.from("leads").delete().eq("id", action.data.id);
            break;
          }
        }
      } catch (error) {
        console.error(`Erro ao sincronizar ação ${action.type}:`, error);
        // Continua para a próxima ação mesmo se houver erro
      }
    }
    
    this.clearPendingActions();
  }
}; 