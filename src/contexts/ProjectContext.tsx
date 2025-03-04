import { createContext, useContext, useState, useEffect } from "react";
import { Project, ProjectStatus } from "@/types/project";
import { supabase } from "@/lib/supabase";
import { useLeads } from "./LeadContext";
import { Lead } from "@/types/lead";

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  moveProject: (id: string, newStatus: ProjectStatus) => Promise<void>;
  createProjectFromLead: (lead: Lead) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { leads } = useLeads();

  useEffect(() => {
    fetchProjects();
  }, []);

  // Monitora leads fechados e cria projetos automaticamente
  useEffect(() => {
    const handleClosedLeads = async () => {
      console.log("Verificando leads fechados...");
      console.log("Total de leads:", leads.length);
      console.log("Total de projetos:", projects.length);

      const closedLeadsWithoutProjects = leads.filter(lead => {
        const hasProject = projects.some(project => project.leadId === lead.id);
        const isClosed = lead.status === "fechado";
        console.log(`Lead ${lead.nome}: fechado=${isClosed}, tem projeto=${hasProject}`);
        return isClosed && !hasProject;
      });

      console.log("Leads fechados sem projetos:", closedLeadsWithoutProjects.length);

      for (const lead of closedLeadsWithoutProjects) {
        try {
          console.log(`Criando projeto para o lead: ${lead.nome}`);
          await createProjectFromLead(lead);
          console.log(`Projeto criado com sucesso para o lead: ${lead.nome}`);
        } catch (error) {
          console.error(`Erro ao criar projeto para o lead ${lead.nome}:`, error);
        }
      }
    };

    handleClosedLeads();
  }, [leads, projects]);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar projetos:", error);
        return;
      }

      const formattedProjects = data?.map(project => ({
        ...project,
        leadId: project.lead_id,
        tipo_projeto: project.tipo_projeto,
        prazo_entrega: project.prazo_entrega,
        arquivos_recebidos: project.arquivos_recebidos,
        created_at: project.created_at,
        updated_at: project.updated_at
      })) || [];

      setProjects(formattedProjects);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    }
  }

  async function createProjectFromLead(lead: Lead) {
    if (!lead.id) {
      console.error("Lead sem ID não pode ser convertido em projeto");
      return;
    }

    // Verifica se já existe um projeto para este lead
    const existingProject = projects.find(p => p.leadId === lead.id);
    if (existingProject) {
      console.log(`Projeto já existe para o lead ${lead.nome}`);
      return;
    }

    const project = {
      lead_id: lead.id,
      nome: lead.nome,
      cliente: lead.nome,
      tipo_projeto: lead.tipo_projeto || "",
      status: "solicitar_arquivos",
      valor: lead.orcamento || 0,
      descricao: lead.necessidades || "",
      observacoes: lead.observacoes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([project])
        .select();

      if (error) {
        console.error("Erro ao adicionar projeto:", error);
        throw error;
      }

      if (data) {
        const formattedProject = {
          ...data[0],
          leadId: data[0].lead_id,
          tipo_projeto: data[0].tipo_projeto,
          prazo_entrega: data[0].prazo_entrega,
          arquivos_recebidos: data[0].arquivos_recebidos,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at
        };
        console.log(`Projeto criado com sucesso: ${formattedProject.nome}`);
        setProjects(prev => [formattedProject, ...prev]);
      }
    } catch (error) {
      console.error("Erro ao adicionar projeto:", error);
      throw error;
    }
  }

  async function addProject(project: Omit<Project, "id">) {
    try {
      const dbProject = {
        lead_id: project.leadId,
        nome: project.nome,
        cliente: project.cliente,
        tipo_projeto: project.tipo_projeto,
        status: project.status,
        valor: project.valor,
        descricao: project.descricao || null,
        observacoes: project.observacoes || null,
        prazo_entrega: project.prazo_entrega || null,
        arquivos_recebidos: project.arquivos_recebidos || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("projects")
        .insert([dbProject])
        .select();

      if (error) {
        console.error("Erro ao adicionar projeto:", error);
        return;
      }

      if (data) {
        const formattedProject = {
          ...data[0],
          leadId: data[0].lead_id,
          tipo_projeto: data[0].tipo_projeto,
          prazo_entrega: data[0].prazo_entrega,
          arquivos_recebidos: data[0].arquivos_recebidos,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at
        };
        setProjects(prev => [formattedProject, ...prev]);
      }
    } catch (error) {
      console.error("Erro ao adicionar projeto:", error);
    }
  }

  async function updateProject(id: string, project: Partial<Project>) {
    try {
      const dbProject = {
        ...(project.leadId && { lead_id: project.leadId }),
        ...(project.nome && { nome: project.nome }),
        ...(project.cliente && { cliente: project.cliente }),
        ...(project.tipo_projeto && { tipo_projeto: project.tipo_projeto }),
        ...(project.status && { status: project.status }),
        ...(project.valor && { valor: project.valor }),
        ...(project.descricao && { descricao: project.descricao }),
        ...(project.observacoes && { observacoes: project.observacoes }),
        ...(project.prazo_entrega && { prazo_entrega: project.prazo_entrega }),
        ...(project.arquivos_recebidos && { arquivos_recebidos: project.arquivos_recebidos }),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("projects")
        .update(dbProject)
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar projeto:", error);
        return;
      }

      setProjects(prev =>
        prev.map(p => p.id === id ? { ...p, ...project } : p)
      );
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
    }
  }

  async function deleteProject(id: string) {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) {
        console.error("Erro ao deletar projeto:", error);
        return;
      }

      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Erro ao deletar projeto:", error);
    }
  }

  async function moveProject(id: string, newStatus: ProjectStatus) {
    await updateProject(id, { status: newStatus });
  }

  return (
    <ProjectContext.Provider
      value={{ 
        projects, 
        addProject, 
        updateProject, 
        deleteProject, 
        moveProject,
        createProjectFromLead 
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
} 