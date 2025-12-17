import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulário enviado");

    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      console.log("Tentando criar conta com:", { email, name });

      // Registrar com nome como metadado
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      console.log("Resposta do registro:", data, error);

      if (error) {
        console.error("Erro ao criar conta:", error);
        setError(error.message || "Erro ao criar conta");
        return;
      }

      if (data && data.user) {
        console.log("Conta criada com sucesso:", data.user);
        // Redireciona para a página de login após o registro
        navigate("/login", {
          state: {
            message: "Conta criada com sucesso! Verifique seu email para confirmar o cadastro."
          }
        });
      } else {
        console.error("Dados de usuário não encontrados na resposta:", data);
        setError("Não foi possível criar a conta. Tente novamente.");
      }
    } catch (err: any) {
      console.error("Erro inesperado:", err);
      setError(err.message || "Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#010907] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-gradient-to-r from-[#03BC89] to-[#02a87a] p-2 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-bold bg-gradient-to-r from-[#03BC89] to-[#02a87a] bg-clip-text text-transparent tracking-tight">
            FlowLead
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Crie sua conta
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <Label htmlFor="name" className="text-white">
                Nome Completo
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full bg-[#0a1210] border-[#1a2a25] text-white placeholder:text-gray-500"
                placeholder="Seu Nome Completo"
              />
            </div>
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
                className="mt-1 block w-full bg-[#0a1210] border-[#1a2a25] text-white placeholder:text-gray-500"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-[#0a1210] border-[#1a2a25] text-white placeholder:text-gray-500"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-400">
                A senha deve ter pelo menos 6 caracteres
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-white">
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full bg-[#0a1210] border-[#1a2a25] text-white placeholder:text-gray-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-[#0a1210] border border-red-500/30 p-4">
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
              className="w-full bg-[#03BC89] hover:bg-[#02a87a] text-white"
              disabled={loading}
              onClick={() => console.log("Botão de criar conta clicado")}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Já tem uma conta?{" "}
            <Link to="/login" className="font-medium text-[#03BC89] hover:text-[#02a87a]">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 