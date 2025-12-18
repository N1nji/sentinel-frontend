import { useEffect, useState } from "react";
import Card from "../components/Card";
import {
  getRiscosPorSetor,
  getEpisStatus,
  getColaboradoresPorSetor,
} from "../services/reportsService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Relatorios() {
  const [riscos, setRiscos] = useState<any[]>([]);
  const [episStatus, setEpisStatus] = useState<any>(null);
  const [colabs, setColabs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  function gerarHtmlRelatorioPdf() {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; padding: 32px; color:#111;">

    <!-- CAPA -->
    <div style="text-align:center; margin-bottom:40px;">
      <h1 style="font-size:26px; margin-bottom:8px;">
        Relatório de Segurança do Trabalho
      </h1>
      <p style="font-size:14px; color:#555;">
        Controle de EPIs, Riscos Ocupacionais e Colaboradores
      </p>
      <p style="margin-top:16px; font-size:13px;">
        <strong>Período:</strong> ${from || "Início"} até ${to || "Atual"}
      </p>
    </div>

    <hr style="margin-bottom:32px;" />

    <!-- RESUMO EXECUTIVO -->
    <h2 style="font-size:18px; margin-bottom:12px;">
      1. Resumo Executivo
    </h2>

    <table width="100%" style="border-collapse: collapse; margin-bottom:24px;">
      <tr>
        <td style="border:1px solid #ccc; padding:8px;">Setores</td>
        <td style="border:1px solid #ccc; padding:8px;">${riscos.length}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc; padding:8px;">Riscos Totais</td>
        <td style="border:1px solid #ccc; padding:8px;">
          ${riscos.reduce((s,r)=>s+r.totalRiscos,0)}
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc; padding:8px;">EPIs Vencidos</td>
        <td style="border:1px solid #ccc; padding:8px;">
          ${episStatus.vencidos.length}
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc; padding:8px;">EPIs sem Estoque</td>
        <td style="border:1px solid #ccc; padding:8px;">
          ${episStatus.semEstoque.length}
        </td>
      </tr>
    </table>

    <!-- RISCOS POR SETOR -->
    <h2 style="font-size:18px; margin-bottom:12px;">
      2. Riscos por Setor
    </h2>

    ${riscos.map(r => `
      <div style="margin-bottom:16px;">
        <strong>${r.setorNome}</strong><br/>
        Total de riscos: ${r.totalRiscos}<br/>
        Classificação:
        ${Object.entries(r.porClassificacao).map(
          ([k,v]) => `${k}: ${v}`
        ).join(" | ")}
      </div>
    `).join("")}

    <!-- STATUS DOS EPIS -->
    <h2 style="font-size:18px; margin-top:24px; margin-bottom:12px;">
      3. Status dos EPIs
    </h2>

    <p><strong>EPIs Vencidos:</strong></p>
    <ul>
      ${episStatus.vencidos.map((e: any) =>
  `<li>${e.nome} - validade ${new Date(e.validade).toLocaleDateString()}</li>`
      ).join("") || "<li>Nenhum</li>"}
    </ul>

    <p><strong>EPIs sem Estoque:</strong></p>
    <ul>
      ${episStatus.semEstoque.map((e: any) =>
  `<li>${e.nome} - estoque ${e.estoque}</li>`
      ).join("") || "<li>Nenhum</li>"}
    </ul>

    <!-- CONCLUSÃO -->
    <h2 style="font-size:18px; margin-top:24px;">
      4. Considerações Finais
    </h2>

    <p style="text-align: justify;">
      Este relatório consolida informações essenciais para a gestão da
      segurança do trabalho, possibilitando a identificação de riscos,
      controle de EPIs e suporte à tomada de decisão, atendendo às exigências
      das Normas Regulamentadoras vigentes.
    </p>

    <!-- RODAPÉ -->
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

  const canvas = await html2canvas(wrapper, {
    scale: 2,
    backgroundColor: "#fff",
  });

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

    setRiscos(r1);
    setEpisStatus(r2);
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
      <p className="text-gray-600 flex items-center gap-2">
        📊 Gerando relatórios...
      </p>
    );
  }

  return (
    <div id="relatorio-root" className="space-y-8 bg-white p-6 rounded shadow">

      {/* 🔹 CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Relatórios de Segurança do Trabalho
        </h1>
        <p className="text-gray-500 text-sm">
          Visão geral dos riscos, EPIs e colaboradores
        </p>
      </div>

      <button
        onClick={exportRelatorioPdf}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        📄 Exportar PDF
      </button>

          <Card title="📅 Filtro de Período">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-sm text-gray-600">De</label>
          <input
            type="date"
            className="border p-2 rounded w-full"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Até</label>
          <input
            type="date"
            className="border p-2 rounded w-full"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <button
          onClick={loadReportsWithFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Aplicar
        </button>
      </div>
    </Card>

      <Card title="🚨 Alertas Inteligentes">
    <ul className="text-sm space-y-2">
      {episStatus.vencidos.length > 0 && (
        <li className="text-red-600">
          ❌ Existem {episStatus.vencidos.length} EPIs vencidos
        </li>
      )}

      {episStatus.semEstoque.length > 0 && (
        <li className="text-orange-600">
          ⚠️ Existem {episStatus.semEstoque.length} EPIs sem estoque
        </li>
      )}

      {episStatus.vencidos.length === 0 &&
        episStatus.semEstoque.length === 0 && (
          <li className="text-green-600">
            ✅ Nenhum alerta crítico encontrado
          </li>
        )}
    </ul>
  </Card>

      {/* 🔹 RESUMO EXECUTIVO */}
      <Card title="📌 Resumo Executivo">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded bg-gray-100">
            <div className="text-gray-500">Setores</div>
            <div className="text-xl font-semibold">{riscos.length}</div>
          </div>

          <div className="p-3 rounded bg-gray-100">
            <div className="text-gray-500">Riscos totais</div>
            <div className="text-xl font-semibold">
              {riscos.reduce((s, r) => s + r.totalRiscos, 0)}
            </div>
          </div>

          <div className="p-3 rounded bg-red-100 text-red-700">
            <div>EPIs vencidos</div>
            <div className="text-xl font-semibold">
              {episStatus.vencidos.length}
            </div>
          </div>

          <div className="p-3 rounded bg-orange-100 text-orange-700">
            <div>EPIs sem estoque</div>
            <div className="text-xl font-semibold">
              {episStatus.semEstoque.length}
            </div>
          </div>
        </div>
      </Card>

      {/* 🔹 RISCOS POR SETOR */}
      <Card title="⚠️ Riscos por Setor">
        {riscos.length === 0 && <p>Nenhum risco cadastrado.</p>}

        {riscos.map((r) => (
          <div key={r.setorId} className="border-b py-4">
            <strong className="text-gray-800">{r.setorNome}</strong>
            <div className="text-sm text-gray-600">
              Total de riscos: {r.totalRiscos}
            </div>

            <div className="mt-2 text-sm">
              Score de segurança:{" "}
              <span className="font-semibold">
                {"⭐".repeat(calcularScore(r))}
              </span>
            </div>

            <div className="flex gap-4 mt-2 text-sm">
              {Object.entries(r.porClassificacao).map(([k, v]: any) => (
                <span
                  key={k}
                  className={`px-2 py-1 rounded-full ${
                    k === "alto"
                      ? "bg-red-100 text-red-700"
                      : k === "medio"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {/* 🔹 STATUS DOS EPIs */}
      <Card title="🦺 Status dos EPIs">
        <div className="text-sm mb-3">
          Total de EPIs cadastrados:{" "}
          <strong>{episStatus.total}</strong>
        </div>

        <h4 className="font-semibold text-red-600 mt-4">
          ❌ EPIs vencidos
        </h4>
        {episStatus.vencidos.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum 🎉</p>
        )}
        {episStatus.vencidos.map((e: any) => (
          <div key={e.id} className="text-sm">
            {e.nome} — validade{" "}
            {new Date(e.validade).toLocaleDateString()}
          </div>
        ))}

        <h4 className="font-semibold text-orange-600 mt-4">
          ⚠️ EPIs sem estoque
        </h4>
        {episStatus.semEstoque.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum 🎉</p>
        )}
        {episStatus.semEstoque.map((e: any) => (
          <div key={e.id} className="text-sm">
            {e.nome} — estoque {e.estoque}
          </div>
        ))}
      </Card>

      {/* 🔹 COLABORADORES POR SETOR */}
      <Card title="👥 Colaboradores por Setor">
        {!colabs && <p>Nenhum colaborador encontrado.</p>}

        {Object.entries(colabs).map(([setorId, lista]: any) => (
          <div key={setorId} className="mb-4">
            <strong className="text-gray-800">
              Setor: {setorId}
            </strong>

            <div className="mt-1 space-y-1">
              {lista.map((c: any) => (
                <div key={c.id} className="text-sm ml-3">
                  👤 {c.nome} ({c.matricula})
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
