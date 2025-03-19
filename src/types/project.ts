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
  nome: string;
  cliente: string;
  tipo_projeto: string;
  status: ProjectStatus;
  descricao: string | null;
  prazo_entrega: string | null;
  valor: number;
  arquivos_recebidos: string[];
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
  lead_id?: string | null;
}

export interface ProjectWithLead extends Project {
  lead: {
    nome: string;
    email: string;
    whatsapp: string;
  };
} 