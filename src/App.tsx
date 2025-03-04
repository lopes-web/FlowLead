import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { LeadProvider } from "@/contexts/LeadContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import ProjectsPage from "@/app/projects/page";

function App() {
  return (
    <LeadProvider>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Routes>
        <Toaster />
      </ProjectProvider>
    </LeadProvider>
  );
}

export default App;
