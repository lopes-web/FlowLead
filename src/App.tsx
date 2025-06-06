import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import { Layout } from "@/components/Layout";
import { LeadProvider } from "@/contexts/LeadContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { TimeTrackingProvider } from "@/contexts/TimeTrackingContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { UserProvider } from "@/contexts/UserContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { Profile } from "@/pages/Profile";
import TasksPage from "@/pages/Tasks";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UserProvider>
          <TaskProvider>
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

              <Route path="/tarefas" element={
                <Layout>
                  <TasksPage />
                </Layout>
              } />

              <Route path="/profile" element={
                <Layout>
                  <Profile />
                </Layout>
              } />

              {/* Redireciona qualquer rota não encontrada para o login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster />
          </TaskProvider>
        </UserProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
