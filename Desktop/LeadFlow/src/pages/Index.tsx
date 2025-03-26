import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Kanban } from "@/components/Kanban";
import { LeadModal } from "@/components/LeadModal";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  LayoutDashboard, 
  KanbanSquare,
  Timer,
  Zap,
  FolderKanban,
  UserCircle
} from "lucide-react";
import TimeTracking from "./TimeTracking";
import { useNavigate } from "react-router-dom";
import { ProjectsKanban } from "@/components/ProjectsKanban";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/NotificationDropdown";

interface IndexProps {
  view?: "dashboard" | "leads" | "projects" | "timetracking";
}

const Index = ({ view = "dashboard" }: IndexProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | undefined>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleOpenModal = (leadId?: string) => {
    setEditingLeadId(leadId);
    setModalOpen(true);
  };

  // Função para obter as iniciais do email
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent tracking-tight">
              FlowLead
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-1">
              <Button
                variant={view === "dashboard" ? "secondary" : "ghost"}
                onClick={() => navigate("/")}
                className="gap-2"
                size="sm"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={view === "leads" ? "secondary" : "ghost"}
                onClick={() => navigate("/leads")}
                className="gap-2"
                size="sm"
              >
                <KanbanSquare className="h-4 w-4" />
                Leads
              </Button>
              <Button
                variant={view === "projects" ? "secondary" : "ghost"}
                onClick={() => navigate("/projects")}
                className="gap-2"
                size="sm"
              >
                <FolderKanban className="h-4 w-4" />
                Projetos
              </Button>
              <Button
                variant={view === "timetracking" ? "secondary" : "ghost"}
                onClick={() => navigate("/time")}
                className="gap-2"
                size="sm"
              >
                <Timer className="h-4 w-4" />
                Tempo
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={() => handleOpenModal()}
                className="gap-2"
                size="sm"
              >
                <PlusCircle className="h-4 w-4" />
                Novo Lead
              </Button>
              <NotificationDropdown />
              <Button
                variant="ghost"
                onClick={() => navigate("/profile")}
                className="gap-2 p-0"
                size="sm"
              >
                <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                  <AvatarImage 
                    src={user?.user_metadata?.avatar_url || ""} 
                    alt={user?.email || "Usuário"} 
                  />
                  <AvatarFallback className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] text-white text-xs">
                    {user ? getInitials(user.email) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-hidden">
          {view === "dashboard" && <Dashboard />}
          {view === "leads" && <Kanban onEditLead={handleOpenModal} />}
          {view === "projects" && <ProjectsKanban />}
          {view === "timetracking" && <TimeTracking />}
        </main>
      </div>

      {modalOpen && (
        <LeadModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          leadId={editingLeadId}
        />
      )}
    </div>
  );
};

export default Index;