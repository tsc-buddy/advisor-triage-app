/**
 * Robust CSV parser — handles quoted fields with commas/newlines,
 * escaped double-quotes (""), and optional sep= first line.
 */
function parseCSV(text) {
  // Normalise line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Strip optional sep= line — handles both `sep=,` and `"sep=,"` (quoted variant)
  const sepMatch = text.match(/^"?sep=[^"\n]*"?\n/i);
  if (sepMatch) text = text.slice(sepMatch[0].length);

  const rows = [];
  let i = 0;
  const len = text.length;

  function parseRow() {
    const cells = [];
    while (i < len && text[i] !== '\n') {
      if (text[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let cell = '';
        while (i < len) {
          if (text[i] === '"') {
            if (i + 1 < len && text[i + 1] === '"') {
              cell += '"';
              i += 2;
            } else {
              i++; // skip closing quote
              break;
            }
          } else {
            cell += text[i++];
          }
        }
        cells.push(cell);
        // skip comma
        if (i < len && text[i] === ',') i++;
      } else {
        // Unquoted field
        let start = i;
        while (i < len && text[i] !== ',' && text[i] !== '\n') i++;
        cells.push(text.slice(start, i));
        if (i < len && text[i] === ',') i++;
      }
    }
    if (i < len && text[i] === '\n') i++; // skip newline
    return cells;
  }

  // Parse header row
  const headers = parseRow();

  while (i < len) {
    const cells = parseRow();
    if (cells.length === 0 || (cells.length === 1 && cells[0] === '')) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cells[idx] !== undefined ? cells[idx] : '';
    });
    rows.push(obj);
  }

  return { headers, rows };
}

/**
 * Derives workload from subscription name:
 * take text before first " (", trim, replace _ with -
 */
function deriveWorkload(subscriptionName) {
  if (!subscriptionName) return '';
  const before = subscriptionName.split(' (')[0];
  return before.trim().replace(/_/g, '-');
}

/**
 * Normalise impact: capitalise first letter, lowercase rest
 */
function normaliseImpact(val) {
  if (!val) return '';
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
}

/**
 * Parse Azure Advisor CSV export.
 * Returns { rows: ParsedRow[], triageState: object }
 */
export function parseAdvisorCsv(text) {
  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

  const { headers, rows: rawRows } = parseCSV(text);

  // Check if re-import (has Status/Notes columns)
  const hasStatus = headers.some(h => h.trim().toLowerCase() === 'status');
  const hasNotes = headers.some(h => h.trim().toLowerCase() === 'notes');

  // Build a case-insensitive header lookup
  function col(row, ...candidates) {
    for (const c of candidates) {
      const key = Object.keys(row).find(k => k.trim().toLowerCase() === c.toLowerCase());
      if (key !== undefined) return row[key] || '';
    }
    return '';
  }

  const triageState = {};
  const parsed = [];

  for (const row of rawRows) {
    const recommendation = col(row, 'Recommendation');
    if (!recommendation.trim()) continue;

    const subscriptionName = col(row, 'Subscription Name');
    const workload = deriveWorkload(subscriptionName);

    parsed.push({
      category: col(row, 'Category'),
      impact: normaliseImpact(col(row, 'Business Impact', 'Impact')),
      criticalRisk: col(row, 'Critical risk', 'Critical Risk'),
      recommendation,
      subscriptionId: col(row, 'Subscription ID'),
      subscriptionName,
      workload,
      resourceGroup: col(row, 'Resource Group'),
      resourceName: col(row, 'Resource Name'),
      type: col(row, 'Type', 'Resource Type'),
      potentialBenefits: col(row, 'Potential benefits', 'Potential Benefits'),
      savings: col(row, 'Potential Annual Cost Savings', 'Annual Savings', 'Savings'),
      currency: col(row, 'Potential Cost Savings Currency', 'Currency'),
      retirementDate: col(row, 'Retirement date', 'Retirement Date'),
      retiringFeature: col(row, 'Retiring feature', 'Retiring Feature'),
    });

    // Read back triage data if present
    if (hasStatus || hasNotes) {
      const status = col(row, 'Status').trim().toLowerCase();
      const notes = col(row, 'Notes').trim();
      const validStatuses = ['remediate', 'dismiss', 'exempt'];
      if (status || notes) {
        triageState[recommendation] = {
          status: validStatuses.includes(status) ? status : 'unset',
          notes,
          updatedAt: new Date().toISOString(),
        };
      }
    }
  }

  return { rows: parsed, triageState };
}
