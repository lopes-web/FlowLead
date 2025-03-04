export type ProjectStatus =
  | "solicitar_arquivos"
  | "infraestrutura"
  | "layout"
  | "implementacao"
  | "otimizacao"
  | "enviar_aprovacao"
  | "alteracoes_finais"
  | "concluido";

export interface Project {
  id: string;
  leadId: string;
  nome: string; // Nome do projeto (herdado do lead)
  cliente: string; // Nome do cliente (herdado do lead)
  tipo_projeto: string; // Tipo do projeto (herdado do lead)
  status: ProjectStatus;
  descricao?: string;
  prazo_entrega?: string;
  valor: number;
  arquivos_recebidos?: string[];
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithLead extends Project {
  lead: {
    nome: string;
    email: string;
    whatsapp: string;
  };
} 