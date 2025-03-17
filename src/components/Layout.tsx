import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  console.log("Layout - Estado atual:", { user, loading });

  useEffect(() => {
    console.log("Layout - useEffect:", { user, loading });
    
    if (!loading && !user) {
      console.log("Layout - Redirecionando para /login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log("Layout - Renderizando loading");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Se não houver usuário, redireciona para o login
  if (!user) {
    console.log("Layout - Redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Se o usuário estiver autenticado, renderiza o conteúdo
  console.log("Layout - Renderizando conteúdo");
  return <>{children}</>;
} 