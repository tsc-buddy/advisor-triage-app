/**
 * Quote a CSV field if it contains commas, newlines, or quotes.
 */
function quoteField(val) {
  const s = val === null || val === undefined ? '' : String(val);
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const COLUMNS = [
  'Category',
  'Business Impact',
  'Critical risk',
  'Recommendation',
  'Subscription ID',
  'Subscription Name',
  'Resource Group',
  'Resource Name',
  'Type',
  'Retirement date',
  'Retiring feature',
  'Status',
  'Notes',
];

/**
 * Export rows + triage state to CSV and trigger download.
 */
export function exportToCsv(rows, triageState) {
  const header = COLUMNS.map(quoteField).join(',');

  const lines = rows.map(row => {
    const t = triageState[row.recommendation] || {};
    return [
      row.category,
      row.impact,
      row.criticalRisk,
      row.recommendation,
      row.subscriptionId,
      row.subscriptionName,
      row.resourceGroup,
      row.resourceName,
      row.type,
      row.retirementDate,
      row.retiringFeature,
      t.status && t.status !== 'unset' ? t.status : '',
      t.notes || '',
    ].map(quoteField).join(',');
  });

  const csv = [header, ...lines].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'advisor-triage-export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
