import { useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, Bell, Globe } from "lucide-react";
import { useTheme } from "../context/ThemeContext"; // 🔹 Importe o hook do seu contexto

export default function Settings() {
  // 🔹 AGORA CONSUMIMOS O TEMA GLOBALMENTE
  const { darkMode, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    estoqueBaixo: true
  });

  const [salvando, setSalvando] = useState(false);

  // 🔹 Salvar apenas as notificações (o tema já salva sozinho no contexto)
  const handleSave = () => {
    setSalvando(true);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    
    setTimeout(() => {
      setSalvando(false);
      alert("Configurações de notificações salvas!");
    }, 800);
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <SettingsIcon size={28} className="text-indigo-600" />
            Configurações
          </h1>
        </header>

        <div className="space-y-6">
          {/* APARÊNCIA (GLOBALIZADA) */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  {darkMode ? (
                    <Moon className="text-indigo-600" />
                  ) : (
                    <Sun className="text-orange-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    Tema do Sistema
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Atualmente em modo {darkMode ? 'Escuro' : 'Claro'}
                  </p>
                </div>
              </div>

              {/* Toggle que agora dispara a função global */}
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  darkMode ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                    darkMode ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* NOTIFICAÇÕES */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-800 transition-colors">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Bell size={20} className="text-indigo-500" />
              Notificações
            </h2>
            <div className="space-y-4">
               {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-slate-800 last:border-0">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {key === "estoqueBaixo" ? "Alertas de Estoque" : key === "email" ? "Notificações por E-mail" : "Notificações Push"}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setNotifications({...notifications, [key]: !value})}
                    className="w-5 h-5 accent-indigo-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* IDIOMA */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-800 opacity-60 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                <Globe size={20} className="text-indigo-500" />
                Idioma e Região
              </h2>
              <span className="text-[10px] font-black bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full text-gray-500 uppercase tracking-wider">
                Em Breve
              </span>
            </div>
            <div className="h-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center">
              <span className="text-xs text-gray-400">Tradução automática em desenvolvimento</span>
            </div>
          </section>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={salvando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {salvando ? "Processando..." : "Salvar Configurações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}