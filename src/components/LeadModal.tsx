import { useEffect, useState, useRef } from "react";
import { useLeads } from "@/contexts/LeadContext";
import { useProjects } from "@/contexts/ProjectContext";
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

type LeadFormData = Omit<Lead, "id">;

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: string;
}

export function LeadModal({ open, onOpenChange, leadId }: LeadModalProps) {
  const { leads, addLead, updateLead } = useLeads();
  const { createProjectFromLead } = useProjects();
  const whatsappRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<LeadFormData>({
    nome: "",
    email: "",
    whatsapp: "",
    instagram: "",
    website: "",
    origem: "",
    tipoprojeto: "",
    orcamento: 0,
    status: "nao_contatado",
    ultimocontato: new Date().toISOString(),
    anotacoes: "",
    necessidades: "",
    observacoes: "",
    ideias: "",
    tags: [],
    createdat: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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

  useEffect(() => {
    if (leadId) {
      const lead = leads.find(lead => lead.id === leadId);
      if (lead) {
        const { id: _, ...leadData } = lead;
        setFormData(leadData);
      }
    } else {
      setFormData({
        nome: "",
        email: "",
        whatsapp: "",
        instagram: "",
        website: "",
        origem: "",
        tipoprojeto: "",
        orcamento: 0,
        status: "nao_contatado",
        ultimocontato: new Date().toISOString(),
        anotacoes: "",
        necessidades: "",
        observacoes: "",
        ideias: "",
        tags: [],
        createdat: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, [leadId, leads]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "orcamento") {
      // Remove formatação e converte para número
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (leadId) {
        const oldLead = leads.find(lead => lead.id === leadId);
        await updateLead(leadId, formData);
        
        // Se o status mudou para fechado, cria um projeto
        if (oldLead?.status !== "fechado" && formData.status === "fechado") {
          const updatedLead = { ...oldLead, ...formData, id: leadId };
          await createProjectFromLead(updatedLead);
        }
      } else {
        await addLead(formData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
    }
  };

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const truncated = numbers.slice(0, 11);
    
    // Formata o número
    if (truncated.length <= 2) {
      return `(${truncated}`;
    }
    if (truncated.length <= 7) {
      return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
    }
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
    }).format(value).replace('R$', '').trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>{leadId ? "Editar Lead" : "Novo Lead"}</DialogTitle>
          <DialogDescription>
            {leadId
              ? "Edite as informações do lead conforme necessário."
              : "Preencha as informações do novo lead."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: joao.silva@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleWhatsAppChange}
                  placeholder="Ex: (11) 98765-4321"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="Ex: @joaosilva"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Ex: www.joaosilva.com.br"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Input
                  id="origem"
                  name="origem"
                  value={formData.origem}
                  onChange={handleChange}
                  placeholder="Ex: Instagram Ads"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoprojeto">Tipo de Projeto</Label>
                <Input
                  id="tipoprojeto"
                  name="tipoprojeto"
                  value={formData.tipoprojeto}
                  onChange={handleChange}
                  placeholder="Ex: Redesign de Site"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orcamento">Orçamento</Label>
                <Input
                  id="orcamento"
                  name="orcamento"
                  type="text"
                  value={formatCurrency(formData.orcamento)}
                  onChange={handleChange}
                  placeholder="Ex: 5.000,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ultimocontato">Último Contato</Label>
                <Input
                  id="ultimocontato"
                  name="ultimocontato"
                  type="date"
                  value={formData.ultimocontato ? formData.ultimocontato.split('T')[0] : new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value as LeadStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
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
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anotacoes">Anotações</Label>
              <Textarea
                id="anotacoes"
                name="anotacoes"
                value={formData.anotacoes}
                onChange={handleChange}
                placeholder="Registre aqui todas as informações importantes sobre o lead, como detalhes das conversas, requisitos específicos, feedbacks, etc."
                className="min-h-[400px] resize-y"
              />
            </div>

            <div className="sticky bottom-0 bg-background pt-4 border-t">
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {leadId ? "Salvar Alterações" : "Cadastrar Lead"}
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 