// Definição dos tipos para o sistema de leads
export type LeadStatus =
  | "nao_contatado"
  | "primeiro_contato"
  | "proposta_enviada"
  | "em_negociacao"
  | "fechado"
  | "perdido";

export type LeadQualityTag =
  | "quente"
  | "morno"
  | "frio"
  | "prioridade_alta"
  | "prioridade_media"
  | "prioridade_baixa"
  | "decisor"
  | "influenciador";

// Interface principal do Lead
export interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  instagram: string;
  website: string;
  origem: string;
  tipo_projeto: string;
  orcamento: number;
  status: LeadStatus;
  ultimo_contato: string;
  anotacoes: string | null;
  necessidades: string | null;
  observacoes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
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