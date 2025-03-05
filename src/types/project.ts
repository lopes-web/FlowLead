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
  descricao: string;
  prazo_entrega?: string;
  valor: number;
  arquivos_recebidos?: string[];
  observacoes: string;
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