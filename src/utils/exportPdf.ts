import jsPDF from "jspdf";
import "jspdf-autotable";

export function exportPDF(title: string, rows: any[]) {
  if (!rows || rows.length === 0) {
    alert("Nenhum dado para exportar.");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 15);

  const headers = [Object.keys(rows[0])];
  const body = rows.map((r) => Object.values(r));

  (doc as any).autoTable({
    startY: 25,
    head: headers,
    body,
    styles: { fontSize: 10 },
  });

  doc.save(`${title}.pdf`);
}
