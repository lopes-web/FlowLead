import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStatus, LeadLossReason } from "@/types/lead";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

export interface LeadFilters {
  search: string;
  status: LeadStatus | "todos";
  motivo_perda: LeadLossReason | "todos";
  redesign: "todos" | "com_redesign" | "meus_redesigns" | "sem_redesign";
}

interface LeadFiltersProps {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
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

export function LeadFilters({ filters, onChange }: LeadFiltersProps) {
  const { user } = useAuth();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<LeadFilters>(filters);

  // Sincronizar os filtros locais quando os filtros externos mudam
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...localFilters, search: e.target.value };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = { ...localFilters, status: value as LeadStatus | "todos" };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleMotivoChange = (value: string) => {
    const newFilters = { ...localFilters, motivo_perda: value as LeadLossReason | "todos" };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleRedesignChange = (value: string) => {
    const newFilters = { 
      ...localFilters, 
      redesign: value as "todos" | "com_redesign" | "meus_redesigns" | "sem_redesign" 
    };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: LeadFilters = {
      search: "",
      status: "todos",
      motivo_perda: "todos",
      redesign: "todos"
    };
    setLocalFilters(defaultFilters);
    onChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.search !== "" ||
      localFilters.status !== "todos" ||
      localFilters.motivo_perda !== "todos" ||
      localFilters.redesign !== "todos"
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar leads..."
            value={localFilters.search}
            onChange={handleSearchChange}
            className="pl-9 bg-[#1c2132] border-[#2e3446] h-9"
          />
          {localFilters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7 hover:bg-[#2e3446]"
              onClick={() => {
                setLocalFilters((prev) => ({ ...prev, search: "" }));
                onChange({ ...localFilters, search: "" });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant={hasActiveFilters() ? "default" : "outline"}
              size="sm"
              className={
                hasActiveFilters()
                  ? "bg-[#9b87f5] hover:bg-[#9b87f5]/90 text-white"
                  : "bg-[#1c2132] border-[#2e3446] hover:bg-[#2e3446]"
              }
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters() && (
                <span className="ml-1 rounded-full bg-white text-[#9b87f5] w-5 h-5 text-xs flex items-center justify-center">
                  {(localFilters.status !== "todos" ? 1 : 0) +
                    (localFilters.motivo_perda !== "todos" ? 1 : 0) +
                    (localFilters.redesign !== "todos" ? 1 : 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] sm:w-[540px] bg-[#1c2132] border-[#2e3446] text-white">
            <SheetHeader>
              <SheetTitle className="text-white">Filtros</SheetTitle>
              <SheetDescription className="text-gray-400">
                Filtre os leads por diferentes critérios
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={localFilters.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="bg-[#222839] border-[#2e3446]">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c2132] border-[#2e3446]">
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="nao_contatado">Não Contatado</SelectItem>
                    <SelectItem value="primeiro_contato">Primeiro Contato</SelectItem>
                    <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
                    <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo_perda">Motivo da Perda</Label>
                <Select value={localFilters.motivo_perda || "todos"} onValueChange={handleMotivoChange}>
                  <SelectTrigger className="bg-[#222839] border-[#2e3446]">
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c2132] border-[#2e3446]">
                    <SelectItem value="todos">Todos os motivos</SelectItem>
                    <SelectItem value="nao_respondeu">Não Respondeu</SelectItem>
                    <SelectItem value="achou_caro">Achou Caro</SelectItem>
                    <SelectItem value="sem_dinheiro">Sem Dinheiro</SelectItem>
                    <SelectItem value="escolheu_concorrente">Escolheu Concorrente</SelectItem>
                    <SelectItem value="projeto_cancelado">Projeto Cancelado</SelectItem>
                    <SelectItem value="fora_do_escopo">Fora do Escopo</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="redesign">Redesign</Label>
                <Select value={localFilters.redesign || "todos"} onValueChange={handleRedesignChange}>
                  <SelectTrigger className="bg-[#222839] border-[#2e3446]">
                    <SelectValue placeholder="Redesign" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c2132] border-[#2e3446]">
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="com_redesign">Com Redesign</SelectItem>
                    <SelectItem value="meus_redesigns">Meus Redesigns</SelectItem>
                    <SelectItem value="sem_redesign">Sem Redesign</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={clearFilters}
                className="w-full bg-[#222839] border border-[#2e3446] hover:bg-[#2e3446]"
                variant="outline"
              >
                Limpar Filtros
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
} 