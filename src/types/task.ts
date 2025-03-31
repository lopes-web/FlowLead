export type TaskStatus =
  | "backlog"
  | "em_andamento"
  | "revisao"
  | "bloqueado"
  | "concluido";

export type TaskPriority = 
  | "baixa" 
  | "media" 
  | "alta" 
  | "urgente";

export interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  status: TaskStatus;
  prioridade: TaskPriority;
  data_limite: string | null;
  user_id: string | null;
  projeto_id: string | null;
  responsavel: string | null;
  created_at: string;
  updated_at: string;
} 