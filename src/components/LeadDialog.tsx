import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStatus, LeadQualityTag } from "@/types/lead";
import { useLeads } from "@/contexts/LeadContext";
import { X, Plus } from "lucide-react";

type LeadFormData = {
  nome: string;
  email: string;
  whatsapp: string;
  instagram: string;
  website: string;
  origem: string;
  tipo_projeto: string;
  orcamento: number;
  status: LeadStatus;
  ultimo_contato: string;
  tags: LeadQualityTag[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface LeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: string;
}

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "nao_contatado", label: "Não Contatado" },
  { value: "primeiro_contato", label: "Primeiro Contato" },
  { value: "proposta_enviada", label: "Proposta Enviada" },
  { value: "em_negociacao", label: "Em Negociação" },
  { value: "fechado", label: "Fechado" },
  { value: "perdido", label: "Perdido" },
];

export function LeadDialog({
  open,
  onOpenChange,
  leadId,
}: LeadDialogProps) {
  const { leads, addLead, updateLead } = useLeads();
  const [formData, setFormData] = useState<LeadFormData>({
    nome: "",
    email: "",
    whatsapp: "",
    instagram: "",
    website: "",
    origem: "",
    tipo_projeto: "",
    orcamento: 0,
    status: "nao_contatado",
    ultimo_contato: new Date().toISOString().split('T')[0],
    tags: [],
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const [newTag, setNewTag] = useState<LeadQualityTag>("quente");

  useEffect(() => {
    if (leadId) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead) {
        setFormData({
          nome: lead.nome,
          email: lead.email || "",
          whatsapp: lead.whatsapp || "",
          instagram: lead.instagram || "",
          website: lead.website || "",
          origem: lead.origem || "",
          tipo_projeto: lead.tipo_projeto,
          orcamento: lead.orcamento,
          status: lead.status,
          ultimo_contato: new Date(lead.ultimo_contato).toISOString().split('T')[0],
          tags: lead.tags || [],
          is_public: lead.is_public || false,
          created_at: lead.created_at,
          updated_at: new Date().toISOString()
        });
      }
    } else {
      setFormData({
        nome: "",
        email: "",
        whatsapp: "",
        instagram: "",
        website: "",
        origem: "",
        tipo_projeto: "",
        orcamento: 0,
        status: "nao_contatado",
        ultimo_contato: new Date().toISOString().split('T')[0],
        tags: [],
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }, [leadId, leads]);

  const handleSubmit = async () => {
    try {
      const leadData = {
        ...formData,
        orcamento: parseFloat(formData.orcamento.toString().replace(/[^\d,]/g, '').replace(',', '.')) || 0,
      };

      if (leadId) {
        await updateLead(leadId, leadData);
      } else {
        await addLead(leadData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  };

  const handleAddTag = () => {
    if (!formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
      });
      setNewTag("quente");
    }
  };

  const handleRemoveTag = (tagToRemove: LeadQualityTag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1c2132] border-[#2e3446] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>{leadId ? "Editar Lead" : "Novo Lead"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {leadId ? "Atualize as informações do lead" : "Preencha as informações do novo lead"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome"
              className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
            />

            <Input
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="WhatsApp"
              className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
            />

            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              type="email"
              className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
            />

            <Input
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="Instagram (@usuario ou URL completa)"
              className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
            />

            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="Website"
              type="url"
              className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
            />

            <Input
              value={formData.origem}
              onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
              placeholder="Origem"
              className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
            />

            <Select
              value={formData.tipo_projeto}
              onValueChange={(value) => setFormData({ ...formData, tipo_projeto: value })}
            >
              <SelectTrigger className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]">
                <SelectValue placeholder="Selecione o tipo de projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="landing_page">Landing Page</SelectItem>
                <SelectItem value="aplicativo">Aplicativo</SelectItem>
                <SelectItem value="sistema">Sistema</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={formData.orcamento === 0 ? "" : formData.orcamento.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).replace('R$', '').trim()}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData({
                  ...formData,
                  orcamento: value ? parseInt(value) : 0
                });
              }}
              placeholder="Orçamento"
              className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
            />

            <Select
              value={formData.status}
              onValueChange={(value: LeadStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={formData.ultimo_contato}
              onChange={(e) => setFormData({ ...formData, ultimo_contato: e.target.value })}
              className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]"
            />

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <div key={tag} className="flex items-center gap-1 bg-[#2e3446] px-2 py-1 rounded">
                  <span>{tag}</span>
                  <button onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Select value={newTag} onValueChange={(value: LeadQualityTag) => setNewTag(value)}>
                <SelectTrigger className="bg-[#222839] border-[#2e3446] focus:ring-[#9b87f5] focus:border-[#9b87f5]">
                  <SelectValue placeholder="Selecione uma tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quente">Quente</SelectItem>
                  <SelectItem value="morno">Morno</SelectItem>
                  <SelectItem value="frio">Frio</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddTag} variant="outline" size="icon">
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white"
          >
            {leadId ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 