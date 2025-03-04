import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { TimeTracking } from "@/types/timeTracking";

interface TimeTrackingContextData {
  isTracking: boolean;
  currentActivity: TimeTracking | null;
  history: TimeTracking[];
  startTracking: (activity_type: string, notes?: string) => Promise<void>;
  stopTracking: () => Promise<void>;
  fetchHistory: (data: TimeTracking[]) => void;
  deleteActivity: (id: string) => Promise<void>;
  lastUpdate: number;
}

const TimeTrackingContext = createContext<TimeTrackingContextData>({} as TimeTrackingContextData);

interface TimeTrackingProviderProps {
  children: ReactNode;
}

export function TimeTrackingProvider({ children }: TimeTrackingProviderProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<TimeTracking | null>(null);
  const [history, setHistory] = useState<TimeTracking[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    checkCurrentActivity();
  }, []);

  const checkCurrentActivity = async () => {
    const { data, error } = await supabase
      .from("time_tracking")
      .select("*")
      .is("end_time", null)
      .maybeSingle();

    if (error) {
      if (error.code !== "PGRST116") {
        console.error("Erro ao verificar atividade atual:", error);
      }
      return;
    }

    if (data) {
      setIsTracking(true);
      setCurrentActivity(data);
    }
  };

  const startTracking = async (activity_type: string, notes?: string) => {
    if (isTracking) {
      console.error("Já existe uma atividade em andamento");
      return;
    }

    const newActivity = {
      activity_type,
      notes,
      start_time: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("time_tracking")
      .insert([newActivity])
      .select()
      .single();

    if (error) {
      console.error("Erro ao iniciar tracking:", error);
      return;
    }

    setIsTracking(true);
    setCurrentActivity(data);
    setLastUpdate(Date.now());
  };

  const stopTracking = async () => {
    if (!isTracking || !currentActivity) {
      console.error("Nenhuma atividade em andamento");
      return;
    }

    const endTime = new Date();
    const startTime = new Date(currentActivity.start_time);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const { error } = await supabase
      .from("time_tracking")
      .update({
        end_time: endTime.toISOString(),
        duration,
      })
      .eq("id", currentActivity.id);

    if (error) {
      console.error("Erro ao parar tracking:", error);
      return;
    }

    setIsTracking(false);
    setCurrentActivity(null);
    setLastUpdate(Date.now());
  };

  const fetchHistory = (data: TimeTracking[]) => {
    setHistory(data);
  };

  const deleteActivity = async (id: string) => {
    const { error } = await supabase
      .from("time_tracking")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar atividade:", error);
      return;
    }

    setLastUpdate(Date.now());
  };

  return (
    <TimeTrackingContext.Provider
      value={{
        isTracking,
        currentActivity,
        history,
        startTracking,
        stopTracking,
        fetchHistory,
        deleteActivity,
        lastUpdate,
      }}
    >
      {children}
    </TimeTrackingContext.Provider>
  );
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext);

  if (!context) {
    throw new Error("useTimeTracking must be used within a TimeTrackingProvider");
  }

  return context;
} 