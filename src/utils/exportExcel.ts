import * as XLSX from "xlsx";

export function exportExcel(data: any[], fileName: string) {
  if (!data || data.length === 0) {
    alert("Nenhum dado para exportar.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
