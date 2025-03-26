import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lead, LeadQualityTag } from "@/types/lead";

type LeadFormData = Omit<Lead, "id">;

export function LeadForm() {
  const { addLead } = useLeads();
  const [formData, setFormData] = useState<LeadFormData>({
    nome: "",
    email: "",
    whatsapp: "",
    instagram: "",
    website: "",
    origem: "",
    tipo_projeto: "",
    orcamento: 0,
    status: "nao_contatado" as const,
    ultimo_contato: new Date().toISOString().split("T")[0],
    anotacoes: "",
    necessidades: "",
    observacoes: "",
    ideias: "",
    tags: [] as LeadQualityTag[],
    created_at: new Date().toISOString(),
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
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    addLead({
      nome: formData.nome,
      email: formData.email,
      whatsapp: formData.whatsapp,
      instagram: formData.instagram,
      website: formData.website,
      origem: formData.origem,
      tipo_projeto: formData.tipo_projeto,
      orcamento: Number(formData.orcamento),
      status: formData.status,
      ultimo_contato: formData.ultimo_contato,
      anotacoes: formData.anotacoes,
      necessidades: formData.necessidades,
      observacoes: formData.observacoes,
      ideias: formData.ideias,
      tags: formData.tags,
      created_at: now,
      updated_at: now,
    });
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
      ultimo_contato: new Date().toISOString().split("T")[0],
      anotacoes: "",
      necessidades: "",
      observacoes: "",
      ideias: "",
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tag: LeadQualityTag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Novo Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
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
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_projeto: value }))}
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
                type="number"
                value={formData.orcamento}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ultimo_contato">Último Contato</Label>
              <Input
                id="ultimo_contato"
                name="ultimo_contato"
                type="date"
                value={formData.ultimo_contato}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags de Qualidade</Label>
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

          <div className="space-y-2">
            <Label htmlFor="anotacoes">Anotações</Label>
            <Textarea
              id="anotacoes"
              name="anotacoes"
              value={formData.anotacoes}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="necessidades">Necessidades</Label>
            <Textarea
              id="necessidades"
              name="necessidades"
              value={formData.necessidades}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ideias">Ideias Iniciais</Label>
            <Textarea
              id="ideias"
              name="ideias"
              value={formData.ideias}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full">
            Cadastrar Lead
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}