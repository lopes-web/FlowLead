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
  | "influenciador"
  | "redesign";

// Interface principal do Lead
export interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  instagram: string;
  website: string;
  origem: string;
  tipoprojeto: string;
  orcamento: number;
  status: LeadStatus;
  ultimocontato: string;
  anotacoes: string;
  necessidades: string;
  observacoes: string;
  ideias: string;
  tags: LeadQualityTag[];
  createdat: string;
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