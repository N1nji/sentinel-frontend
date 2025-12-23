import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  UsersIcon,
  ShieldCheckIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// Componentes e Serviços
import Card from "../components/Card";
import {
  getRiscosPorSetor,
  getEpisStatus,
  getColaboradoresPorSetor,
} from "../services/reportsService";

export default function Relatorios() {
  const [riscos, setRiscos] = useState<any[]>([]);
  const [episStatus, setEpisStatus] = useState<any>({ total: 0, vencidos: [], semEstoque: [] });
  const [colabs, setColabs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  async function loadReportsWithFilter() {
    try {
      setLoading(true);
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const [r1, r2, r3] = await Promise.all([
        getRiscosPorSetor(params),
        getEpisStatus(params),
        getColaboradoresPorSetor(params),
      ]);

      setRiscos(r1 || []);
      setEpisStatus(r2 || { total: 0, vencidos: [], semEstoque: [] });
      setColabs(r3);
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReportsWithFilter(); }, []);

  // FUNÇÃO PARA CALCULAR O SCORE BASEADO NA MATRIZ DE RISCO (1 a 5)
  function calcularScore(r: any) {
    const altos = (r.porClassificacao?.alto || 0) + (r.porClassificacao?.critico || 0);
    if (altos > 0) return 1; // Score baixo = perigo alto
    if ((r.porClassificacao?.medio || 0) > 2) return 2;
    if ((r.porClassificacao?.baixo || 0) > 0) return 4;
    return 5;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative mb-4">
             <ChartBarIcon className="h-16 w-16 text-indigo-600/20 animate-pulse mx-auto" />
             <ChartBarIcon className="h-16 w-16 text-indigo-600 absolute top-0 left-1/2 -translate-x-1/2 animate-bounce" />
          </div>
          <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Sentinel processando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-1">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheckIcon className="h-10 w-10 text-indigo-600" />
            Painel de Auditoria
          </h1>
          <p className="text-slate-500 font-medium ml-1">Dados consolidados do Mapa de Riscos.</p>
        </div>
        <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2">
          <DocumentArrowDownIcon className="h-5 w-5" /> Relatório Completo
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Data Inicial</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-600" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Data Final</label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-600" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button onClick={loadReportsWithFilter} className="bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest">
            Filtrar Agora
          </button>
        </div>
      </div>

      {/* WIDGETS DE RESUMO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Setores", val: riscos.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Riscos Totais", val: riscos.reduce((s, r) => s + (r.totalRiscos || 0), 0), color: "text-orange-600", bg: "bg-orange-50" },
          { label: "EPIs Vencidos", val: episStatus.vencidos.length, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Colaboradores", val: "Consolidado", color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <p className={`text-3xl font-black ${item.color}`}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* MAPA DE CRITICIDADE - ONDE A MÁGICA ACONTECE */}
      <Card title="Análise de Perigo por Setor">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {riscos.map((r) => {
            // AQUI NÓS MAPEAMOS OS 5 NÍVEIS DA TELA DE RISCOS PARA AS BARRAS
            const total = r.totalRiscos || 0;
            
            // Agrupamos Crítico + Alto para a barra vermelha
            const graveCount = (r.porClassificacao?.critico || 0) + (r.porClassificacao?.alto || 0);
            // Agrupamos Médio + Moderado para a barra amarela
            const medioCount = (r.porClassificacao?.medio || 0) + (r.porClassificacao?.moderado || 0);
            // Baixo continua baixo
            const baixoCount = (r.porClassificacao?.baixo || 0);

            const gravePct = total > 0 ? (graveCount / total) * 100 : 0;
            const medioPct = total > 0 ? (medioCount / total) * 100 : 0;
            const baixoPct = total > 0 ? (baixoCount / total) * 100 : 0;

            const isCritico = graveCount > 0;

            return (
              <div key={r.setorId} className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white transition-all shadow-sm hover:shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{r.setorNome}</h4>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                      {total} Riscos Registrados
                    </span>
                  </div>
                  <div className={`text-center px-4 py-2 rounded-2xl border-2 ${isCritico ? 'border-rose-500 bg-rose-50' : 'border-emerald-500 bg-emerald-50'}`}>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Segurança</p>
                    <p className={`text-sm font-black ${isCritico ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {calcularScore(r)} / 5
                    </p>
                  </div>
                </div>

                {/* BARRA DE PROGRESSO MULTICOLORIDA */}
                <div className="space-y-4">
                  <div className="flex h-4 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${gravePct}%` }} />
                    <div className="bg-amber-400 h-full transition-all duration-1000" style={{ width: `${medioPct}%` }} />
                    <div className="bg-emerald-400 h-full transition-all duration-1000" style={{ width: `${baixoPct}%` }} />
                  </div>

                  {/* LEGENDAS OBJETIVAS */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                      <p className="text-[9px] font-black text-rose-500 uppercase">Grave/Crítico</p>
                      <p className="text-sm font-black text-slate-700">{graveCount}</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                      <p className="text-[9px] font-black text-amber-500 uppercase">Médio/Mod.</p>
                      <p className="text-sm font-black text-slate-700">{medioCount}</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                      <p className="text-[9px] font-black text-emerald-500 uppercase">Baixo</p>
                      <p className="text-sm font-black text-slate-700">{baixoCount}</p>
                    </div>
                  </div>

                  {isCritico && (
                    <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-2xl border border-rose-100 animate-pulse">
                      <ExclamationCircleIcon className="h-5 w-5" />
                      <p className="text-[10px] font-black uppercase tracking-tighter">Ação imediata recomendada para este setor</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* LISTA DE COLABORADORES POR SETOR */}
      <Card title="Efetivo Alocado">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {colabs && Object.entries(colabs).map(([setor, lista]: any) => (
            <div key={setor} className="bg-white p-6 rounded-[2rem] border border-slate-100">
              <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b pb-2 mb-4">{setor}</h5>
              <ul className="space-y-2">
                {lista.map((c: any) => (
                  <li key={c.id} className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">{c.nome}</span>
                    <span className="text-[9px] font-mono text-slate-400">#{c.matricula}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}