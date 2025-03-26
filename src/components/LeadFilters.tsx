import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStatus, LeadLossReason } from "@/types/lead";
import { Search, Filter, X } from "lucide-react";

interface LeadFiltersProps {
  onFilterChange: (filters: LeadFilters) => void;
}

export interface LeadFilters {
  search: string;
  status: LeadStatus | "todos";
  motivo_perda: LeadLossReason | "todos";
}

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "nao_contatado", label: "Não Contatado" },
  { value: "primeiro_contato", label: "Primeiro Contato" },
  { value: "proposta_enviada", label: "Proposta Enviada" },
  { value: "em_negociacao", label: "Em Negociação" },
  { value: "fechado", label: "Fechado" },
  { value: "perdido", label: "Perdido" },
];

const motivoPerdaOptions: { value: LeadLossReason; label: string }[] = [
  { value: "nao_respondeu", label: "Não Respondeu" },
  { value: "achou_caro", label: "Achou Caro" },
  { value: "sem_dinheiro", label: "Sem Dinheiro" },
  { value: "escolheu_concorrente", label: "Escolheu Concorrente" },
  { value: "projeto_cancelado", label: "Projeto Cancelado" },
  { value: "fora_do_escopo", label: "Fora do Escopo" },
  { value: "outro", label: "Outro" },
];

export function LeadFilters({ onFilterChange }: LeadFiltersProps) {
  const [filters, setFilters] = useState<LeadFilters>({
    search: "",
    status: "todos",
    motivo_perda: "todos",
  });

  const handleFilterChange = (
    field: keyof LeadFilters,
    value: string
  ) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters as LeadFilters);
    onFilterChange(newFilters as LeadFilters);
  };

  const clearFilters = () => {
    const clearedFilters: LeadFilters = {
      search: "",
      status: "todos",
      motivo_perda: "todos",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="space-y-4 p-4 bg-[#222839] rounded-lg border border-[#2e3446]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar leads..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.motivo_perda}
            onValueChange={(value) => handleFilterChange("motivo_perda", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Motivo da Perda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Motivos</SelectItem>
              {motivoPerdaOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 