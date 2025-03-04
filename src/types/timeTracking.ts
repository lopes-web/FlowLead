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
  currentTracking: TimeTracking | null;
  startTracking: (activity_type: ActivityType, notes?: string) => Promise<void>;
  stopTracking: () => Promise<void>;
  isTracking: boolean;
  lastUpdate: number;
} 