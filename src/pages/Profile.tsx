import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Calendar, Shield, ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Função para obter as iniciais do email
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Função para alterar a senha
  const handleChangePassword = async () => {
    if (!newPassword) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma nova senha.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar sua senha.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer upload da foto de perfil
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive"
      });
      return;
    }

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "O arquivo deve ser uma imagem.",
        variant: "destructive"
      });
      return;
    }

    setUploadLoading(true);
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload do arquivo para o Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Atualizar metadados do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(avatarUrl);
      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível fazer upload da imagem.",
        variant: "destructive"
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Função para fazer logout
  const handleSignOut = async () => {
    await signOut();
  };

  // Função para voltar à página inicial
  const handleGoBack = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleGoBack}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent tracking-tight">
              Meu Perfil
            </h1>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna 1: Informações do perfil */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center">
              <div className="relative group">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] text-white text-xl">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-3 right-0 h-8 w-8 rounded-full bg-background shadow-md"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <CardTitle className="text-xl">{user.email}</CardTitle>
              <CardDescription>
                {user.user_metadata?.name || "Usuário LeadFlow"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Criado em: {formatDate(user.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Último login: {formatDate(user.last_sign_in_at || user.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Função: {user.role || "Usuário"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coluna 2: Configurações */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>
                Gerencie suas configurações de conta e segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="password" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="password">Senha</TabsTrigger>
                  <TabsTrigger value="preferences">Preferências</TabsTrigger>
                </TabsList>
                <TabsContent value="password" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite sua nova senha"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Senha</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua nova senha"
                      />
                    </div>
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Alterar Senha
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="preferences" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Preferências do usuário serão implementadas em breve.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                ID: {user.id}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 