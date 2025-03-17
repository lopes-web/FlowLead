import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("Login - Renderizando com user:", user);
  
  useEffect(() => {
    console.log("Login - useEffect com user:", user);
    
    // Se o usuário já estiver autenticado, redireciona para a página principal
    if (user) {
      console.log("Login - Usuário já autenticado, redirecionando para /");
      navigate("/");
    }
    
    // Verificar se há uma mensagem de sucesso no estado da navegação
    if (location.state && location.state.message) {
      console.log("Login - Mensagem recebida:", location.state.message);
      setSuccess(location.state.message);
      
      // Limpar o estado para não mostrar a mensagem novamente após refresh
      window.history.replaceState({}, document.title);
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login - Iniciando submit com:", { email, password: "***" });
    
    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      
      console.log("Login - Chamando signIn");
      const { error } = await signIn(email, password);
      
      console.log("Login - Resultado do signIn:", { error });
      
      if (error) {
        console.error("Login - Erro ao fazer login:", error);
        setError(error.message || "Erro ao fazer login");
        return;
      }
      
      console.log("Login - Login bem-sucedido, redirecionando para /");
      // Redireciona para a página principal após o login
      navigate("/");
    } catch (err: any) {
      console.error("Login - Erro inesperado:", err);
      setError(err.message || "Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] p-2 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent tracking-tight">
            LeadFlow
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Faça login na sua conta
          </h2>
        </div>

        {success && (
          <div className="rounded-md bg-[#1c2132] border border-green-500/30 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-500">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-[#1c2132] border-[#2e3446] text-white placeholder:text-gray-500"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Senha
                </Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-[#1c2132] border-[#2e3446] text-white placeholder:text-gray-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-[#1c2132] border border-red-500/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-500">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full bg-[#9b87f5] hover:bg-[#8b77e5] text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Não tem uma conta?{" "}
            <Link to="/register" className="font-medium text-[#9b87f5] hover:text-[#8b77e5]">
              Registre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 