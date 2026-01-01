import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTheme } from "../context/ThemeContext"; // IMPORTADO
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
  const { darkMode } = useTheme(); // CONSUMINDO TEMA
  const [riscos, setRiscos] = useState<any[]>([]);
  const [episStatus, setEpisStatus] = useState<any>({ total: 0, vencidos: [], semEstoque: [] });
  const [colabs, setColabs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // Lógica de PDF
  async function exportRelatorioPdf() {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();

    doc.setFillColor(31, 41, 55); 
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("SENTINEL - SEGURANÇA DO TRABALHO", 15, 20);
    doc.setFontSize(10);
    doc.text(`RELATÓRIO TÉCNICO GERADO EM: ${dateStr}`, 15, 30);
    doc.text(`PERÍODO: ${from || "INÍCIO"} ATÉ ${to || "ATUAL"}`, 150, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("1. RESUMO EXECUTIVO", 15, 50);
    
    autoTable(doc, {
      startY: 55,
      head: [['Indicador', 'Quantidade']],
      body: [
        ['Setores Mapeados', riscos.length],
        ['Total de Riscos Identificados', riscos.reduce((s, r) => s + (r.totalRiscos || 0), 0)],
        ['EPIs com CA Vencidos', episStatus.vencidos.length],
        ['EPIs em Alerta de Estoque', episStatus.semEstoque.length],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.text("2. DETALHAMENTO DE RISCOS POR UNIDADE", 15, (doc as any).lastAutoTable.finalY + 15);
    
    const riscosBody = riscos.map(r => [
      r.setorNome,
      r.totalRiscos,
      `Crítico/Alto: ${(r.porClassificacao?.critico || 0) + (r.porClassificacao?.alto || 0)} | Médio/Mod: ${(r.porClassificacao?.medio || 0) + (r.porClassificacao?.moderado || 0)} | Baixo: ${r.porClassificacao?.baixo || 0}`
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Setor', 'Qtd Riscos', 'Distribuição de Severidade']],
      body: riscosBody,
    });

    if (episStatus.vencidos.length > 0) {
      doc.addPage();
      doc.text("3. EPIS COM CA VENCIDOS (AÇÃO IMEDIATA)", 15, 20);
      autoTable(doc, {
        startY: 25,
        head: [['Equipamento', 'Data de Validade']],
        body: episStatus.vencidos.map((e: any) => [e.nome, new Date(e.validade).toLocaleDateString()]),
        headStyles: { fillColor: [220, 38, 38] }
      });
    }

    doc.save(`Relatorio_Sentinel_${dateStr.replace(/\//g, '-')}.pdf`);
  }

  function calcularScore(r: any) {
    const grave = (r.porClassificacao?.critico || 0) + (r.porClassificacao?.alto || 0);
    if (grave > 0) return 1;
    if ((r.porClassificacao?.medio || 0) > 0) return 3;
    return 5;
  }

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

  if (loading) {
    return (
      <div className={`flex h-screen items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="relative mb-4">
             <ChartBarIcon className="h-16 w-16 text-indigo-600/20 animate-pulse mx-auto" />
             <ChartBarIcon className="h-16 w-16 text-indigo-600 absolute top-0 left-1/2 -translate-x-1/2 animate-bounce" />
          </div>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} font-black uppercase tracking-widest text-xs`}>Sentinel processando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto space-y-8 p-1 transition-colors duration-300 ${darkMode ? 'text-white' : ''}`}>
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
        <div>
          <h1 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <ShieldCheckIcon className="h-10 w-10 text-indigo-600" />
            Relatórios Inteligentes
          </h1>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} font-medium ml-1`}>Auditoria de conformidade e riscos ocupacionais.</p>
        </div>
        <button
          onClick={exportRelatorioPdf}
          className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 text-sm uppercase tracking-widest ${
            darkMode ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20' : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-200'
          }`}
        >
          <DocumentArrowDownIcon className="h-5 w-5" /> Exportar PDF
        </button>
      </div>

      {/* FILTROS */}
      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/40'} p-6 rounded-[2rem] border shadow-xl`}>
        <div className="flex items-center gap-2 mb-6">
          <FunnelIcon className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Definir Período de Análise</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 ml-1">
              <CalendarDaysIcon className="h-3 w-3" /> Data Inicial
            </label>
            <input type="date" className={`w-full border p-4 rounded-2xl outline-none transition-all font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`} value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 ml-1">
              <CalendarDaysIcon className="h-3 w-3" /> Data Final
            </label>
            <input type="date" className={`w-full border p-4 rounded-2xl outline-none transition-all font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`} value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button onClick={loadReportsWithFilter} className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 uppercase text-xs tracking-[0.2em]">
            Atualizar Relatório
          </button>
        </div>
      </div>

      {/* STATUS DE ATENÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
            episStatus.vencidos.length > 0 
              ? (darkMode ? 'bg-rose-900/20 border-rose-800 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-700 shadow-sm shadow-rose-100') 
              : (darkMode ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700')
          }`}>
            <div className={`p-3 rounded-xl ${episStatus.vencidos.length > 0 ? (darkMode ? 'bg-rose-900/40' : 'bg-rose-100') : (darkMode ? 'bg-emerald-900/40' : 'bg-emerald-100')}`}>
              {episStatus.vencidos.length > 0 ? <ExclamationCircleIcon className="h-6 w-6" /> : <CheckCircleIcon className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status de Validade</p>
              <p className="text-sm font-black tracking-tight">{episStatus.vencidos.length > 0 ? `${episStatus.vencidos.length} EPIs COM CA VENCIDOS` : 'TUDO EM CONFORMIDADE'}</p>
            </div>
          </div>

          {/* FIX: Alerta de estoque baixo visível se houver itens */}
          <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
            episStatus.semEstoque.length > 0 
              ? (darkMode ? 'bg-amber-900/20 border-amber-800 text-amber-400 shadow-amber-900/10' : 'bg-amber-50 border-amber-100 text-amber-700 shadow-amber-100') 
              : (darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400')
          }`}>
            <div className={`p-3 rounded-xl ${episStatus.semEstoque.length > 0 ? (darkMode ? 'bg-amber-900/40 text-amber-500' : 'bg-amber-100 text-amber-500') : (darkMode ? 'bg-slate-700' : 'bg-slate-100')}`}>
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Alerta de Suprimentos</p>
              <p className="text-sm font-black tracking-tight">
                {episStatus.semEstoque.length > 0 ? `${episStatus.semEstoque.length} ITENS COM ESTOQUE BAIXO` : 'ESTOQUE NORMALIZADO'}
              </p>
            </div>
          </div>
      </div>

      {/* DASHBOARD WIDGETS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Setores Ativos", val: riscos.length, icon: ChartBarIcon, color: "text-blue-500", bg: darkMode ? "bg-blue-900/20" : "bg-blue-50" },
          { label: "Total Riscos", val: riscos.reduce((s, r) => s + (r.totalRiscos || 0), 0), icon: ExclamationCircleIcon, color: "text-orange-500", bg: darkMode ? "bg-orange-900/20" : "bg-orange-50" },
          { label: "Alertas CA", val: episStatus.vencidos.length, icon: CalendarDaysIcon, color: "text-rose-500", bg: darkMode ? "bg-rose-900/20" : "bg-rose-50" },
          { label: "Acervo EPI", val: episStatus.total, icon: ShieldCheckIcon, color: "text-indigo-500", bg: darkMode ? "bg-indigo-900/20" : "bg-indigo-50" },
        ].map((item, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border shadow-xl flex flex-col gap-4 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 shadow-black/20' : 'bg-white border-slate-100 shadow-slate-200/30'}`}>
            <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
              <item.icon className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{item.label}</p>
              <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MAPA DE CRITICIDADE */}
      <Card title="Mapa de Criticidade por Unidade">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {riscos.map((r) => {
            const total = r.totalRiscos || 0;
            const grave = (r.porClassificacao?.critico || 0) + (r.porClassificacao?.alto || 0);
            const medio = (r.porClassificacao?.medio || 0) + (r.porClassificacao?.moderado || 0);
            const baixo = (r.porClassificacao?.baixo || 0);

            const gravePct = total > 0 ? (grave / total) * 100 : 0;
            const medioPct = total > 0 ? (medio / total) * 100 : 0;
            const baixoPct = total > 0 ? (baixo / total) * 100 : 0;
            
            const isCritico = grave > 0;

            return (
              <div key={r.setorId} className={`group p-6 rounded-[2rem] border transition-all duration-300 ${
                darkMode 
                ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700' 
                : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-2xl'
              }`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{r.setorNome}</h4>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
                      {total} Riscos Identificados
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Risk Score</span>
                    <span className={`text-sm font-black px-4 py-1.5 rounded-xl border-2 ${
                      isCritico 
                        ? (darkMode ? 'border-rose-500/50 text-rose-400 bg-rose-500/10' : 'border-rose-500 text-rose-600 bg-rose-50') 
                        : (darkMode ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-emerald-200 text-emerald-600 bg-emerald-50')
                    }`}>
                      {calcularScore(r)} / 5
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase px-1">
                       <span className={isCritico ? "text-rose-600 animate-pulse" : "text-slate-400"}>
                         {isCritico ? "Atenção: Risco Crítico" : "Nível de Perigo"}
                       </span>
                       <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{Math.round(gravePct)}% Crítico</span>
                    </div>
                    
                    <div className={`flex h-3 w-full rounded-full border overflow-hidden shadow-inner ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                       <div className="bg-rose-500 h-full transition-all duration-700" style={{ width: `${gravePct}%` }} />
                       <div className="bg-amber-400 h-full transition-all duration-700" style={{ width: `${medioPct}%` }} />
                       <div className="bg-emerald-400 h-full transition-all duration-700" style={{ width: `${baixoPct}%` }} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2">
                       <div className={`text-center p-2 rounded-xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-50'}`}>
                         <p className="text-[8px] font-black text-rose-500 uppercase">Grave/Crítico</p>
                         <p className={`text-xs font-black ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{grave}</p>
                       </div>
                       <div className={`text-center p-2 rounded-xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-50'}`}>
                         <p className="text-[8px] font-black text-amber-500 uppercase">Médio/Mod.</p>
                         <p className={`text-xs font-black ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{medio}</p>
                       </div>
                       <div className={`text-center p-2 rounded-xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-50'}`}>
                         <p className="text-[8px] font-black text-emerald-500 uppercase">Baixo</p>
                         <p className={`text-xs font-black ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{baixo}</p>
                       </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* COLABORADORES */}
      <Card title="Gestão de Efetivo por Setor">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {colabs && Object.entries(colabs).map(([setorId, lista]: any) => (
            <div key={setorId} className={`p-6 rounded-[2rem] border shadow-sm relative overflow-hidden group transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-900' : 'bg-white border-slate-100 hover:border-indigo-200'
            }`}>
              <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] text-indigo-600 group-hover:scale-110 transition-transform">
                <UsersIcon className="h-24 w-24" />
              </div>
              <h4 className={`font-black text-[10px] uppercase tracking-widest mb-4 border-b pb-3 flex items-center gap-2 ${darkMode ? 'text-white border-slate-800' : 'text-slate-800 border-slate-50'}`}>
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                {setorId}
              </h4>
              <ul className="space-y-3">
                {lista.map((c: any) => (
                  <li key={c.id} className="flex flex-col gap-0.5">
                    <span className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{c.nome}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold tracking-tighter">ID: {c.matricula}</span>
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