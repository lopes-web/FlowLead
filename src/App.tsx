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
        <LeadProvider>
          <ProjectProvider>
            <TimeTrackingProvider>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rotas protegidas */}
                <Route path="/" element={
                  <Layout>
                    <Index view="dashboard" />
                  </Layout>
                } />
                
                <Route path="/leads" element={
                  <Layout>
                    <Index view="leads" />
                  </Layout>
                } />

                <Route path="/projects" element={
                  <Layout>
                    <Index view="projects" />
                  </Layout>
                } />

                <Route path="/time" element={
                  <Layout>
                    <Index view="timetracking" />
                  </Layout>
                } />

                {/* Redireciona qualquer rota não encontrada para o dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </TimeTrackingProvider>
          </ProjectProvider>
        </LeadProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
