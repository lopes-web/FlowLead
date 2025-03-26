import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { useLeads } from "@/contexts/LeadContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface RedesignAssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName: string;
}

export function RedesignAssignModal({ open, onOpenChange, leadId, leadName }: RedesignAssignModalProps) {
  const { assignRedesign } = useLeads();
  const { user } = useAuth();
  
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar usuários ao abrir o modal
  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchCurrentAssignment();
    }
  }, [open, leadId]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, raw_user_meta_data");

      if (error) throw error;

      const formattedUsers = data.map(user => ({
        id: user.id,
        name: user.raw_user_meta_data?.name || user.email?.split('@')[0] || 'Usuário',
        email: user.email,
        avatar_url: user.raw_user_meta_data?.avatar_url
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Erro ao carregar lista de usuários");
    }
  };

  const fetchCurrentAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("redesign_assigned_to, redesign_deadline")
        .eq("id", leadId)
        .single();

      if (error) throw error;

      setAssignedTo(data.redesign_assigned_to);
      if (data.redesign_deadline) {
        // Converter para formato de data local para o input
        const date = new Date(data.redesign_deadline);
        setDeadline(date.toISOString().slice(0, 16));
      } else {
        setDeadline("");
      }
    } catch (error) {
      console.error("Erro ao buscar atribuição atual:", error);
    }
  };

  const handleAssignToMe = () => {
    if (user) {
      setAssignedTo(user.id);
    }
  };

  const handleAssignToNobody = () => {
    setAssignedTo(null);
    setDeadline("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Converter o deadline para formato ISO se houver um valor
      const deadlineValue = deadline ? new Date(deadline).toISOString() : null;
      
      await assignRedesign(leadId, assignedTo, deadlineValue);
      
      toast.success(
        assignedTo 
          ? (assignedTo === user?.id 
              ? "Você assumiu o redesign com sucesso!" 
              : "Redesign atribuído com sucesso!")
          : "Redesign removido com sucesso!"
      );
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atribuir redesign:", error);
      toast.error("Erro ao atribuir redesign");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para gerar cor de fundo para o avatar
  const getAvatarColor = (userId: string) => {
    const colors = [
      "bg-[#F59E0B]",
      "bg-[#8B5CF6]",
      "bg-[#EC4899]",
      "bg-[#14B8A6]",
      "bg-[#06B6D4]",
      "bg-[#3B82F6]"
    ];
    
    if (!userId) return colors[0];
    
    // Gera um índice baseado na soma dos códigos ASCII dos caracteres
    const sumChars = userId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[sumChars % colors.length];
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#1c2132] border-[#2e3446] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Atribuir Redesign
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="pb-2 border-b border-[#2e3446]">
            <p className="text-sm text-gray-400">
              Lead: <span className="text-white font-medium">{leadName}</span>
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assigned-to">Responsável pelo Redesign</Label>
            <Select value={assignedTo || ""} onValueChange={setAssignedTo}>
              <SelectTrigger className="bg-[#1c2132] border-[#2e3446]">
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c2132] border-[#2e3446] max-h-60">
                <SelectItem value="">Nenhum responsável</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={u.avatar_url || ""} />
                        <AvatarFallback className={`${getAvatarColor(u.id)} text-xs`}>
                          {getInitials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      {u.id === user?.id ? `Eu (${u.name})` : u.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex space-x-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs bg-[#1c2132] border-[#2e3446] hover:bg-[#2e3446]"
                onClick={handleAssignToMe}
              >
                Atribuir a mim
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs bg-[#1c2132] border-[#2e3446] hover:bg-[#2e3446]"
                onClick={handleAssignToNobody}
              >
                Remover atribuição
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo de Entrega</Label>
            <Input
              id="deadline"
              type="datetime-local"
              className="bg-[#1c2132] border-[#2e3446]"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={!assignedTo}
            />
            
            {assignedTo && !deadline && (
              <div className="flex items-start gap-2 text-yellow-500 text-xs mt-1">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Recomendamos definir um prazo para melhor organização.</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="bg-[#1c2132] border-[#2e3446] hover:bg-[#2e3446]"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#9b87f5] hover:bg-[#8878d9] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : (assignedTo ? "Atribuir Redesign" : "Remover Redesign")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 