import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Componentes e Serviços
import Card from "../components/Card";
import {
  getRiscosPorSetor,
  getEpisStatus,
  getColaboradoresPorSetor,
} from "../services/reportsService";

export default function Relatorios() {
  // Estados (Mantive as tipagens flexíveis para evitar erros de compatibilidade)
  const [riscos, setRiscos] = useState<any[]>([]);
  // Inicializado com objeto para evitar erro de "null" ao carregar a página
  const [episStatus, setEpisStatus] = useState<any>({ total: 0, vencidos: [], semEstoque: [] });
  const [colabs, setColabs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // --- SUA LÓGICA ORIGINAL DE PDF (MANTIDA INTEGRALMENTE) ---
  function gerarHtmlRelatorioPdf() {
    return `
    <div style="font-family: Arial, Helvetica, sans-serif; padding: 32px; color:#111;">
      <div style="text-align:center; margin-bottom:40px;">
        <h1 style="font-size:26px; margin-bottom:8px;">Relatório de Segurança do Trabalho</h1>
        <p style="font-size:14px; color:#555;">Controle de EPIs, Riscos Ocupacionais e Colaboradores</p>
        <p style="margin-top:16px; font-size:13px;">
          <strong>Período:</strong> ${from || "Início"} até ${to || "Atual"}
        </p>
      </div>

      <hr style="margin-bottom:32px;" />

      <h2 style="font-size:18px; margin-bottom:12px;">1. Resumo Executivo</h2>
      <table width="100%" style="border-collapse: collapse; margin-bottom:24px;">
        <tr>
          <td style="border:1px solid #ccc; padding:8px;">Setores</td>
          <td style="border:1px solid #ccc; padding:8px;">${riscos.length}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ccc; padding:8px;">Riscos Totais</td>
          <td style="border:1px solid #ccc; padding:8px;">
            ${riscos.reduce((s, r) => s + r.totalRiscos, 0)}
          </td>
        </tr>
        <tr>
          <td style="border:1px solid #ccc; padding:8px;">EPIs Vencidos</td>
          <td style="border:1px solid #ccc; padding:8px;">${episStatus.vencidos.length}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ccc; padding:8px;">EPIs sem Estoque</td>
          <td style="border:1px solid #ccc; padding:8px;">${episStatus.semEstoque.length}</td>
        </tr>
      </table>

      <h2 style="font-size:18px; margin-bottom:12px;">2. Riscos por Setor</h2>
      ${riscos.map(r => `
        <div style="margin-bottom:16px;">
          <strong>${r.setorNome}</strong><br/>
          Total de riscos: ${r.totalRiscos}<br/>
          Classificação: ${Object.entries(r.porClassificacao).map(([k, v]) => `${k}: ${v}`).join(" | ")}
        </div>
      `).join("")}

      <h2 style="font-size:18px; margin-top:24px; margin-bottom:12px;">3. Status dos EPIs</h2>
      <p><strong>EPIs Vencidos:</strong></p>
      <ul>
        ${episStatus.vencidos.map((e: any) => `<li>${e.nome} - validade ${new Date(e.validade).toLocaleDateString()}</li>`).join("") || "<li>Nenhum</li>"}
      </ul>

      <p><strong>EPIs sem Estoque:</strong></p>
      <ul>
        ${episStatus.semEstoque.map((e: any) => `<li>${e.nome} - estoque ${e.estoque}</li>`).join("") || "<li>Nenhum</li>"}
      </ul>

      <h2 style="font-size:18px; margin-top:24px;">4. Considerações Finais</h2>
      <p style="text-align: justify;">
        Este relatório consolida informações essenciais para a gestão da segurança do trabalho, possibilitando a identificação de riscos...
      </p>

      <hr style="margin-top:40px;" />
      <p style="font-size:11px; color:#666; text-align:center;">
        Relatório gerado automaticamente pelo Sentinel - Sistema de Gestão de Segurança do Trabalho
      </p>
    </div>
    `;
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

  async function exportRelatorioPdf() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = gerarHtmlRelatorioPdf();
    wrapper.style.position = "fixed";
    wrapper.style.top = "-9999px";
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, { scale: 2, backgroundColor: "#fff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("relatorio-seguranca.pdf");
    document.body.removeChild(wrapper);
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

  useEffect(() => {
    loadReportsWithFilter();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600 flex items-center gap-2 animate-pulse text-lg">
          📊 Gerando relatórios...
        </p>
      </div>
    );
  }

  return (
    <div id="relatorio-root" className="max-w-7xl mx-auto space-y-8 bg-gray-50 p-6 rounded-xl shadow-sm">
      
      {/* 🔹 CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios de Segurança do Trabalho</h1>
          <p className="text-gray-500 text-sm italic">Visão geral dos riscos, EPIs e colaboradores</p>
        </div>
        <button
          onClick={exportRelatorioPdf}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
        >
          📄 Exportar PDF
        </button>
      </div>

      {/* 🔹 FILTROS */}
      <Card title="📅 Filtro de Período">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">De</label>
            <input
              type="date"
              className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Até</label>
            <input
              type="date"
              className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button
            onClick={loadReportsWithFilter}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium transition-colors"
          >
            Aplicar
          </button>
        </div>
      </Card>

      {/* 🔹 ALERTAS */}
      <Card title="🚨 Alertas Inteligentes">
        <div className="space-y-2">
          {episStatus.vencidos.length > 0 && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              ❌ Existem <strong>{episStatus.vencidos.length}</strong> EPIs vencidos
            </div>
          )}
          {episStatus.semEstoque.length > 0 && (
            <div className="p-3 bg-orange-50 border-l-4 border-orange-500 text-orange-700 text-sm rounded">
              ⚠️ Existem <strong>{episStatus.semEstoque.length}</strong> EPIs sem estoque
            </div>
          )}
          {episStatus.vencidos.length === 0 && episStatus.semEstoque.length === 0 && (
            <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded">
              ✅ Nenhum alerta crítico encontrado
            </div>
          )}
        </div>
      </Card>

      {/* 🔹 RESUMO EXECUTIVO (WIDGETS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-gray-400 text-xs font-bold uppercase">Setores</div>
          <div className="text-2xl font-bold">{riscos.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-gray-400 text-xs font-bold uppercase">Riscos Totais</div>
          <div className="text-2xl font-bold">{riscos.reduce((s, r) => s + r.totalRiscos, 0)}</div>
        </div>
        <div className={`p-4 rounded-lg border shadow-sm ${episStatus.vencidos.length > 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-white'}`}>
          <div className="text-xs font-bold uppercase opacity-70">EPIs Vencidos</div>
          <div className="text-2xl font-bold">{episStatus.vencidos.length}</div>
        </div>
        <div className={`p-4 rounded-lg border shadow-sm ${episStatus.semEstoque.length > 0 ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-white'}`}>
          <div className="text-xs font-bold uppercase opacity-70">Sem Estoque</div>
          <div className="text-2xl font-bold">{episStatus.semEstoque.length}</div>
        </div>
      </div>

      {/* 🔹 RISCOS POR SETOR */}
      <Card title="⚠️ Riscos por Setor">
        <div className="divide-y">
          {riscos.length === 0 && <p className="py-4 text-gray-500">Nenhum risco cadastrado.</p>}
          {riscos.map((r) => (
            <div key={r.setorId} className="py-5 first:pt-0">
              <div className="flex justify-between items-center mb-2">
                <strong className="text-gray-800 text-lg">{r.setorNome}</strong>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full font-medium">
                  Score: {"⭐".repeat(calcularScore(r))}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">Total de riscos: {r.totalRiscos}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(r.porClassificacao).map(([k, v]: any) => (
                  <span
                    key={k}
                    className={`text-xs px-2 py-1 rounded font-bold border ${
                      k === "alto" ? "bg-red-100 border-red-200 text-red-700" :
                      k === "medio" ? "bg-orange-100 border-orange-200 text-orange-700" :
                      "bg-green-100 border-green-200 text-green-700"
                    }`}
                  >
                    {k.toUpperCase()}: {v}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 🔹 STATUS DOS EPIs */}
      <Card title="🦺 Status dos EPIs">
        <div className="mb-6 bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100">
          Total de EPIs cadastrados: <strong>{episStatus.total}</strong>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-red-600 mb-3 flex items-center gap-2">❌ Vencidos</h4>
            {episStatus.vencidos.length === 0 ? <p className="text-xs text-gray-400">Nenhum 🎉</p> : 
              episStatus.vencidos.map((e: any) => (
                <div key={e.id} className="text-sm py-1 border-b last:border-0 border-gray-100">
                   {e.nome} — <span className="text-gray-500">Validade: {new Date(e.validade).toLocaleDateString()}</span>
                </div>
              ))
            }
          </div>
          <div>
            <h4 className="font-bold text-orange-600 mb-3 flex items-center gap-2">⚠️ Sem Estoque</h4>
            {episStatus.semEstoque.length === 0 ? <p className="text-xs text-gray-400">Nenhum 🎉</p> : 
              episStatus.semEstoque.map((e: any) => (
                <div key={e.id} className="text-sm py-1 border-b last:border-0 border-gray-100">
                  {e.nome} — <span className="text-gray-500">Estoque atual: {e.estoque}</span>
                </div>
              ))
            }
          </div>
        </div>
      </Card>

      {/* 🔹 COLABORADORES POR SETOR */}
      <Card title="👥 Colaboradores por Setor">
        {!colabs ? <p className="text-gray-400 italic">Nenhum colaborador encontrado.</p> : 
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(colabs).map(([setorId, lista]: any) => (
              <div key={setorId} className="bg-gray-50 p-4 rounded-lg border">
                <strong className="text-gray-700 block mb-2 pb-1 border-b border-gray-200">Setor: {setorId}</strong>
                <div className="space-y-2">
                  {lista.map((c: any) => (
                    <div key={c.id} className="text-xs flex items-center gap-2 text-gray-600">
                      <span className="text-gray-300">●</span> {c.nome} <span className="opacity-50 text-[10px]">({c.matricula})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        }
      </Card>
    </div>
  );
}