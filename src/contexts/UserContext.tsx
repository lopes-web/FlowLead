import React, { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  raw_user_meta_data: {
    name?: string;
    avatar_url?: string;
  };
}

interface UserContextProps {
  users: User[];
  loading: boolean;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadUsers = async () => {
    if (!user) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Desmarcando usuário 5bed7377-3245-489f-8d5d-f5634129599f
      console.log("Usuário atual:", JSON.stringify(user, null, 2));
      
      // Usuários reais do sistema (agora incluindo o granadinha123)
      const realUsers = [
        {
          id: "0ba7925a-a6e8-4072-b979-23117acdadfe",
          email: "limacntb@gmail.com",
          raw_user_meta_data: {
            name: "Eduardo Lima"
          }
        },
        {
          id: "8c12c2c8-01f2-48d7-83ab-f2cc20d72e23",
          email: "lopes.webcontato@gmail.com",
          raw_user_meta_data: {
            name: "Lopes"
          }
        },
        {
          id: "5bed7377-3245-489f-8d5d-f5634129599f",
          email: "granadinha123@gmail.com",
          raw_user_meta_data: {
            name: "Lopess"
          }
        }
      ];
      
      // Verifica se o usuário atual está na lista pelo ID ou email
      const currentUserInList = realUsers.some(u => 
        String(u.id) === String(user.id) || 
        String(u.email) === String(user.email)
      );
      
      // Se não estiver, adiciona-o
      if (!currentUserInList) {
        console.log("Adicionando usuário atual à lista:", user.id);
        realUsers.push({
          id: String(user.id),
          email: String(user.email || ""),
          raw_user_meta_data: {
            name: user.user_metadata?.name || (user.email ? String(user.email).split('@')[0].toUpperCase() : "")
          }
        });
      }
      
      console.log("Lista final de usuários:", realUsers);
      
      // Log para ajudar no debug
      realUsers.forEach(u => {
        console.log(`Usuário ${u.id} (${typeof u.id}): ${u.email} - ${u.raw_user_meta_data?.name}`);
      });
      
      setUsers(realUsers);
      
    } catch (error) {
      console.error("Erro ao preparar lista de usuários:", error);
      
      // Fallback: usar apenas o usuário atual
      const currentUser = {
        id: String(user.id),
        email: String(user.email || ""),
        raw_user_meta_data: {
          ...user.user_metadata,
          name: user.user_metadata?.name || (user.email ? String(user.email).split('@')[0].toUpperCase() : "")
        }
      };
      
      setUsers([currentUser]);
      console.log("Fallback - apenas usuário atual:", [currentUser]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  return (
    <UserContext.Provider value={{ users, loading, refreshUsers: loadUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
} 