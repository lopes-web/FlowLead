import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, CheckCircle } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent tracking-tight">
              LeadFlow
            </h1>
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              crie uma nova conta
            </Link>
          </p>
        </div>
        
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-sm text-green-700">{success}</div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
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
      </div>
    </div>
  );
} 