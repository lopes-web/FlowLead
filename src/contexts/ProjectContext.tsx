import { createContext, useContext, useState, useEffect } from "react";
import { Project, ProjectStatus } from "@/types/project";
import { supabase } from "@/lib/supabase";
import { useLeads } from "./LeadContext";

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  moveProject: (id: string, newStatus: ProjectStatus) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { leads } = useLeads();

  useEffect(() => {
    fetchProjects();
  }, []);

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
      value={{ projects, addProject, updateProject, deleteProject, moveProject }}
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