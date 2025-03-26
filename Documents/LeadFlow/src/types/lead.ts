// Definição dos tipos para o sistema de leads
export type LeadStatus =
  | "nao_contatado"
  | "primeiro_contato"
  | "proposta_enviada"
  | "em_negociacao"
  | "fechado"
  | "perdido";

export type LeadLossReason =
  | "nao_respondeu"
  | "achou_caro"
  | "sem_dinheiro"
  | "escolheu_concorrente"
  | "projeto_cancelado"
  | "fora_do_escopo"
  | "outro"
  | null;

export type LeadQualityTag =
  | "quente"
  | "morno"
  | "frio"
  | "prioridade_alta"
  | "prioridade_media"
  | "prioridade_baixa"
  | "decisor"
  | "influenciador"
  | "redesign";

// Interface principal do Lead
export interface Lead {
  id: string;
  nome: string;
  email?: string;
  whatsapp: string;
  instagram?: string;
  website?: string;
  origem: string;
  tipo_projeto: string;
  orcamento: number;
  status: LeadStatus;
  ultimo_contato: string;
  anotacoes?: string;
  tags: LeadQualityTag[];
  created_at: string;
  updated_at: string;
  is_public?: boolean;
  user_id?: string | null;
  motivo_perda?: LeadLossReason;
  detalhes_perda?: string | null;
  necessidades?: string | null;
  observacoes?: string | null;
  redesign_assigned_to?: string | null;
  redesign_deadline?: string | null;
}

export interface Project {
  id: string;
  leadId: string;
  briefing: string;
  referencias: string[];
  valor: number;
  prazoEntrega: string;
  createdAt: string;
  updatedAt: string;
}