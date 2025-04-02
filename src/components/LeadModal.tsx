import { useEffect, useState, useRef } from "react";
import { useLeads } from "@/contexts/LeadContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead, LeadStatus, LeadQualityTag } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/FileUpload";
import { Switch } from "@/components/ui/switch";
import { Phone, Mail, Globe, Instagram, Tag, FileText, AlertCircle } from "lucide-react";
import { cn, formStorage } from "@/lib/utils";
import { toast } from "sonner";

const FORM_STORAGE_KEY = 'leadform';

const statusConfig: Record<LeadStatus, string> = {
  nao_contatado: "Não Contatado",
  primeiro_contato: "Primeiro Contato",
  proposta_enviada: "Proposta Enviada",
  em_negociacao: "Em Negociação",
  fechado: "Fechado",
  perdido: "Perdido"
};

type LeadFormData = Omit<Lead, "id"> & { is_public?: boolean };

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: string;
}

export function LeadModal({ open, onOpenChange, leadId }: LeadModalProps) {
  const { leads, addLead, updateLead } = useLeads();
  const whatsappRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<LeadFormData>(() => {
    // Tenta carregar dados salvos do localStorage
    const savedData = formStorage.load(FORM_STORAGE_KEY);
    if (savedData) {
      return savedData;
    }
    
    // Se não houver dados salvos, usa o estado inicial padrão
    return {
      nome: "",
      email: "",
      whatsapp: "",
      instagram: "",
      website: "",
      origem: "",
      tipo_projeto: "",
      orcamento: 0,
      status: "nao_contatado",
      ultimo_contato: new Date().toISOString(),
      anotacoes: "",
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_public: false,
      motivo_perda: null,
      detalhes_perda: null,
      necessidades: "",
      observacoes: ""
    };
  });

  const availableTags: LeadQualityTag[] = [
    "quente",
    "morno",
    "frio",
    "prioridade_alta",
    "prioridade_media",
    "prioridade_baixa",
    "decisor",
    "influenciador",
    "redesign"
  ];

  // Efeito para carregar dados do lead quando o modal é aberto
  useEffect(() => {
    if (open) {
      if (leadId) {
        const lead = leads.find(lead => lead.id === leadId);
        if (lead) {
          console.log("Lead carregado no modal:", lead);
          const { id: _, ...leadData } = lead;
          // Garantir que is_public seja um booleano
          const is_public = lead.is_public === true ? true : false;
          console.log("Flag is_public definida como:", is_public);
          
          const newFormData = {
            ...leadData,
            is_public: is_public
          };
          setFormData(newFormData);
          formStorage.save(FORM_STORAGE_KEY, newFormData);
        }
      } else {
        // Se não houver leadId, tenta restaurar dados salvos
        const savedData = formStorage.load(FORM_STORAGE_KEY);
        if (savedData) {
          setFormData(savedData);
        }
      }
    }
  }, [leadId, leads, open]);

  // Efeito para limpar dados quando o modal é fechado
  useEffect(() => {
    if (!open) {
      formStorage.clear(FORM_STORAGE_KEY);
    }
  }, [open]);

  // Salva os dados no localStorage sempre que o formData muda
  useEffect(() => {
    if (open) {
      formStorage.save(FORM_STORAGE_KEY, formData);
    }
  }, [formData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "orcamento") {
      const numericValue = Number(value.replace(/\D/g, '')) / 100;
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagToggle = (tag: LeadQualityTag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    console.log("Switch alterado para:", checked);
    // Garantir que is_public seja um booleano
    const is_public = checked === true ? true : false;
    setFormData(prev => ({
      ...prev,
      is_public: is_public
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Garantir que is_public seja um booleano antes de enviar
      const dataToSave = {
        ...formData,
        is_public: formData.is_public === true ? true : false
      };
      
      console.log("Salvando lead com is_public:", dataToSave.is_public);
      
      if (leadId) {
        await updateLead(leadId, dataToSave);
      } else {
        await addLead(dataToSave);
      }
      formStorage.clear(FORM_STORAGE_KEY); // Limpa os dados após salvar com sucesso
      onOpenChange(false);
      toast.success(leadId ? "Lead atualizado com sucesso!" : "Lead adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
      toast.error("Erro ao salvar lead. Por favor, tente novamente.");
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const truncated = numbers.slice(0, 11);
    
    if (truncated.length <= 2) return `(${truncated}`;
    if (truncated.length <= 7) return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setFormData(prev => ({
      ...prev,
      whatsapp: formatted
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case "nao_contatado": return "bg-gray-500";
      case "primeiro_contato": return "bg-blue-500";
      case "proposta_enviada": return "bg-yellow-500";
      case "em_negociacao": return "bg-purple-500";
      case "fechado": return "bg-green-500";
      case "perdido": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTagColor = (tag: LeadQualityTag) => {
    switch (tag) {
      case "quente": return "bg-red-500 hover:bg-red-600";
      case "morno": return "bg-yellow-500 hover:bg-yellow-600";
      case "frio": return "bg-blue-500 hover:bg-blue-600";
      case "prioridade_alta": return "bg-purple-500 hover:bg-purple-600";
      case "prioridade_media": return "bg-indigo-500 hover:bg-indigo-600";
      case "prioridade_baixa": return "bg-gray-500 hover:bg-gray-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-[#1c2132] border-[#2e3446] text-white flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-[#2e3446] shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-semibold">
            {leadId ? "Editar Lead" : "Novo Lead"}
          </DialogTitle>
              <DialogDescription className="text-gray-400 mt-1">
                {leadId ? "Edite as informações do lead" : "Preencha as informações do novo lead"}
          </DialogDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="is_public" className="text-sm text-gray-400">
                  {formData.is_public ? "Público" : "Privado"}
                </Label>
                <Switch
                  id="is_public"
                  checked={formData.is_public === true}
                  onCheckedChange={handleSwitchChange}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Status do Lead */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Status do Lead</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([status, label]) => (
                  <Button
                    key={status}
                    type="button"
                    onClick={() => handleSelectChange("status", status)}
                    className={cn(
                      "h-9 px-4 rounded-full transition-all",
                      formData.status === status
                        ? getStatusColor(status as LeadStatus)
                        : "bg-[#222839] hover:bg-[#2e3446]"
                    )}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  Nome
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                    className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_projeto" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  Tipo de Projeto
                </Label>
                <Select
                  value={formData.tipo_projeto}
                  onValueChange={(value) => handleSelectChange("tipo_projeto", value)}
                >
                    <SelectTrigger className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]">
                    <SelectValue placeholder="Selecione o tipo de projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="landing_page">Landing Page</SelectItem>
                    <SelectItem value="criativos">Criativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orcamento" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  Orçamento
                </Label>
                <Input
                  id="orcamento"
                  name="orcamento"
                  type="text"
                  value={formatCurrency(formData.orcamento)}
                  onChange={handleChange}
                    className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
                  required
                />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="origem" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#9b87f5]" />
                    Origem
                  </Label>
                <Input
                    id="origem"
                    name="origem"
                    value={formData.origem}
                  onChange={handleChange}
                    className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
                  required
                />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#9b87f5]" />
                    WhatsApp
                  </Label>
                  <Input
                    ref={whatsappRef}
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleWhatsAppChange}
                    placeholder="(00) 00000-0000"
                    className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
                    required
                  />
            </div>

            <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#9b87f5]" />
                    Email
                </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemplo@email.com"
                    className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
                  />
            </div>

            <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-[#9b87f5]" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                onChange={handleChange}
                    placeholder="@usuario ou URL completa"
                    className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
              />
            </div>

            <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#9b87f5]" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://exemplo.com"
                    className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#9b87f5]" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={cn(
                      "cursor-pointer transition-all",
                      formData.tags.includes(tag)
                        ? getTagColor(tag)
                        : "bg-[#222839] hover:bg-[#2e3446]"
                    )}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Anotações */}
            <div className="space-y-4">
              <Label htmlFor="anotacoes" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#9b87f5]" />
                Anotações
              </Label>
              <Textarea
                id="anotacoes"
                name="anotacoes"
                value={formData.anotacoes || ""}
                onChange={handleChange}
                className="min-h-[200px] bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
                placeholder="Adicione anotações importantes sobre o lead..."
              />
            </div>

            {/* Informações de Perda */}
            {formData.status === "perdido" && (
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Informações da Perda
                </Label>
                <div className="space-y-4">
                  <Select
                    value={formData.motivo_perda || ""}
                    onValueChange={(value) => handleSelectChange("motivo_perda", value)}
                  >
                    <SelectTrigger className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]">
                      <SelectValue placeholder="Selecione o motivo da perda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nao_respondeu">Não Respondeu</SelectItem>
                      <SelectItem value="achou_caro">Achou Caro</SelectItem>
                      <SelectItem value="sem_dinheiro">Sem Dinheiro</SelectItem>
                      <SelectItem value="escolheu_concorrente">Escolheu Concorrente</SelectItem>
                      <SelectItem value="projeto_cancelado">Projeto Cancelado</SelectItem>
                      <SelectItem value="fora_do_escopo">Fora do Escopo</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>

                  <Textarea
                    name="detalhes_perda"
                    value={formData.detalhes_perda || ""}
                    onChange={handleChange}
                    placeholder="Descreva os detalhes do motivo da perda..."
                    className="h-20 bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
                  />
                </div>
              </div>
            )}

            {/* Arquivos */}
            {leadId && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Arquivos</Label>
                <FileUpload leadId={leadId} />
              </div>
            )}
          </form>
        </ScrollArea>

        <div className="shrink-0 p-6 bg-[#1c2132] border-t border-[#2e3446]">
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-[120px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="min-w-[120px] bg-[#9b87f5] hover:bg-[#8b74f4]"
            >
              {leadId ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 


