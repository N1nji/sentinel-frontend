import { useEffect, useState, useMemo, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Componentes e Serviços
import Card from "../components/Card";
import {
  getRiscosPorSetor,
  getEpisStatus,
  getColaboradoresPorSetor,
} from "../services/reportsService";

// --- INTERFACES (Tipagem) ---
interface Classificacao {
  alto: number;
  medio: number;
  baixo: number;
}

interface Risco {
  setorId: string;
  setorNome: string;
  totalRiscos: number;
  porClassificacao: Classificacao;
}

interface Epi {
  id: string;
  nome: string;
  validade: string;
  estoque?: number;
}

interface EpisStatus {
  total: number;
  vencidos: Epi[];
  semEstoque: Epi[];
}

interface Colaborador {
  id: string;
  nome: string;
  matricula: string;
}

// --- FUNÇÕES AUXILIARES (Lógica fora do componente) ---

const calcularScore = (r: Risco): number => {
  const total = r.totalRiscos || 0;
  const altos = r.porClassificacao?.alto || 0;
  if (total === 0) return 5;
  if (altos > 3) return 1;
  if (altos > 1) return 2;
  if (altos === 1) return 3;
  return 4;
};

const gerarTemplateHtml = (riscos: Risco[], episStatus: EpisStatus, from: string, to: string) => {
  // Retorna o HTML string para o PDF (mantido conforme sua lógica original)
  return `
    <div style="font-family: Arial; padding: 30px; color:#111;">
      <h1 style="text-align:center;">Relatório de Segurança do Trabalho</h1>
      <p style="text-align:center;">Período: ${from || "Início"} até ${to || "Atual"}</p>
      <hr/>
      <h2>1. Resumo Executivo</h2>
      <p>Riscos Totais: ${riscos.reduce((s, r) => s + r.totalRiscos, 0)}</p>
      <p>EPIs Vencidos: ${episStatus.vencidos.length}</p>
      <hr/>
      </div>
  `;
};

// --- COMPONENTE PRINCIPAL ---

export default function Relatorios() {
  // Estados tipados para evitar erros de 'null'
  const [riscos, setRiscos] = useState<Risco[]>([]);
  const [episStatus, setEpisStatus] = useState<EpisStatus>({ total: 0, vencidos: [], semEstoque: [] });
  const [colabs, setColabs] = useState<Record<string, Colaborador[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({ from: "", to: "" });

  // Busca de dados memorizada para evitar recriação da função
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      
      const [rRiscos, rEpis, rColabs] = await Promise.all([
        getRiscosPorSetor(params),
        getEpisStatus(params),
        getColaboradoresPorSetor(params),
      ]);

      setRiscos(rRiscos || []);
      setEpisStatus(rEpis || { total: 0, vencidos: [], semEstoque: [] });
      setColabs(rColabs || {});
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
      alert("Erro ao carregar os dados. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Cálculo de totais usando useMemo (performance)
  const totalRiscosGerais = useMemo(() => 
    riscos.reduce((acc, r) => acc + r.totalRiscos, 0), [riscos]
  );

  const handleExportPdf = async () => {
    setIsExporting(true);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = gerarTemplateHtml(riscos, episStatus, filters.from, filters.to);
    wrapper.style.position = "absolute";
    wrapper.style.left = "-9999px";
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(wrapper, { scale: 2, backgroundColor: "#fff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save(`relatorio-seguranca-${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      document.body.removeChild(wrapper);
      setIsExporting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">📊 Gerando relatórios...</div>;

  return (
    <div id="relatorio-root" className="space-y-8 bg-gray-50 p-6 rounded-xl shadow-sm">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            Relatórios de Segurança do Trabalho
          </h1>
          <p className="text-gray-500 italic">Sentinel - Sistema de Gestão Integrada</p>
        </div>
        <button
          onClick={handleExportPdf}
          disabled={isExporting}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
        >
          {isExporting ? "⌛ Processando..." : "📄 Exportar PDF"}
        </button>
      </div>

      <hr className="border-gray-200" />

      {/* FILTROS */}
      <Card title="📅 Filtro de Período">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">De</label>
            <input
              type="date"
              className="w-full border-gray-300 border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Até</label>
            <input
              type="date"
              className="w-full border-gray-300 border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </div>
          <button
            onClick={loadReports}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium transition-colors"
          >
            Aplicar Filtro
          </button>
        </div>
      </Card>

      {/* ALERTAS INTELIGENTES */}
      <Card title="🚨 Alertas Críticos">
        <div className="space-y-3">
          {episStatus.vencidos.length > 0 ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm">
              <span>❌</span> <strong>{episStatus.vencidos.length} EPIs vencidos</strong> que precisam de substituição imediata.
            </div>
          ) : (
            <div className="text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 text-sm">
              ✅ Nenhuma irregularidade crítica de validade encontrada.
            </div>
          )}
        </div>
      </Card>

      {/* RESUMO EXECUTIVO (MÉTRICAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBox label="Setores" value={riscos.length} color="gray" />
        <MetricBox label="Riscos Totais" value={totalRiscosGerais} color="gray" />
        <MetricBox label="EPIs Vencidos" value={episStatus.vencidos.length} color="red" />
        <MetricBox label="Sem Estoque" value={episStatus.semEstoque.length} color="orange" />
      </div>

      {/* LISTAGEM DE RISCOS POR SETOR */}
      <Card title="⚠️ Detalhamento de Riscos por Setor">
        <div className="divide-y divide-gray-100">
          {riscos.length === 0 && <p className="py-4 text-gray-400">Nenhum risco identificado no período.</p>}
          {riscos.map((r) => (
            <div key={r.setorId} className="py-6 first:pt-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{r.setorNome}</h3>
                  <p className="text-sm text-gray-500">Total de {r.totalRiscos} riscos mapeados</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase font-bold mb-1">Score de Segurança</div>
                  <div className="text-xl">{"⭐".repeat(calcularScore(r))}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(r.porClassificacao).map(([nivel, qtd]) => (
                  <Badge key={nivel} label={nivel} count={qtd} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* LISTAGEM DE COLABORADORES */}
      <Card title="👥 Equipe por Setor">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(colabs).map(([setor, lista]) => (
            <div key={setor} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3 border-b pb-2 flex justify-between">
                <span>Setor: {setor}</span>
                <span className="text-blue-600">{lista.length}</span>
              </h4>
              <ul className="space-y-2">
                {lista.map(c => (
                  <li key={c.id} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="opacity-50 text-xs">ID {c.matricula}</span> — {c.nome}
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

// --- SUB-COMPONENTES DE UI (ORGANIZAÇÃO) ---

function MetricBox({ label, value, color }: { label: string, value: number, color: 'red' | 'orange' | 'gray' }) {
  const styles = {
    red: "bg-red-50 border-red-100 text-red-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
    gray: "bg-white border-gray-200 text-gray-800",
  };
  return (
    <div className={`p-5 rounded-xl border shadow-sm ${styles[color]}`}>
      <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}

function Badge({ label, count }: { label: string, count: number }) {
  const themes: any = {
    alto: "bg-red-100 text-red-700 border-red-200",
    medio: "bg-orange-100 text-orange-700 border-orange-200",
    baixo: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${themes[label] || "bg-gray-100"}`}>
      {label.toUpperCase()}: {count}
    </span>
  );
}