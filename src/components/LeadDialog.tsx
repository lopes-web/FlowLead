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
import { Textarea } from "@/components/ui/textarea";
import { LeadStatus, LeadLossReason } from "@/types/lead";
import { useLeads } from "@/contexts/LeadContext";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Lock, Unlock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

const motivoPerdaOptions: { value: LeadLossReason; label: string }[] = [
  { value: "nao_respondeu", label: "Não Respondeu" },
  { value: "achou_caro", label: "Achou Caro" },
  { value: "sem_dinheiro", label: "Sem Dinheiro" },
  { value: "escolheu_concorrente", label: "Escolheu Concorrente" },
  { value: "projeto_cancelado", label: "Projeto Cancelado" },
  { value: "fora_do_escopo", label: "Fora do Escopo" },
  { value: "outro", label: "Outro" },
];

export function LeadDialog({
  open,
  onOpenChange,
  leadId,
}: LeadDialogProps) {
  const { user } = useAuth();
  const { leads, createLead, updateLead, togglePublic } = useLeads();
  const [formData, setFormData] = useState({
    nome: "",
    tipo_projeto: "",
    orcamento: "",
    status: "nao_contatado" as LeadStatus,
    motivo_perda: "nao_respondeu" as LeadLossReason,
    detalhes_perda: "",
    observacoes: "",
    ultimo_contato: new Date().toISOString().split('T')[0],
    tags: [] as string[],
    is_public: false,
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (leadId) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead) {
        setFormData({
          nome: lead.nome,
          tipo_projeto: lead.tipo_projeto,
          orcamento: lead.orcamento.toString(),
          status: lead.status,
          motivo_perda: lead.motivo_perda || "nao_respondeu",
          detalhes_perda: lead.detalhes_perda || "",
          observacoes: lead.observacoes || "",
          ultimo_contato: new Date(lead.ultimo_contato).toISOString().split('T')[0],
          tags: lead.tags || [],
          is_public: lead.is_public || false,
        });
      }
    } else {
      setFormData({
        nome: "",
        tipo_projeto: "",
        orcamento: "",
        status: "nao_contatado",
        motivo_perda: "nao_respondeu",
        detalhes_perda: "",
        observacoes: "",
        ultimo_contato: new Date().toISOString().split('T')[0],
        tags: [],
        is_public: false,
      });
    }
  }, [leadId, leads]);

  const handleSubmit = async () => {
    try {
      const leadData = {
        ...formData,
        orcamento: parseFloat(formData.orcamento.replace(/[^\d,]/g, '').replace(',', '.')),
      };

      if (leadId) {
        await updateLead(leadId, leadData);
      } else {
        await createLead(leadData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTogglePublic = async () => {
    if (leadId) {
      try {
        await togglePublic(leadId, !formData.is_public);
        setFormData({
          ...formData,
          is_public: !formData.is_public,
        });
      } catch (error) {
        console.error('Erro ao alterar visibilidade do lead:', error);
      }
    }
  };

  const canEdit = leadId ? (formData.is_public || (user && leads.find(l => l.id === leadId)?.user_id === user.id)) : true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#222839] border-[#2e3446] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{leadId ? "Editar Lead" : "Novo Lead"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {leadId ? "Atualize as informações do lead" : "Preencha as informações do novo lead"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Nome do Lead
              </label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do lead ou empresa"
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Tipo de Projeto
              </label>
              <Input
                value={formData.tipo_projeto}
                onChange={(e) => setFormData({ ...formData, tipo_projeto: e.target.value })}
                placeholder="Ex: Website, E-commerce, App"
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Orçamento
              </label>
              <Input
                value={formData.orcamento}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value) {
                    const numberValue = parseInt(value) / 100;
                    setFormData({
                      ...formData,
                      orcamento: numberValue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })
                    });
                  } else {
                    setFormData({ ...formData, orcamento: '' });
                  }
                }}
                placeholder="R$ 0,00"
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as LeadStatus })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {formData.status === "perdido" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Motivo da Perda
                  </label>
                  <Select
                    value={formData.motivo_perda}
                    onValueChange={(value) => setFormData({ ...formData, motivo_perda: value as LeadLossReason })}
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {motivoPerdaOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="cursor-pointer"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Detalhes da Perda
                  </label>
                  <Textarea
                    value={formData.detalhes_perda}
                    onChange={(e) => setFormData({ ...formData, detalhes_perda: e.target.value })}
                    placeholder="Descreva mais detalhes sobre o motivo da perda..."
                    className="min-h-[100px]"
                    disabled={!canEdit}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Último Contato
              </label>
              <Input
                type="date"
                value={formData.ultimo_contato}
                onChange={(e) => setFormData({ ...formData, ultimo_contato: e.target.value })}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Observações
              </label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Adicione observações importantes sobre o lead..."
                className="min-h-[100px]"
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Tags
              </label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  disabled={!canEdit}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddTag}
                  disabled={!canEdit}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-[#2e3446] text-gray-200 hover:bg-[#3a4257]"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-white"
                        disabled={!canEdit}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {leadId && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleTogglePublic}
              className="mr-auto"
              disabled={!canEdit}
            >
              {formData.is_public ? (
                <Unlock className="h-4 w-4 text-green-400" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 sm:flex-none bg-[#9b87f5] hover:bg-[#8b74f4]"
            disabled={!canEdit}
          >
            {leadId ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 