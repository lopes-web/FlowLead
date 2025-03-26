import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, user: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há uma sessão ativa ao carregar
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Verificando sessão...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          return;
        }
        
        console.log("Sessão verificada:", data.session);
        
        if (data.session) {
          console.log("Usuário encontrado:", data.session.user);
          setUser(data.session.user);
        } else {
          console.log("Nenhuma sessão ativa encontrada");
        }
      } catch (err) {
        console.error("Erro inesperado ao verificar sessão:", err);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Configurar listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento de autenticação:", event);
        console.log("Sessão:", session);
        setUser(session?.user || null);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentando fazer login com:", email);
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log("Resposta do login:", data, error);
      
      if (data && data.user) {
        console.log("Login bem-sucedido, usuário:", data.user);
        setUser(data.user);
      }
      
      return { error };
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { error, user: data.user };
    } catch (err) {
      console.error("Erro ao criar conta:", err);
      return { error: err, user: null };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 