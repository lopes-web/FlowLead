import { Card } from "@/components/ui/card";
import { useLeads } from "@/contexts/LeadContext";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_LABELS = {
  nao_contatado: "Não Contatado",
  primeiro_contato: "Primeiro Contato",
  proposta_enviada: "Proposta Enviada",
  em_negociacao: "Em Negociação",
  fechado: "Fechado",
  perdido: "Perdido",
};

const statusColors = {
  nao_contatado: "#F59E0B", // Laranja/Âmbar
  primeiro_contato: "#8B5CF6", // Roxo vibrante
  proposta_enviada: "#EC4899", // Rosa
  em_negociacao: "#14B8A6", // Verde água
  fechado: "#06B6D4", // Ciano
  perdido: "#6B7280", // Cinza neutro
};

export function DashboardCharts() {
  const { leads } = useLeads();

  // Prepare data for charts
  const statusData = Object.entries(STATUS_LABELS).map(([status, label]) => {
    const count = leads.filter(lead => lead.status === status).length;
    const total = leads.length;
    const percentage = total > 0 ? (count / total * 100).toFixed(1) : "0";
    return {
      status,
      label,
      value: count,
      percentage: `${percentage}%`,
    };
  });

  const monthlyData = leads.reduce((acc: any[], lead) => {
    const month = new Date(lead.ultimo_contato).toLocaleString('pt-BR', { month: 'short' });
    const existingMonth = acc.find((item) => item.month === month);
    if (existingMonth) {
      existingMonth.leads++;
      if (lead.status === 'fechado') {
        existingMonth.converted++;
      }
    } else {
      acc.push({
        month,
        leads: 1,
        converted: lead.status === 'fechado' ? 1 : 0,
      });
    }
    return acc;
  }, []);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-sm">{data.label}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {data.value} leads ({data.percentage})
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      <Card className="p-4 bg-accent/50 border-accent col-span-1 md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Leads por Mês</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="convertedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="#8B5CF6"
                fillOpacity={1}
                fill="url(#leadGradient)"
                name="Total Leads"
              />
              <Area
                type="monotone"
                dataKey="converted"
                stroke="#14B8A6"
                fillOpacity={1}
                fill="url(#convertedGradient)"
                name="Leads Convertidos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 bg-accent/50 border-accent">
        <h3 className="text-lg font-semibold mb-4">Status dos Leads</h3>
        <div className="h-[300px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="label"
              >
                {statusData.map((entry) => (
                  <Cell 
                    key={entry.status} 
                    fill={statusColors[entry.status as keyof typeof statusColors]}
                  />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
              <Legend 
                formatter={(value) => {
                  const item = statusData.find(d => d.label === value);
                  return `${value} (${item?.percentage})`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 bg-accent/50 border-accent">
        <h3 className="text-lg font-semibold mb-4">Distribuição de Status</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={statusData}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" className="text-xs" />
              <YAxis 
                type="category" 
                dataKey="label" 
                className="text-xs"
                width={100}
              />
              <Tooltip
                content={customTooltip}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {statusData.map((entry) => (
                  <Cell 
                    key={entry.status}
                    fill={statusColors[entry.status as keyof typeof statusColors]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}