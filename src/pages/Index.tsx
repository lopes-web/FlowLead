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
  Zap
} from "lucide-react";
import { TimeTrackingProvider } from "@/contexts/TimeTrackingContext";
import TimeTracking from "./TimeTracking";

const Index = () => {
  const [view, setView] = useState<"dashboard" | "kanban" | "timetracking">("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | undefined>();

  const handleOpenModal = (leadId?: string) => {
    setEditingLeadId(leadId);
    setModalOpen(true);
  };

  return (
    <TimeTrackingProvider>
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
                  variant={view === "dashboard" ? "secondary" : "ghost"}
                  onClick={() => setView("dashboard")}
                  className="gap-2"
                  size="sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={view === "kanban" ? "secondary" : "ghost"}
                  onClick={() => setView("kanban")}
                  className="gap-2"
                  size="sm"
                >
                  <KanbanSquare className="h-4 w-4" />
                  Kanban
                </Button>
                <Button
                  variant={view === "timetracking" ? "secondary" : "ghost"}
                  onClick={() => setView("timetracking")}
                  className="gap-2"
                  size="sm"
                >
                  <Timer className="h-4 w-4" />
                  Tempo
                </Button>
              </div>
              <Button
                variant="default"
                onClick={() => handleOpenModal()}
                className="gap-2"
                size="sm"
              >
                <PlusCircle className="h-4 w-4" />
                Novo Lead
              </Button>
            </div>
          </div>

          {view === "dashboard" && <Dashboard />}
          {view === "kanban" && <Kanban onEditLead={handleOpenModal} />}
          {view === "timetracking" && <TimeTracking />}
        </div>

        {modalOpen && (
          <LeadModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            leadId={editingLeadId}
          />
        )}
      </div>
    </TimeTrackingProvider>
  );
};

export default Index;