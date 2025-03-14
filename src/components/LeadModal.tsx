import { useEffect, useState, useRef } from "react";
import { useLeads } from "@/contexts/LeadContext";
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  const { user } = useAuth();
  const whatsappRef = useRef<HTMLInputElement>(null);
  
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
    ultimo_contato: new Date().toISOString(),
    anotacoes: "",
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: user?.id || "",
    is_public: false,
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
        tipo_projeto: "",
        orcamento: 0,
        status: "nao_contatado",
        ultimo_contato: new Date().toISOString(),
        anotacoes: "",
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user?.id || "",
        is_public: false,
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

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_public: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataWithUserId = {
        ...formData,
        user_id: user?.id || "",
        updated_at: new Date().toISOString(),
      };

      if (leadId) {
        const oldLead = leads.find(lead => lead.id === leadId);
        await updateLead(leadId, dataWithUserId);
        
        // Se o status mudou para fechado, cria um projeto
        if (oldLead?.status !== "fechado" && formData.status === "fechado") {
          const updatedLead = { ...oldLead, ...dataWithUserId, id: leadId };
          await createProjectFromLead(updatedLead);
        }
      } else {
        await addLead(dataWithUserId);
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
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>
            {leadId ? "Editar Lead" : "Novo Lead"}
          </DialogTitle>
          <DialogDescription>
            {leadId 
              ? "Edite as informações do lead conforme necessário." 
              : "Preencha as informações do novo lead."
            }
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  ref={whatsappRef}
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleWhatsAppChange}
                  placeholder="(00) 00000-0000"
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
                  placeholder="exemplo@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@usuario ou URL completa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Input
                  id="origem"
                  name="origem"
                  value={formData.origem}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_projeto">Tipo de Projeto</Label>
                <Select
                  value={formData.tipo_projeto}
                  onValueChange={(value) => handleSelectChange("tipo_projeto", value)}
                >
                  <SelectTrigger>
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
                <Label htmlFor="orcamento">Orçamento</Label>
                <Input
                  id="orcamento"
                  name="orcamento"
                  type="text"
                  value={formatCurrency(formData.orcamento)}
                  onChange={handleChange}
                  placeholder="R$ 0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ultimo_contato">Último Contato</Label>
                <Input
                  id="ultimo_contato"
                  name="ultimo_contato"
                  type="date"
                  value={formData.ultimo_contato ? formData.ultimo_contato.split('T')[0] : new Date().toISOString().split('T')[0]}
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
              <Label htmlFor="anotacoes">Anotações</Label>
              <Textarea
                id="anotacoes"
                name="anotacoes"
                value={formData.anotacoes}
                onChange={handleChange}
                className="min-h-[400px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
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

            {leadId && (
              <div className="space-y-2">
                <Label>Arquivos</Label>
                <FileUpload leadId={leadId} />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="is_public">Tornar lead público</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {leadId ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 