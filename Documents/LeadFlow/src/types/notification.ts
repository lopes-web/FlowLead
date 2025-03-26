export type NotificationType = 
  | "lead_created" 
  | "lead_updated" 
  | "lead_deleted" 
  | "lead_status_changed"
  | "project_created"
  | "project_updated";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  data?: {
    leadId?: string;
    leadName?: string;
    projectId?: string;
    userId?: string;
    userName?: string;
    oldStatus?: string;
    newStatus?: string;
  };
} 