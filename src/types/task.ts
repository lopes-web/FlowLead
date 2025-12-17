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

export interface ChecklistItem {
  id: string;
  task_id: string;
  content: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  status: TaskStatus;
  prioridade: TaskPriority;
  responsavel?: string;
  data_limite?: string;
  created_at: string;
  updated_at: string;
  checklist_items?: ChecklistItem[];
} 