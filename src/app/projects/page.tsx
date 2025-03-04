import { ProjectsKanban } from "@/components/ProjectsKanban";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  KanbanSquare,
  Timer,
  Zap,
  FolderKanban,
  PlusCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LeadModal } from "@/components/LeadModal";
import { useState } from "react";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [showLeadModal, setShowLeadModal] = useState(false);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent tracking-tight">
              LeadFlow
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-1">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="gap-2"
                size="sm"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/leads")}
                className="gap-2"
                size="sm"
              >
                <KanbanSquare className="h-4 w-4" />
                Leads
              </Button>
              <Button
                variant="secondary"
                className="gap-2"
                size="sm"
              >
                <FolderKanban className="h-4 w-4" />
                Projetos
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/tempo")}
                className="gap-2"
                size="sm"
              >
                <Timer className="h-4 w-4" />
                Tempo
              </Button>
            </div>
            <Button
              onClick={() => setShowLeadModal(true)}
              className="gap-2"
              size="sm"
            >
              <PlusCircle className="h-4 w-4" />
              Novo Lead
            </Button>
          </div>
        </div>

        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            <ProjectsKanban
              onEditProject={(projectId) => {
                // TODO: Implementar modal de edição
                console.log("Editar projeto:", projectId);
              }}
            />
          </div>
        </main>
      </div>
      <LeadModal open={showLeadModal} onOpenChange={setShowLeadModal} />
    </div>
  );
} 