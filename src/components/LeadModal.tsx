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
import { FileText } from "lucide-react";
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
      <DialogContent className="max-w-[800px] p-0 bg-[#1c2132] border-[#2e3446] text-white overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-medium">
            {leadId ? "Editar Lead" : "Novo Lead"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Preencha as informações do novo lead
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[80vh] px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Status do Lead</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="public" className="text-sm text-gray-400">Privado</Label>
                <Switch
                  id="public"
                  checked={formData.is_public}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(statusConfig).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelectChange("status", value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                    formData.status === value
                      ? "bg-[#a08af7] text-white"
                      : "bg-[#252a3d] text-gray-400 hover:bg-[#2e3446] hover:text-white"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="nome">Nome</Label>
                </div>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="bg-[#1c2132] border-[#2e3446]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="tipo_projeto">Tipo de Projeto</Label>
                </div>
                <Select
                  value={formData.tipo_projeto}
                  onValueChange={(value) => handleSelectChange("tipo_projeto", value)}
                >
                  <SelectTrigger className="bg-[#1c2132] border-[#2e3446]">
                    <SelectValue placeholder="Selecione o tipo de projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="landing_page">Landing Page</SelectItem>
                    <SelectItem value="criativos">Criativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="orcamento">Orçamento</Label>
                </div>
                <Input
                  id="orcamento"
                  name="orcamento"
                  value={formData.orcamento ? `R$ ${formData.orcamento.toFixed(2)}` : "R$ 0,00"}
                  onChange={handleChange}
                  className="bg-[#1c2132] border-[#2e3446]"
                  placeholder="R$ 0,00"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="origem">Origem</Label>
                </div>
                <Input
                  id="origem"
                  name="origem"
                  value={formData.origem}
                  onChange={handleChange}
                  className="bg-[#1c2132] border-[#2e3446]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                </div>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleWhatsAppChange}
                  placeholder="(00) 00000-0000"
                  className="bg-[#1c2132] border-[#2e3446]"
                  ref={whatsappRef}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemplo@email.com"
                  className="bg-[#1c2132] border-[#2e3446]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="instagram">Instagram</Label>
                </div>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@usuario ou URL completa"
                  className="bg-[#1c2132] border-[#2e3446]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-[#9b87f5]" />
                  <Label htmlFor="website">Website</Label>
                </div>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://exemplo.com"
                  className="bg-[#1c2132] border-[#2e3446]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-[#9b87f5]" />
                <Label>Tags</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors",
                      formData.tags.includes(tag)
                        ? "bg-[#a08af7] text-white border-[#a08af7]"
                        : "bg-transparent text-gray-400 border-[#2e3446] hover:bg-[#2e3446] hover:text-white"
                    )}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-[#9b87f5]" />
                <Label htmlFor="anotacoes">Anotações</Label>
              </div>
              <Textarea
                id="anotacoes"
                name="anotacoes"
                value={formData.anotacoes}
                onChange={handleChange}
                placeholder="Digite suas anotações sobre o lead"
                className="min-h-[100px] bg-[#1c2132] border-[#2e3446]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-transparent text-white border-[#2e3446] hover:bg-[#2e3446]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#a08af7] text-white hover:bg-[#8a76e4]"
              >
                {leadId ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 


