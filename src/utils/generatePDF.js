// PDF Report generation utility.
// Creates a printable HTML report in a new window and triggers browser print dialog.
// The user can then save as PDF via the browser's "Save as PDF" print option.

/**
 * Generate and download a PDF report for the given event
 * @param {Object} event - The event data
 * @param {Object} stats - Computed statistics for the event
 */
export function generatePDFReport(event, stats) {
  const totalCO2_t = (stats.extrapolated / 1000).toFixed(2);
  const perPerson = (stats.avg / 1000).toFixed(3);
  const rawT = (stats.totalActual / 1000).toFixed(2);
  const transportPct = stats.totalActual > 0 ? ((stats.transportTotal / stats.totalActual) * 100).toFixed(0) : "0";
  const hotelPct = stats.totalActual > 0 ? ((stats.hotelTotal / stats.totalActual) * 100).toFixed(0) : "0";
  const largestContrib = parseFloat(transportPct) >= parseFloat(hotelPct) ? "Transport" : "Accommodation";
  const largestPct = Math.max(parseFloat(transportPct) || 0, parseFloat(hotelPct) || 0);
  const validPct = stats.validRate.toFixed(1);

  const offsetStatus = event.offsetStatus || "pending";
  const offsetLabels = {
    pending: "Pending - Strategy in development",
    in_progress: "In Progress - Offsetting underway",
    completed: "Completed - Fully offset",
    not_planned: "Not Planned"
  };

  const reportDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Carbon Report - ${event.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #111827;
          line-height: 1.5;
          padding: 40px;
          max-width: 900px;
          margin: 0 auto;
        }
        @media print {
          body { padding: 20px; }
          .page-break { page-break-before: always; }
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f766e;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo { font-size: 24px; font-weight: 700; color: #0f766e; }
        .logo-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .report-meta { text-align: right; font-size: 13px; color: #6b7280; }
        .report-meta strong { color: #111827; }
        h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .event-details { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
        .event-details span { margin-right: 16px; }
        h2 {
          font-size: 18px;
          font-weight: 700;
          color: #0f766e;
          margin: 28px 0 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .kpi-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }
        .kpi-label { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
        .kpi-value { font-size: 28px; font-weight: 800; font-family: monospace; }
        .kpi-unit { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .accent { color: #0f766e; }
        .orange { color: #ea580c; }
        .section {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }
        .section-content { font-size: 13px; color: #6b7280; line-height: 1.7; }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin: 16px 0;
        }
        th, td {
          text-align: left;
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background: #f9fafb;
          font-weight: 600;
          color: #6b7280;
          font-size: 12px;
        }
        td.number { text-align: right; font-family: monospace; }
        .bar-container {
          height: 10px;
          background: #e5e7eb;
          border-radius: 5px;
          overflow: hidden;
          margin: 8px 0;
        }
        .bar { height: 100%; border-radius: 5px; }
        .bar-green { background: linear-gradient(90deg, #16a34a, #22c55e); }
        .bar-teal { background: #0f766e; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 11px;
          color: #9ca3af;
          text-align: center;
        }
        .caveat {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 12px;
          color: #78350f;
          margin-top: 16px;
        }
        .caveat-title { font-weight: 700; color: #92400e; margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">CarbonTrace</div>
          <div class="logo-sub">Event Carbon Footprint Report</div>
        </div>
        <div class="report-meta">
          <div>Report Generated: <strong>${reportDate}</strong></div>
          <div>Data Source: Survey + CSV Import</div>
        </div>
      </div>

      <h1>${event.name}</h1>
      <div class="event-details">
        ${event.date ? `<span>Date: ${event.date}${event.endDate ? ` - ${event.endDate}` : ''}</span>` : ''}
        ${event.location ? `<span>Location: ${event.location}</span>` : ''}
        <span>Participants: ${stats.total}</span>
      </div>

      <h2>Executive Summary</h2>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Carbon Footprint</div>
          <div class="kpi-value">${totalCO2_t}</div>
          <div class="kpi-unit">tonnes CO₂e</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Per-Participant Emission</div>
          <div class="kpi-value accent">${perPerson}</div>
          <div class="kpi-unit">tonnes CO₂e per person</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Largest Contributor</div>
          <div class="kpi-value orange">${largestPct}%</div>
          <div class="kpi-unit">${largestContrib}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Key Drivers Analysis</div>
        <div class="section-content">
          ${stats.submitted.length > 0
            ? `${largestContrib} accounted for ${largestPct}% of total emissions, making delegate travel the dominant source of the event's carbon footprint. ${stats.responders} of ${stats.total} participants have valid data entries.`
            : "No participant data available. Invite participants to complete the emissions survey or import CSV data."}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Offsetting Status</div>
        <div class="section-content">${offsetLabels[offsetStatus]}</div>
      </div>

      <h2>Data Quality & Methodology</h2>
      <div class="section">
        <div class="section-title">Data Validity Overview</div>
        <div class="section-content">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Valid entries</span>
            <span>${stats.responders} of ${stats.total} participants (${validPct}%)</span>
          </div>
          <div class="bar-container">
            <div class="bar bar-green" style="width: ${validPct}%"></div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Extrapolation Summary</div>
        <table>
          <tr>
            <td>Total Registrations</td>
            <td class="number">${stats.total}</td>
          </tr>
          <tr>
            <td>Valid Entries</td>
            <td class="number">${stats.responders}</td>
          </tr>
          <tr>
            <td>Invalid / Incomplete</td>
            <td class="number">${stats.invalid}</td>
          </tr>
          <tr>
            <td>Extrapolation Factor</td>
            <td class="number">${stats.extrapolationFactor.toFixed(4)}</td>
          </tr>
          <tr>
            <td>Raw Emissions (Valid Only)</td>
            <td class="number">${rawT} tonnes CO₂e</td>
          </tr>
          <tr>
            <td><strong>Extrapolated Total</strong></td>
            <td class="number"><strong>${totalCO2_t} tonnes CO₂e</strong></td>
          </tr>
        </table>
      </div>

      <div class="caveat">
        <div class="caveat-title">Caveats & Limitations</div>
        <ul style="margin-left: 16px; margin-top: 8px;">
          <li>This extrapolation assumes missing data follows the same distribution as valid data</li>
          <li>Local transport (organizer-arranged legs) is calculated for all participants regardless</li>
          <li>Accommodation extrapolation uses average hotel nights per valid participant</li>
          <li>Some incomplete entries may be local participants who did not travel internationally</li>
        </ul>
      </div>

      <div class="section" style="margin-top: 24px;">
        <div class="section-title">Emission Factors Source</div>
        <div class="section-content">
          All emission factors used in this report are sourced from DEFRA 2025 greenhouse gas conversion factors for company reporting.
        </div>
      </div>

      <div class="footer">
        <p>Generated by CarbonTrace | ${reportDate}</p>
        <p>This report is based on data submitted by participants and may not reflect complete travel patterns.</p>
      </div>
    </body>
    </html>
  `;

  // Open a new window with the report content
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Please allow popups to download the PDF report.');
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}
