import * as XLSX from 'xlsx';

/**
 * Build the "All Items" sheet — one row per resource (unchanged from CSV export).
 */
function buildAllItemsSheet(rows, triageState) {
  const headers = [
    'Category',
    'Business Impact',
    'Critical Risk',
    'Recommendation',
    'Subscription ID',
    'Subscription Name',
    'Resource Group',
    'Resource Name',
    'Type',
    'Potential Benefits',
    'Annual Savings',
    'Currency',
    'Retirement Date',
    'Retiring Feature',
    'Status',
    'Notes',
  ];

  const data = rows.map(row => {
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
      row.potentialBenefits,
      row.savings,
      row.currency,
      row.retirementDate,
      row.retiringFeature,
      t.status && t.status !== 'unset' ? t.status : '',
      t.notes || '',
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Column widths
  ws['!cols'] = [
    { wch: 18 },  // Category
    { wch: 12 },  // Business Impact
    { wch: 12 },  // Critical Risk
    { wch: 60 },  // Recommendation
    { wch: 36 },  // Subscription ID
    { wch: 24 },  // Subscription Name
    { wch: 30 },  // Resource Group
    { wch: 40 },  // Resource Name
    { wch: 28 },  // Type
    { wch: 36 },  // Potential Benefits
    { wch: 14 },  // Annual Savings
    { wch: 10 },  // Currency
    { wch: 16 },  // Retirement Date
    { wch: 36 },  // Retiring Feature
    { wch: 12 },  // Status
    { wch: 50 },  // Notes
  ];

  return ws;
}

/**
 * Build the "Summary" sheet — one row per unique recommendation.
 * Resources are collapsed into a count + semicolon-joined list.
 */
function buildSummarySheet(rows, triageState) {
  const headers = [
    'Category',
    'Business Impact',
    'Recommendation',
    'Potential Benefits',
    'Annual Savings',
    'Currency',
    'Retirement Date',
    'Retiring Feature',
    'Resource Count',
    'Affected Subscriptions',
    'Resource Names',
    'Status',
    'Notes',
  ];

  // Group rows by recommendation (preserving first-seen order)
  const order = [];
  const groups = {};
  for (const row of rows) {
    const key = row.recommendation;
    if (!groups[key]) {
      order.push(key);
      groups[key] = { row, resources: [], subs: new Set() };
    }
    if (row.resourceName) groups[key].resources.push(row.resourceName);
    if (row.subscriptionName) groups[key].subs.add(row.subscriptionName);
  }

  const data = order.map(key => {
    const { row, resources, subs } = groups[key];
    const t = triageState[key] || {};
    return [
      row.category,
      row.impact,
      row.recommendation,
      row.potentialBenefits,
      row.savings,
      row.currency,
      row.retirementDate,
      row.retiringFeature,
      resources.length,
      [...subs].join('; '),
      resources.join('; '),
      t.status && t.status !== 'unset' ? t.status : '',
      t.notes || '',
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  ws['!cols'] = [
    { wch: 18 },  // Category
    { wch: 12 },  // Business Impact
    { wch: 60 },  // Recommendation
    { wch: 36 },  // Potential Benefits
    { wch: 14 },  // Annual Savings
    { wch: 10 },  // Currency
    { wch: 16 },  // Retirement Date
    { wch: 36 },  // Retiring Feature
    { wch: 14 },  // Resource Count
    { wch: 40 },  // Affected Subscriptions
    { wch: 80 },  // Resource Names
    { wch: 12 },  // Status
    { wch: 50 },  // Notes
  ];

  return ws;
}

/**
 * Export rows + triage state to a 2-sheet Excel workbook and trigger download.
 */
export function exportToXlsx(rows, triageState) {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildSummarySheet(rows, triageState), 'Summary');
  XLSX.utils.book_append_sheet(wb, buildAllItemsSheet(rows, triageState), 'All Items');

  XLSX.writeFile(wb, 'advisor-export-triaged.xlsx');
}
