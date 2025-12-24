import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, Bell } from "lucide-react";

export default function Settings() {
  // Estado inicial: Sempre tenta pegar o salvo, se não houver, assume FALSE (Light)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    estoqueBaixo: true
  });

  const [salvando, setSalvando] = useState(false);

  // CONTROLADOR DE TEMA: Aplica a classe no HTML inteiro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSave = () => {
    setSalvando(true);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    setTimeout(() => {
      setSalvando(false);
      alert("Configurações salvas com sucesso!");
    }, 800);
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <SettingsIcon size={28} className="text-indigo-600" /> Configurações
        </h1>

        <div className="space-y-6">
          {/* SEÇÃO: APARÊNCIA (COM SWITCH DE VOLTA) */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              {darkMode ? <Moon size={20} className="text-indigo-500" /> : <Sun size={20} className="text-orange-500" />} 
              Aparência
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-bold text-gray-700 dark:text-slate-300">Modo Escuro</p>
                <p className="text-sm text-gray-500 dark:text-slate-500">Alternar entre tema claro e escuro.</p>
              </div>
              
              {/* O BOTÃO MÁGICO QUE VOCÊ QUERIA */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'} flex items-center justify-center`}>
                  {darkMode ? <Moon size={12} className="text-indigo-600" /> : <Sun size={12} className="text-orange-500" />}
                </div>
              </button>
            </div>
          </section>

          {/* SEÇÃO: NOTIFICAÇÕES */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-indigo-500" /> Notificações do Sentinel
            </h2>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Alertas por E-mail', desc: 'Receba relatórios semanais e alertas críticos.' },
                { key: 'estoqueBaixo', label: 'Estoque Baixo', desc: 'Avisar quando um EPI atingir o nível mínimo.' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-gray-700 dark:text-slate-300">{item.label}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-500">{item.desc}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={(notifications as any)[item.key]}
                    onChange={() => setNotifications({...notifications, [item.key]: !(notifications as any)[item.key]})}
                    className="w-5 h-5 accent-indigo-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={handleSave} disabled={salvando} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95">
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </main>
  );
}