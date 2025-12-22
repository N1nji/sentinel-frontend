import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Importante: instale com 'npm install jspdf-autotable'
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  UsersIcon,
  ShieldCheckIcon
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

  // --- NOVA FUNÇÃO DE EXPORTAÇÃO ELEGANTE ---
  async function exportRelatorioPdf() {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();

    // Cabeçalho do PDF
    doc.setFillColor(31, 41, 55); // Cinza escuro
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("SENTINEL - SEGURANÇA DO TRABALHO", 15, 20);
    doc.setFontSize(10);
    doc.text(`RELATÓRIO TÉCNICO GERADO EM: ${dateStr}`, 15, 30);
    doc.text(`PERÍODO: ${from || "INÍCIO"} ATÉ ${to || "ATUAL"}`, 150, 30);

    // 1. Tabela de Resumo
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("1. RESUMO EXECUTIVO", 15, 50);
    
    autoTable(doc, {
      startY: 55,
      head: [['Indicador', 'Quantidade']],
      body: [
        ['Setores Mapeados', riscos.length],
        ['Total de Riscos Identificados', riscos.reduce((s, r) => s + r.totalRiscos, 0)],
        ['EPIs Vencidos', episStatus.vencidos.length],
        ['EPIs em Alerta de Estoque', episStatus.semEstoque.length],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] } // Indigo
    });

    // 2. Riscos por Setor
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

    // 3. EPIs Críticos (Vencidos)
    if (episStatus.vencidos.length > 0) {
      doc.addPage();
      doc.text("3. EPIS VENCIDOS (AÇÃO IMEDIATA)", 15, 20);
      autoTable(doc, {
        startY: 25,
        head: [['Equipamento', 'Data de Validade']],
        body: episStatus.vencidos.map((e: any) => [e.nome, new Date(e.validade).toLocaleDateString()]),
        headStyles: { fillColor: [220, 38, 38] } // Vermelho
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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-indigo-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Consolidando dados do Sentinel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 bg-gray-50 p-6">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
            Relatórios Inteligentes
          </h1>
          <p className="text-gray-500 font-medium mt-1">Análise de conformidade e riscos ocupacionais.</p>
        </div>
        <button
          onClick={exportRelatorioPdf}
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95"
        >
          <DocumentArrowDownIcon className="h-5 w-5" /> Exportar PDF Profissional
        </button>
      </div>

      {/* GRID SUPERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FILTROS */}
        <div className="lg:col-span-2">
          <Card title="📅 Filtro de Período">
            <div className="flex flex-wrap gap-4 items-end p-2">
              <div className="flex-1 min-w-[150px]">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Data Inicial</label>
                <input type="date" className="w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Data Final</label>
                <input type="date" className="w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <button onClick={loadReportsWithFilter} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all">Aplicar</button>
            </div>
          </Card>
        </div>

        {/* ALERTAS */}
        <Card title="🚨 Status de Atenção">
          <div className="space-y-3">
            {episStatus.vencidos.length > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100">
                <ExclamationCircleIcon className="h-5 w-5" />
                <span className="text-sm font-bold">{episStatus.vencidos.length} EPIs Vencidos</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm font-bold">Tudo em conformidade</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* DASHBOARD WIDGETS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Setores", val: riscos.length, icon: ChartBarIcon, color: "text-blue-600" },
          { label: "Riscos", val: riscos.reduce((s, r) => s + r.totalRiscos, 0), icon: ExclamationCircleIcon, color: "text-orange-600" },
          { label: "Vencidos", val: episStatus.vencidos.length, icon: CalendarIcon, color: "text-red-600" },
          { label: "EPI Total", val: episStatus.total, icon: UsersIcon, color: "text-indigo-600" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-gray-800">{item.val}</p>
            </div>
            <item.icon className={`h-8 w-8 ${item.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* RISCOS POR SETOR */}
      <Card title="⚠️ Análise de Riscos Ocupacionais">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riscos.map((r) => (
            <div key={r.setorId} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <strong className="text-gray-900 font-bold">{r.setorNome}</strong>
                <span className="text-[10px] font-black px-2 py-1 bg-white rounded-lg border shadow-sm">
                  SCORE: {calcularScore(r)}/5
                </span>
              </div>
              <div className="flex gap-2">
                <div className={`h-1.5 flex-1 rounded-full ${r.porClassificacao.alto > 0 ? 'bg-red-500' : 'bg-gray-200'}`} />
                <div className={`h-1.5 flex-1 rounded-full ${r.porClassificacao.medio > 0 ? 'bg-orange-400' : 'bg-gray-200'}`} />
                <div className="h-1.5 flex-1 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">
                {r.totalRiscos} Riscos Detectados
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* COLABORADORES */}
      <Card title="👥 Distribuição de Efetivo">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colabs && Object.entries(colabs).map(([setorId, lista]: any) => (
            <div key={setorId} className="bg-white p-4 rounded-2xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5 text-indigo-600">
                <UsersIcon className="h-12 w-12" />
              </div>
              <h4 className="font-black text-gray-800 text-xs uppercase mb-3 border-b pb-2">{setorId}</h4>
              <ul className="space-y-2">
                {lista.map((c: any) => (
                  <li key={c.id} className="text-xs text-gray-600 flex justify-between">
                    <span className="font-medium">{c.nome}</span>
                    <span className="text-gray-400 font-mono text-[10px]">{c.matricula}</span>
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