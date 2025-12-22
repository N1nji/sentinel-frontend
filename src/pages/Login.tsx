import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Loader2, ShieldCheck } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [erro, setErro] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErro("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, senha });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      // Mensagem genérica para segurança
      setErro("Credenciais inválidas. Verifique seus dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-4">
      
      {/* CARD PRINCIPAL */}
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/10 relative overflow-hidden">
          
          {/* DECORAÇÃO DE FUNDO */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
          
          <div className="relative">
            {/* LOGO / ÍCONE */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">
              Sentinel <span className="text-indigo-500">AI</span>
            </h2>
            <p className="text-slate-400 text-center text-sm mb-8 font-medium">
              Gestão inteligente de EPI e Segurança
            </p>

            {erro && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 mb-6 rounded-xl text-xs font-bold text-center animate-shake">
                ⚠️ {erro}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  E-mail Corporativo
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="exemplo@empresa.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Senha de Acesso
                </label>
                <div className="relative group">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  "Acessar Painel"
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
          Protegido por Sentinel Engine v2.0
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}