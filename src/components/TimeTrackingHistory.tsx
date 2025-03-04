import { useEffect, useState, createContext, useContext } from "react";
import { useTimeTracking } from "@/contexts/TimeTrackingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TimeTrackingHistoryProps {
  className?: string;
}

export type DateFilter = "today" | "yesterday" | "last7days" | "last30days" | "all";
type ActivityType = "prospecting" | "meeting" | "proposal" | "follow_up" | "all";

interface FilterContextType {
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
}

export const FilterContext = createContext<FilterContextType>({
  dateFilter: "today",
  setDateFilter: () => {},
});

export function useFilter() {
  return useContext(FilterContext);
}

export function TimeTrackingHistory({ className }: TimeTrackingHistoryProps) {
  const { history, fetchHistory, lastUpdate, deleteActivity } = useTimeTracking();
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [activityFilter, setActivityFilter] = useState<ActivityType>("all");

  useEffect(() => {
    fetchFilteredHistory();
  }, [dateFilter, activityFilter, lastUpdate]);

  const fetchFilteredHistory = async () => {
    let query = supabase
      .from("time_tracking")
      .select("*")
      .order("start_time", { ascending: false });

    // Aplicar filtro de data
    const hoje = new Date();
    switch (dateFilter) {
      case "today":
        query = query
          .gte("start_time", startOfDay(hoje).toISOString())
          .lte("start_time", endOfDay(hoje).toISOString());
        break;
      case "yesterday":
        const ontem = subDays(hoje, 1);
        query = query
          .gte("start_time", startOfDay(ontem).toISOString())
          .lte("start_time", endOfDay(ontem).toISOString());
        break;
      case "last7days":
        query = query.gte("start_time", subDays(hoje, 7).toISOString());
        break;
      case "last30days":
        query = query.gte("start_time", subDays(hoje, 30).toISOString());
        break;
    }

    // Aplicar filtro de tipo de atividade
    if (activityFilter !== "all") {
      query = query.eq("activity_type", activityFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar histórico:", error);
      return;
    }

    fetchHistory(data || []);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
    
    return parts.join(" ");
  };

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      prospecting: "Prospecção",
      meeting: "Reunião",
      proposal: "Proposta",
      follow_up: "Follow-up",
    };
    return labels[type] || type;
  };

  return (
    <FilterContext.Provider value={{ dateFilter, setDateFilter }}>
      <Card className={`bg-[#222839] border-[#2e3446] ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-white">
              Histórico de Atividades
            </CardTitle>
            <div className="flex gap-2">
              <Select
                value={dateFilter}
                onValueChange={(value) => setDateFilter(value as DateFilter)}
              >
                <SelectTrigger className="w-[180px] bg-[#1c2132] border-[#2e3446] text-white">
                  <SelectValue placeholder="Filtrar por data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="yesterday">Ontem</SelectItem>
                  <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={activityFilter}
                onValueChange={(value) => setActivityFilter(value as ActivityType)}
              >
                <SelectTrigger className="w-[180px] bg-[#1c2132] border-[#2e3446] text-white">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas atividades</SelectItem>
                  <SelectItem value="prospecting">Prospecção</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="proposal">Proposta</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-[#1c2132] scrollbar-thumb-[#3e4456] hover:scrollbar-thumb-[#4e5466] scrollbar-thumb-rounded-full scrollbar-track-rounded-full pr-4">
            {history.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-lg bg-[#1c2132] border border-[#2e3446]"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    {getActivityLabel(activity.activity_type)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(activity.start_time), "dd 'de' MMMM 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-white">
                    {formatDuration(activity.duration || 0)}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1c2132] border-[#2e3446]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-[#222839] text-white hover:bg-[#2a324b] border-[#2e3446]">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteActivity(activity.id)}
                          className="bg-red-500 hover:bg-red-600 text-white border-none"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </FilterContext.Provider>
  );
} 