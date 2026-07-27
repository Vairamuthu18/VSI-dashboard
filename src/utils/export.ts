/**
 * SearchIntel Export Utility Functions
 * Handles client-side CSV downloads and printable HTML/PDF report creation.
 */

export interface ExportDataRow {
  keyword: string;
  clientName: string;
  trackType: string;
  rankPosition?: number | null;
  aioPresent: boolean;
  classification: string;
  createdAt: string;
}

export function downloadCSV(filename: string, rows: ExportDataRow[]) {
  if (!rows || rows.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = ["Keyword Query", "Client Domain", "Track Type", "Google Rank Position", "AI Overview Present", "AI Classification", "Scan Date"];
  
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => [
      `"${(row.keyword || "").replace(/"/g, '""')}"`,
      `"${(row.clientName || "").replace(/"/g, '""')}"`,
      `"${(row.trackType || "").replace(/"/g, '""')}"`,
      row.rankPosition ? row.rankPosition : "N/A",
      row.aioPresent ? "Yes" : "No",
      `"${(row.classification || "").replace(/"/g, '""')}"`,
      `"${new Date(row.createdAt).toLocaleDateString()}"`,
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPrintablePDF(reportTitle: string, rows: ExportDataRow[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate PDF report.");
    return;
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle} - SearchIntel Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 40px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
          .title { font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 5px; }
          .meta { font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #f8fafc; text-align: left; padding: 10px 12px; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 10px; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
          .badge-win { background: #dcfce7; color: #15803d; }
          .badge-mention { background: #cff4fc; color: #087990; }
          .badge-invisible { background: #fef3c7; color: #b45309; }
          .footer { margin-top: 40px; pt: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">SearchIntel</div>
            <div class="title">${reportTitle}</div>
          </div>
          <div class="meta">
            <div>Generated: ${dateStr}</div>
            <div>Records: ${rows.length}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Keyword Query</th>
              <th>Client Domain</th>
              <th>Track Type</th>
              <th>Google Rank</th>
              <th>AI Overview</th>
              <th>Classification</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td><strong>${row.keyword}</strong></td>
                <td>${row.clientName}</td>
                <td>${row.trackType}</td>
                <td>${row.rankPosition ? '#' + row.rankPosition : '—'}</td>
                <td>${row.aioPresent ? 'Present' : 'None'}</td>
                <td>
                  <span class="badge ${
                    row.classification.includes('aligned') || row.classification.includes('geo_cited') ? 'badge-win' :
                    row.classification.includes('mention') ? 'badge-mention' : 'badge-invisible'
                  }">
                    ${row.classification.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by SearchIntel AI Search Intelligence Engine
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
