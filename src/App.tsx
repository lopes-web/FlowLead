import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { LeadProvider } from "@/contexts/LeadContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { TimeTrackingProvider } from "@/contexts/TimeTrackingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Layout } from "@/components/Layout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas */}
          <Route path="/" element={
            <Layout>
              <LeadProvider>
                <ProjectProvider>
                  <TimeTrackingProvider>
                    <Index view="dashboard" />
                  </TimeTrackingProvider>
                </ProjectProvider>
              </LeadProvider>
            </Layout>
          } />
          
          <Route path="/leads" element={
            <Layout>
              <LeadProvider>
                <ProjectProvider>
                  <TimeTrackingProvider>
                    <Index view="leads" />
                  </TimeTrackingProvider>
                </ProjectProvider>
              </LeadProvider>
            </Layout>
          } />

          <Route path="/projects" element={
            <Layout>
              <LeadProvider>
                <ProjectProvider>
                  <TimeTrackingProvider>
                    <Index view="projects" />
                  </TimeTrackingProvider>
                </ProjectProvider>
              </LeadProvider>
            </Layout>
          } />

          <Route path="/time" element={
            <Layout>
              <LeadProvider>
                <ProjectProvider>
                  <TimeTrackingProvider>
                    <Index view="timetracking" />
                  </TimeTrackingProvider>
                </ProjectProvider>
              </LeadProvider>
            </Layout>
          } />

          {/* Redireciona qualquer rota não encontrada para o dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
