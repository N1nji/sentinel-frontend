import { useState } from "react";
import { Settings as SettingsIcon, Bell, Globe, Save, Sun } from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    estoqueBaixo: true
  });

  const [salvando, setSalvando] = useState(false);

  const handleSave = () => {
    setSalvando(true);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    
    setTimeout(() => {
      setSalvando(false);
      alert("Configurações salvas com sucesso!");
    }, 800);
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <SettingsIcon size={28} className="text-indigo-600" /> Configurações
        </h1>

        <div className="space-y-6">
          {/* SEÇÃO: APARÊNCIA (APENAS VISUAL AGORA) */}
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sun size={20} className="text-orange-500" /> Aparência
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-bold text-gray-700">Modo de Exibição</p>
                <p className="text-sm text-gray-500">O sistema está operando no modo claro padrão.</p>
              </div>
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600">
                Padrão do Sistema
              </div>
            </div>
          </section>

          {/* SEÇÃO: NOTIFICAÇÕES */}
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-indigo-500" /> Notificações do Sentinel
            </h2>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Alertas por E-mail', desc: 'Receba relatórios semanais e alertas críticos.' },
                { key: 'estoqueBaixo', label: 'Estoque Baixo', desc: 'Avisar quando um EPI atingir o nível mínimo.' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-gray-700">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
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

          {/* SEÇÃO: IDIOMA */}
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Globe size={20} className="text-indigo-500" /> Idioma e Região
              </h2>
              <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded-full text-gray-500 uppercase">Em Breve</span>
            </div>
            <div className="h-12 bg-gray-50 rounded-xl border border-dashed border-gray-300" />
          </section>
        </div>

        {/* BOTÃO SALVAR */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={salvando}
            className={`flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${salvando ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {salvando ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} /> Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}