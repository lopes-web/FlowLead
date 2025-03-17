import { useEffect, useState } from "react";
import { useTimeTracking } from "@/contexts/TimeTrackingContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, Zap, PartyPopper } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { useFilter } from "@/components/TimeTrackingHistory";
import { cn } from "@/lib/utils";

interface DailyStats {
  prospeccoesHoje: number;
  tempoTotalHoje: number;
  metaDiaria: number;
  streak: number;
}

export function DailyGoals() {
  const [stats, setStats] = useState<DailyStats>({
    prospeccoesHoje: 0,
    tempoTotalHoje: 0,
    metaDiaria: 10, // Meta fixa de 10 leads por dia
    streak: 0,
  });

  const [showReward, setShowReward] = useState(false);
  const { lastUpdate } = useTimeTracking();
  const { dateFilter } = useFilter();

  useEffect(() => {
    calcularEstatisticas();
  }, [lastUpdate, dateFilter]);

  // Efeito para mostrar a recompensa quando atingir a meta
  useEffect(() => {
    if (stats.prospeccoesHoje >= stats.metaDiaria) {
      setShowReward(true);
      const timer = setTimeout(() => setShowReward(false), 3000); // Esconde após 3 segundos
      return () => clearTimeout(timer);
    }
  }, [stats.prospeccoesHoje, stats.metaDiaria]);

  const calcularEstatisticas = async () => {
    const hoje = new Date();
    let inicioPeriodo: Date;
    let fimPeriodo: Date;

    // Definir período baseado no filtro
    switch (dateFilter) {
      case "today":
        inicioPeriodo = startOfDay(hoje);
        fimPeriodo = endOfDay(hoje);
        break;
      case "yesterday":
        const ontem = subDays(hoje, 1);
        inicioPeriodo = startOfDay(ontem);
        fimPeriodo = endOfDay(ontem);
        break;
      case "last7days":
        inicioPeriodo = startOfDay(subDays(hoje, 7));
        fimPeriodo = endOfDay(hoje);
        break;
      case "last30days":
        inicioPeriodo = startOfDay(subDays(hoje, 30));
        fimPeriodo = endOfDay(hoje);
        break;
      default:
        inicioPeriodo = startOfDay(hoje);
        fimPeriodo = endOfDay(hoje);
    }
    
    try {
      // Buscar leads adicionados no período (meta diária)
      const { data: leadsAdicionados, error: errorLeads } = await supabase
        .from("leads")
        .select("id")
        .gte("created_at", inicioPeriodo.toISOString())
        .lte("created_at", fimPeriodo.toISOString());

      if (errorLeads) {
        console.error("Erro ao buscar leads:", errorLeads);
        return;
      }

      // Buscar tempo total de prospecção do período
      const { data: atividadesHoje, error: errorAtividades } = await supabase
        .from("time_tracking")
        .select("*")
        .eq("activity_type", "prospecting")
        .gte("start_time", inicioPeriodo.toISOString())
        .lte("start_time", fimPeriodo.toISOString());

      if (errorAtividades) {
        console.error("Erro ao buscar atividades:", errorAtividades);
        return;
      }

      // Calcular tempo total em segundos
      const tempoTotal = atividadesHoje?.reduce((total, atividade) => {
        if (!atividade.duration && atividade.start_time) {
          // Se a atividade ainda está em andamento, calcular o tempo até agora
          const startTime = new Date(atividade.start_time).getTime();
          const endTime = atividade.end_time ? new Date(atividade.end_time).getTime() : Date.now();
          return total + Math.floor((endTime - startTime) / 1000);
        }
        return total + (atividade.duration || 0);
      }, 0) || 0;

      // Aqui está a mudança: prospeccoesHoje é o número de leads adicionados
      const prospeccoesHoje = leadsAdicionados?.length || 0;

      // Calcular streak (apenas se estiver visualizando hoje)
      let streak = 0;
      if (dateFilter === "today") {
        let dataAtual = subDays(hoje, 1); // Começar de ontem
        let streakContinua = true;

        while (streakContinua) {
          const inicioDiaStreak = startOfDay(dataAtual);
          const fimDiaStreak = endOfDay(dataAtual);

          const { data: leadsNoDia, error: errorStreak } = await supabase
            .from("leads")
            .select("id")
            .gte("created_at", inicioDiaStreak.toISOString())
            .lte("created_at", fimDiaStreak.toISOString());

          if (errorStreak) {
            console.error("Erro ao calcular streak:", errorStreak);
            break;
          }

          const numLeadsNoDia = leadsNoDia?.length || 0;
          
          if (numLeadsNoDia >= stats.metaDiaria) { // Streak continua se atingiu a meta
            streak++;
            dataAtual = subDays(dataAtual, 1); // Voltar um dia
          } else {
            streakContinua = false;
          }
        }
      }

      setStats(prev => ({
        ...prev,
        prospeccoesHoje: prospeccoesHoje,
        tempoTotalHoje: Math.floor(tempoTotal / 60), // Convertendo segundos para minutos
        streak: dateFilter === "today" ? streak : prev.streak,
      }));

    } catch (error) {
      console.error("Erro ao calcular estatísticas:", error);
    }
  };

  const formatarTempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    const parts = [];
    if (horas > 0) parts.push(`${horas}h`);
    if (minutosRestantes > 0 || parts.length === 0) parts.push(`${minutosRestantes}m`);
    return parts.join(" ");
  };

  const calcularProgresso = () => {
    if (stats.metaDiaria === 0) return 0;
    return Math.min((stats.prospeccoesHoje / stats.metaDiaria) * 100, 100);
  };

  const calcularProdutividade = () => {
    if (stats.tempoTotalHoje === 0) return 0;
    // Tempo total em horas (com 2 casas decimais)
    const horasTotal = stats.tempoTotalHoje / 60;
    // Leads por hora
    return (stats.prospeccoesHoje / horasTotal).toFixed(1);
  };

  const getTituloTempo = () => {
    switch (dateFilter) {
      case "today":
        return "Tempo Hoje";
      case "yesterday":
        return "Tempo Ontem";
      case "last7days":
        return "Tempo (7 dias)";
      case "last30days":
        return "Tempo (30 dias)";
      default:
        return "Tempo Total";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Meta Diária */}
      <Card className={cn(
        "bg-[#222839] border-[#2e3446] relative overflow-hidden transition-colors duration-300",
        showReward && "bg-[#2a2f4a] border-[#9b87f5]"
      )}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white">Meta Diária</CardTitle>
          {showReward ? (
            <PartyPopper className="h-4 w-4 text-[#9b87f5] animate-bounce" />
          ) : (
            <Target className="h-4 w-4 text-[#9b87f5]" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Progresso</span>
              <span className="text-sm font-medium text-white">
                {stats.prospeccoesHoje}/{stats.metaDiaria}
              </span>
            </div>
            <Progress 
              value={calcularProgresso()} 
              className={cn(
                "h-2 bg-[#1c2132] transition-all duration-300",
                showReward && "bg-[#1c2132]/50"
              )}
            />
            {showReward && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#9b87f5]/10">
                <span className="text-sm font-medium text-[#9b87f5] animate-pulse">
                  Meta Atingida! 🎉
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="bg-[#222839] border-[#2e3446]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white">Sequência</CardTitle>
          <Trophy className="h-4 w-4 text-[#F59E0B]" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white">{stats.streak}</div>
            <Badge variant="secondary" className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30">
              dias seguidos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tempo Total */}
      <Card className="bg-[#222839] border-[#2e3446]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white">{getTituloTempo()}</CardTitle>
          <Clock className="h-4 w-4 text-[#14B8A6]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatarTempo(stats.tempoTotalHoje)}
          </div>
          <p className="text-xs text-gray-400">em prospecção</p>
        </CardContent>
      </Card>

      {/* Produtividade */}
      <Card className="bg-[#222839] border-[#2e3446]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white">Produtividade</CardTitle>
          <Zap className="h-4 w-4 text-[#EC4899]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {calcularProdutividade()}
          </div>
          <p className="text-xs text-gray-400">leads/hora</p>
        </CardContent>
      </Card>
    </div>
  );
} 