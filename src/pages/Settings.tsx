import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, Bell } from "lucide-react";

export default function Settings() {
  // 🔹 Inicia baseado no que REALMENTE está aplicado no documento ou no localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    estoqueBaixo: true
  });

  const [salvando, setSalvando] = useState(false);

  // 🔹 Sincroniza o tema sempre que o estado mudar
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const handleSave = () => {
    setSalvando(true);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    setTimeout(() => {
      setSalvando(false);
      alert("Configurações salvas!");
    }, 800);
  };

  return (
    // Removido o userInteracted para permitir que a tela se auto-corrija ao montar
    <div className="flex-1 p-6 bg-gray-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <SettingsIcon size={28} className="text-indigo-600" />
            Configurações
          </h1>
        </header>

        <div className="space-y-6">
          {/* APARÊNCIA */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
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

              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${
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

          {/* O restante do seu código de notificações permanece igual... */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Bell size={20} className="text-indigo-500" />
              Notificações
            </h2>
            <div className="space-y-4">
               {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-slate-800 last:border-0">
                  <span className="text-gray-700 dark:text-gray-300">
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