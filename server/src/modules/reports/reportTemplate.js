export function generateReportHtml({ inspection, evidenceList, reportNumber, officerName, generatedAt }) {
  const findings = inspection.ruleEvaluations || [];
  const summary = inspection.summary || {};
  const facts = inspection.normalizedFacts || {};

  const passedRows = findings.filter(f => f.status === 'PASS');
  const failedRows = findings.filter(f => f.status === 'FAIL');
  const reviewRows = findings.filter(f => f.status === 'REVIEW' || f.status === 'UNKNOWN');

  const evidenceImagesHtml = evidenceList.map((e, idx) => `
    <div style="display: inline-block; margin: 8px; text-align: center; border: 1px solid #cbd5e1; padding: 4px; border-radius: 4px;">
      <img src="${e.base64Data}" alt="Evidence ${idx + 1}" style="max-width: 180px; max-height: 180px; object-fit: contain; display: block;" />
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Evidence #${idx + 1} (${e.originalFilename})</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Legal Metrology Inspection Report — ${inspection.referenceNumber}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.4; font-size: 12px; margin: 0; padding: 0; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 20px; font-weight: bold; color: #0369a1; text-transform: uppercase; margin-bottom: 4px; }
    .subtitle { font-size: 12px; color: #475569; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
    .badge-pass { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .badge-fail { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .badge-review { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .grid-2 { display: flex; gap: 16px; margin-bottom: 16px; }
    .card { flex: 1; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background: #f8fafc; }
    .card-title { font-size: 12px; font-weight: bold; color: #334155; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .meta-label { color: #64748b; font-weight: 500; }
    .meta-val { font-weight: 600; color: #0f172a; }
    .table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px; }
    .table th { background: #f1f5f9; text-align: left; padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; color: #334155; }
    .table td { padding: 8px; border: 1px solid #e2e8f0; font-size: 11px; }
    .disclaimer { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px; font-size: 11px; color: #92400e; margin-top: 20px; border-radius: 0 4px 4px 0; }
    .score-dial { text-align: center; padding: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; }
    .score-num { font-size: 28px; font-weight: bold; color: #166534; }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="title">Directorate of Legal Metrology</div>
      <div class="subtitle">Government Enforcement Inspection Compliance Assessment Report</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Governed under Legal Metrology (Packaged Commodities) Rules, 2011 & Official Amendments</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold; color: #0284c7;">Report No: ${reportNumber}</div>
      <div style="font-size: 11px; color: #64748b;">Date: ${new Date(generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">Inspection Metadata</div>
      <div class="meta-row"><span class="meta-label">Inspection Reference:</span><span class="meta-val">${inspection.referenceNumber}</span></div>
      <div class="meta-row"><span class="meta-label">Establishment / Premises:</span><span class="meta-val">${inspection.establishmentName}</span></div>
      <div class="meta-row"><span class="meta-label">Location / Jurisdiction:</span><span class="meta-val">${inspection.location || 'Local Division'}</span></div>
      <div class="meta-row"><span class="meta-label">Commodity Category:</span><span class="meta-val">${inspection.commodityCategory}</span></div>
      <div class="meta-row"><span class="meta-label">Inspecting Officer:</span><span class="meta-val">${officerName}</span></div>
    </div>
    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div class="card-title">Compliance Evaluation Summary</div>
      <div style="display: flex; justify-content: space-around; align-items: center;">
        <div class="score-dial">
          <div class="score-num">${summary.score || 0}%</div>
          <div style="font-size: 10px; color: #166534; font-weight: bold;">Assessment Score</div>
        </div>
        <div>
          <div style="margin-bottom: 4px;"><span class="badge badge-${(summary.overallStatus || 'UNKNOWN').toLowerCase()}">${summary.overallStatus || 'UNKNOWN'}</span></div>
          <div style="font-size: 10px; color: #64748b;">Resolved Checks: <b>${summary.resolvedChecks || 0} / ${summary.totalChecks || 10}</b></div>
          <div style="font-size: 10px; color: #16a34a;">Passed: <b>${summary.passedChecks || 0}</b></div>
          <div style="font-size: 10px; color: #dc2626;">Violations: <b>${summary.failedChecks || 0}</b></div>
          <div style="font-size: 10px; color: #d97706;">Review/Unresolved: <b>${(summary.reviewChecks || 0) + (summary.unknownChecks || 0)}</b></div>
        </div>
      </div>
      <div style="font-size: 10px; color: #64748b; text-align: right; margin-top: 6px;">Active Rule-Set: <b>${inspection.ruleSetVersion || 'PCR-INDIA-2026-08-v1'}</b></div>
    </div>
  </div>

  <div style="font-weight: bold; font-size: 13px; color: #1e293b; margin-top: 14px; margin-bottom: 6px;">Evidence Photographs (${evidenceList.length} Attached)</div>
  <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; background: #fff; text-align: center;">
    ${evidenceImagesHtml || '<div style="padding: 20px; color: #94a3b8;">No evidence images attached.</div>'}
  </div>

  <div style="font-weight: bold; font-size: 13px; color: #1e293b; margin-top: 18px; margin-bottom: 6px;">Extracted Mandatory Declarations</div>
  <table class="table">
    <thead>
      <tr>
        <th style="width: 25%;">Mandatory Declaration Field</th>
        <th style="width: 50%;">Observed / Extracted Value</th>
        <th style="width: 25%;">Legal Requirement Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>Common / Generic Name</b></td>
        <td>${facts.genericName || facts.productName || '<span style="color: #ef4444;">Not declared</span>'}</td>
        <td>${facts.genericName ? '<span class="badge badge-pass">Present</span>' : '<span class="badge badge-fail">Missing</span>'}</td>
      </tr>
      <tr>
        <td><b>Manufacturer / Packer</b></td>
        <td>${facts.manufacturer?.raw || facts.packer?.raw || '<span style="color: #ef4444;">Not declared</span>'}</td>
        <td>${(facts.manufacturer?.hasPrefix || facts.packer?.hasPrefix) ? '<span class="badge badge-pass">Present</span>' : '<span class="badge badge-review">Requires Prefix</span>'}</td>
      </tr>
      <tr>
        <td><b>Net Quantity</b></td>
        <td>${facts.netQuantity?.raw || '<span style="color: #ef4444;">Not declared</span>'}</td>
        <td>${facts.netQuantity?.isStandardMetric ? '<span class="badge badge-pass">Standard Units</span>' : '<span class="badge badge-fail">Non-standard / Missing</span>'}</td>
      </tr>
      <tr>
        <td><b>Maximum Retail Price (MRP)</b></td>
        <td>${facts.mrp?.raw || '<span style="color: #ef4444;">Not declared</span>'}</td>
        <td>${facts.mrp?.hasTaxesClause ? '<span class="badge badge-pass">Valid</span>' : '<span class="badge badge-review">Check Taxes Clause</span>'}</td>
      </tr>
      <tr>
        <td><b>Unit Sale Price (USP)</b></td>
        <td>${facts.unitSalePrice?.raw || '<span style="color: #64748b;">Not declared</span>'}</td>
        <td>${facts.unitSalePrice?.declared ? '<span class="badge badge-pass">Declared</span>' : '<span class="badge badge-review">Evaluated under Rule 6(11)</span>'}</td>
      </tr>
      <tr>
        <td><b>Date of Manufacture / Packing</b></td>
        <td>${facts.manufactureDate?.formatted || '<span style="color: #ef4444;">Not declared</span>'}</td>
        <td>${facts.manufactureDate?.formatted ? '<span class="badge badge-pass">Valid (MM/YYYY)</span>' : '<span class="badge badge-fail">Missing</span>'}</td>
      </tr>
      <tr>
        <td><b>Consumer Care Helpline / Email</b></td>
        <td>${facts.consumerCare?.phone ? `Helpline: ${facts.consumerCare.phone} | Email: ${facts.consumerCare.email || 'N/A'}` : '<span style="color: #ef4444;">Missing Helpline</span>'}</td>
        <td>${facts.consumerCare?.isComplete ? '<span class="badge badge-pass">Complete</span>' : '<span class="badge badge-review">Incomplete</span>'}</td>
      </tr>
      <tr>
        <td><b>Country of Origin</b></td>
        <td>${facts.countryOfOrigin || '<span style="color: #64748b;">Not declared</span>'}</td>
        <td>${facts.countryOfOrigin ? '<span class="badge badge-pass">Declared</span>' : '<span class="badge badge-review">Review for imports</span>'}</td>
      </tr>
    </tbody>
  </table>

  <div style="font-weight: bold; font-size: 13px; color: #1e293b; margin-top: 18px; margin-bottom: 6px;">Deterministic Legal Rule Evaluation Matrix</div>
  <table class="table">
    <thead>
      <tr>
        <th style="width: 15%;">Rule ID</th>
        <th style="width: 25%;">Rule Requirement</th>
        <th style="width: 12%;">Outcome</th>
        <th style="width: 48%;">Legal Finding & Explanation</th>
      </tr>
    </thead>
    <tbody>
      ${findings.map(f => `
        <tr>
          <td><span style="font-family: monospace; font-size: 10px; font-weight: bold;">${f.ruleId}</span></td>
          <td><b>${f.ruleTitle}</b><br><span style="font-size: 9px; color: #64748b;">${f.legalSource?.rule || ''}</span></td>
          <td><span class="badge badge-${f.status.toLowerCase()}">${f.status}</span></td>
          <td>
            <div>${f.explanation}</div>
            ${f.expected ? `<div style="font-size: 9px; color: #475569; margin-top: 2px;"><b>Expected:</b> ${f.expected}</div>` : ''}
            ${f.observed ? `<div style="font-size: 9px; color: #475569;"><b>Observed:</b> ${f.observed}</div>` : ''}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="disclaimer">
    <b>AI-Assisted Assessment Notice & Legal Boundary:</b><br>
    This inspection report is generated using an automated optical character extraction and deterministic rule engine assistance tool. Findings are indicative to aid enforcement officers and do not constitute a final judicial determination under the Legal Metrology Act, 2009. Official legal proceedings or compound notices must be based on physical sample seizure and officer verification.
  </div>

  <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px;">
    <div>
      <div><b>System Generated:</b> ${new Date().toISOString()}</div>
      <div><b>Hash ID:</b> ${reportNumber}</div>
    </div>
    <div style="text-align: right; border-top: 1px solid #000; width: 200px; padding-top: 4px;">
      <b>Signature of Inspecting Officer</b><br>
      (${officerName})
    </div>
  </div>

</body>
</html>`;
}

