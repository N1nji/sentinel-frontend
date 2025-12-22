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
        ['Total de Riscos Identificados', riscos.reduce((s, r) => s + r.totalRiscos, 0)],
        ['EPIs com CA Vencidos', episStatus.vencidos.length],
        ['EPIs em Alerta de Estoque', episStatus.semEstoque.length],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.text("2. MAPEAMENTO DE RISCOS POR SETOR", 15, (doc as any).lastAutoTable.finalY + 15);
    const riscosBody = riscos.map(r => [
      r.setorNome,
      r.totalRiscos,
      `Alto: ${r.porClassificacao.alto} | Médio: ${r.porClassificacao.medio} | Baixo: ${r.porClassificacao.baixo}`
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Setor', 'Qtd Riscos', 'Classificação']],
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
    const total = r.totalRiscos || 0;
    const altos = r.porClassificacao?.alto || 0;
    if (total === 0) return 5;
    if (altos > 3) return 1;
    if (altos > 1) return 2;
    if (altos === 1) return 3;
    return 4;
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative mb-4">
             <ChartBarIcon className="h-16 w-16 text-indigo-600/20 animate-pulse mx-auto" />
             <ChartBarIcon className="h-16 w-16 text-indigo-600 absolute top-0 left-1/2 -translate-x-1/2 animate-bounce" />
          </div>
          <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Sentinel está processando dados...</p>
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
            Relatórios Inteligentes
          </h1>
          <p className="text-slate-500 font-medium ml-1">Auditoria de conformidade e riscos ocupacionais.</p>
        </div>
        <button
          onClick={exportRelatorioPdf}
          className="w-full md:w-auto bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 text-sm uppercase tracking-widest"
        >
          <DocumentArrowDownIcon className="h-5 w-5" /> Exportar PDF
        </button>
      </div>

      {/* FILTROS (ESTILO PREMIUM) */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40">
        <div className="flex items-center gap-2 mb-6">
          <FunnelIcon className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Definir Período de Análise</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 ml-1">
              <CalendarDaysIcon className="h-3 w-3" /> Data Inicial
            </label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-600" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 ml-1">
              <CalendarDaysIcon className="h-3 w-3" /> Data Final
            </label>
            <input type="date" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-600" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button onClick={loadReportsWithFilter} className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 uppercase text-xs tracking-[0.2em]">
            Atualizar Relatório
          </button>
        </div>
      </div>

      {/* STATUS DE ATENÇÃO (ALERTAS RÁPIDOS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${episStatus.vencidos.length > 0 ? 'bg-rose-50 border-rose-100 text-rose-700 shadow-sm shadow-rose-100' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
            <div className={`p-3 rounded-xl ${episStatus.vencidos.length > 0 ? 'bg-rose-100' : 'bg-emerald-100'}`}>
              {episStatus.vencidos.length > 0 ? <ExclamationCircleIcon className="h-6 w-6" /> : <CheckCircleIcon className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status de Validade</p>
              <p className="text-sm font-black">{episStatus.vencidos.length > 0 ? `${episStatus.vencidos.length} EPIs COM CA VENCIDOS` : 'TUDO EM CONFORMIDADE'}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50 text-amber-700 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Alerta de Suprimentos</p>
              <p className="text-sm font-black">{episStatus.semEstoque.length} ITENS COM ESTOQUE BAIXO</p>
            </div>
          </div>
      </div>

      {/* DASHBOARD WIDGETS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Setores Ativos", val: riscos.length, icon: ChartBarIcon, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Riscos", val: riscos.reduce((s, r) => s + r.totalRiscos, 0), icon: ExclamationCircleIcon, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Alertas CA", val: episStatus.vencidos.length, icon: CalendarDaysIcon, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Acervo EPI", val: episStatus.total, icon: ShieldCheckIcon, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col gap-4">
            <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
              <item.icon className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{item.label}</p>
              <p className="text-3xl font-black text-slate-800">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* RISCOS POR SETOR */}
      <Card title="⚠️ Mapa de Criticidade por Unidade">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {riscos.map((r) => (
            <div key={r.setorId} className="group p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-lg font-black text-slate-800">{r.setorNome}</h4>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">{r.totalRiscos} Riscos Mapeados</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Risk Score</span>
                  <span className={`text-sm font-black px-4 py-1.5 rounded-xl border-2 ${calcularScore(r) <= 2 ? 'border-rose-200 text-rose-600 bg-rose-50' : 'border-emerald-200 text-emerald-600 bg-emerald-50'}`}>
                    {calcularScore(r)} / 5
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 px-1">
                    <span>Nível de Perigo</span>
                    <span>{Math.round((r.porClassificacao.alto / r.totalRiscos) * 100) || 0}% crítico</span>
                 </div>
                 <div className="flex h-3 gap-1.5 p-1 bg-white rounded-full border border-slate-100 shadow-inner">
                    <div className="bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${(r.porClassificacao.alto / r.totalRiscos) * 100}%` }} />
                    <div className="bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${(r.porClassificacao.medio / r.totalRiscos) * 100}%` }} />
                    <div className="bg-emerald-400 rounded-full flex-1 transition-all duration-500" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* COLABORADORES */}
      <Card title="👥 Gestão de Efetivo por Setor">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {colabs && Object.entries(colabs).map(([setorId, lista]: any) => (
            <div key={setorId} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
              <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] text-indigo-600 group-hover:scale-110 transition-transform">
                <UsersIcon className="h-24 w-24" />
              </div>
              <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-4 border-b border-slate-50 pb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                {setorId}
              </h4>
              <ul className="space-y-3">
                {lista.map((c: any) => (
                  <li key={c.id} className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-slate-700">{c.nome}</span>
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