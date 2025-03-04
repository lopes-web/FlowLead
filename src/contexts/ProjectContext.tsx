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
      const closedLeadsWithoutProjects = leads.filter(lead => {
        const hasProject = projects.some(project => project.leadId === lead.id);
        return lead.status === "fechado" && !hasProject;
      });

      for (const lead of closedLeadsWithoutProjects) {
        try {
          await createProjectFromLead(lead);
          console.log(`Projeto criado automaticamente para o lead: ${lead.nome}`);
        } catch (error) {
          console.error(`Erro ao criar projeto para o lead ${lead.nome}:`, error);
        }
      }
    };

    handleClosedLeads();
  }, [leads]);

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

      setProjects(data || []);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    }
  }

  async function createProjectFromLead(lead: Lead) {
    if (!lead.id) {
      console.error("Lead sem ID não pode ser convertido em projeto");
      return;
    }

    const project: Omit<Project, "id"> = {
      leadId: lead.id,
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

    await addProject(project);
  }

  async function addProject(project: Omit<Project, "id">) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([project])
        .select();

      if (error) {
        console.error("Erro ao adicionar projeto:", error);
        return;
      }

      if (data) {
        setProjects((prev) => [data[0], ...prev]);
        await fetchProjects(); // Recarrega os projetos para garantir sincronização
      }
    } catch (error) {
      console.error("Erro ao adicionar projeto:", error);
    }
  }

  async function updateProject(id: string, project: Partial<Project>) {
    try {
      const { error } = await supabase
        .from("projects")
        .update(project)
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar projeto:", error);
        return;
      }

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...project } : p))
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

      setProjects((prev) => prev.filter((p) => p.id !== id));
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