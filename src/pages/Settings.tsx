import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, Bell, Globe, Save } from "lucide-react";

export default function Settings() {
  // 1. Lógica de inicialização ultra segura
  const [darkMode, setDarkMode] = useState(() => {
    const salvo = localStorage.getItem("theme");
    return salvo === "dark"; // Se for vazio ou 'light', retorna false (branco)
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    estoqueBaixo: true
  });

  const [salvando, setSalvando] = useState(false);

  // 2. Aplicação do tema com limpeza de cache
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSave = () => {
    setSalvando(true);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    setTimeout(() => {
      setSalvando(false);
      alert("Configurações salvas!");
    }, 800);
  };

  return (
    /* MUDANÇA AQUI: bg-gray-50 fixo para o claro e dark:bg-slate-950 para o escuro */
    <div className="flex-1 p-6 bg-gray-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <SettingsIcon size={28} className="text-indigo-600" /> Configurações
          </h1>
        </header>

        <div className="space-y-6">
          {/* APARÊNCIA */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  {darkMode ? <Moon className="text-indigo-600" /> : <Sun className="text-orange-500" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Tema do Sistema</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Escolha entre o modo claro ou escuro</p>
                </div>
              </div>

              {/* SWITCH CASEIRO (MAIS SEGURO) */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`group relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
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
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Bell size={20} className="text-indigo-500" /> Notificações
            </h2>
            <div className="space-y-4">
              {Object.keys(notifications).map((key) => (
                <div key={key} className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-slate-800 last:border-0">
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={(notifications as any)[key]}
                    onChange={() => setNotifications({ ...notifications, [key]: !(notifications as any)[key] })}
                    className="w-5 h-5 accent-indigo-600"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            disabled={salvando}
          >
            {salvando ? "Processando..." : "Salvar Configurações"}
          </button>
        </div>
      </div>
    </div>
  );
}