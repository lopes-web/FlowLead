import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { LeadProvider } from "@/contexts/LeadContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { TimeTrackingProvider } from "@/contexts/TimeTrackingContext";

function App() {
  return (
    <LeadProvider>
      <ProjectProvider>
        <TimeTrackingProvider>
          <Routes>
            <Route path="/" element={<Index view="dashboard" />} />
            <Route path="/leads" element={<Index view="leads" />} />
            <Route path="/projects" element={<Index view="projects" />} />
            <Route path="/time" element={<Index view="timetracking" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </TimeTrackingProvider>
      </ProjectProvider>
    </LeadProvider>
  );
}

export default App;
