export type ActivityType = 'prospecting' | 'meeting' | 'proposal' | 'follow_up' | 'other';

export interface TimeTracking {
  id: string;
  activity_type: string;
  start_time: string;
  end_time?: string | null;
  duration?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeTrackingContextType {
  isTracking: boolean;
  currentActivity: TimeTracking | null;
  history: TimeTracking[];
  startTracking: (activity_type: string, notes?: string) => Promise<void>;
  stopTracking: () => Promise<void>;
  fetchHistory: (data: TimeTracking[]) => void;
  deleteActivity: (id: string) => Promise<void>;
  lastUpdate: number;
} 