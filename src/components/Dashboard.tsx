import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeads } from "@/contexts/LeadContext";
import { Users, DollarSign, Clock, CheckCircle } from "lucide-react";
import { DashboardCharts } from "./DashboardCharts";

export function Dashboard() {
  const { leads } = useLeads();

  const totalLeads = leads.length;
  const leadsEmNegociacao = leads.filter(
    (lead) => !["arquivado", "fechado", "novo"].includes(lead.status)
  ).length;
  const leadsFechados = leads.filter((lead) => lead.status === "fechado").length;
  const valorTotal = leads
    .filter((lead) => lead.status === "fechado")
    .reduce((acc, lead) => acc + lead.orcamento, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fadeIn bg-accent/50 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Leads cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fadeIn [animation-delay:100ms] bg-accent/50 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsEmNegociacao}</div>
            <p className="text-xs text-muted-foreground">
              Em processo de negociação
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fadeIn [animation-delay:200ms] bg-accent/50 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Fechados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsFechados}</div>
            <p className="text-xs text-muted-foreground">
              Projetos convertidos
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fadeIn [animation-delay:300ms] bg-accent/50 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(valorTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em projetos fechados
            </p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts />
    </div>
  );
}