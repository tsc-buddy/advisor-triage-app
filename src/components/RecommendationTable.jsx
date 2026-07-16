import { useState, useCallback, useRef, useMemo } from 'react';
import { exportToXlsx } from '../utils/xlsxExporter';

const PAGE_SIZE = 30;
const IMPACT_ORDER = { High: 3, Medium: 2, Low: 1 };

function catBadgeClass(cat) {
  const map = {
    Security: 'badge-cat-security',
    Reliability: 'badge-cat-reliability',
    Cost: 'badge-cat-cost',
    'Operational Excellence': 'badge-cat-opex',
    Performance: 'badge-cat-performance',
  };
  return map[cat] || 'badge-cat-opex';
}

function SortTh({ label, field, sort, onSort }) {
  const active = sort.field === field;
  const arrow = active ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '';
  return (
    <th className="sortable" onClick={() => onSort(field)}>
      {label}{arrow}
    </th>
  );
}

function Pagination({ page, total, pageSize, onPage }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || i === totalPages ||
      (i >= page - 2 && i <= page + 2)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} className="page-meta">…</span>
          : <button
              key={p}
              className={`page-btn${page === p ? ' active' : ''}`}
              onClick={() => onPage(p)}
            >{p}</button>
      )}
      <button className="page-btn" disabled={page === totalPages} onClick={() => onPage(page + 1)}>›</button>
      <span className="page-meta">{total} rows</span>
    </div>
  );
}

// ── By Recommendation View ──────────────────────────────────────────────────

function ByRecView({ rows, triageState, onTriageChange }) {
  const [sort, setSort] = useState({ field: 'count', dir: 'desc' });
  const [page, setPage] = useState(1);
  const notesTimers = useRef({});

  function handleSort(field) {
    setSort(prev =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'desc' }
    );
    setPage(1);
  }

  // Group rows by recommendation — memoised to avoid recomputing on every render
  const grouped = useMemo(() => {
    const map = {};
    rows.forEach(row => {
      const key = row.recommendation;
      if (!map[key]) {
        map[key] = {
          recommendation: key,
          category: row.category,
          impact: row.impact,
          potentialBenefits: row.potentialBenefits,
          retirementDate: '',
          retiringFeature: '',
          resourceNames: [],
          count: 0,
        };
      }
      map[key].count++;
      if (row.resourceName) map[key].resourceNames.push(row.resourceName);
      if (row.retirementDate && !map[key].retirementDate) {
        map[key].retirementDate = row.retirementDate;
        map[key].retiringFeature = row.retiringFeature;
      }
    });
    return map;
  }, [rows]);

  let items = Object.values(grouped);

  // Sort
  items.sort((a, b) => {
    let va, vb;
    switch (sort.field) {
      case 'recommendation': va = a.recommendation; vb = b.recommendation; break;
      case 'category': va = a.category; vb = b.category; break;
      case 'impact': va = IMPACT_ORDER[a.impact] || 0; vb = IMPACT_ORDER[b.impact] || 0; break;
      case 'count': va = a.count; vb = b.count; break;
      default: va = a.count; vb = b.count;
    }
    if (typeof va === 'string') return sort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    return sort.dir === 'asc' ? va - vb : vb - va;
  });

  const totalItems = items.length;
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = useCallback((rec, status) => {
    const current = triageState[rec] || { status: 'unset', notes: '', updatedAt: '' };
    onTriageChange(rec, { ...current, status, updatedAt: new Date().toISOString() });
  }, [triageState, onTriageChange]);

  const handleNotesChange = useCallback((rec, notes) => {
    // Debounce 300ms
    if (notesTimers.current[rec]) clearTimeout(notesTimers.current[rec]);
    notesTimers.current[rec] = setTimeout(() => {
      const current = triageState[rec] || { status: 'unset', notes: '', updatedAt: '' };
      onTriageChange(rec, { ...current, notes, updatedAt: new Date().toISOString() });
    }, 300);
  }, [triageState, onTriageChange]);

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <SortTh label="Recommendation" field="recommendation" sort={sort} onSort={handleSort} />
              <SortTh label="Category" field="category" sort={sort} onSort={handleSort} />
              <SortTh label="Impact" field="impact" sort={sort} onSort={handleSort} />
              <SortTh label="Resources" field="count" sort={sort} onSort={handleSort} />
              <th>Description</th>
              <th>Retirement Date</th>
              <th>Retiring Feature</th>
              <th>Resource Names</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => {
              const triage = triageState[item.recommendation] || { status: 'unset', notes: '' };
              const chips = [...new Set(item.resourceNames)];
              const visibleChips = chips.slice(0, 10);
              const extra = chips.length - visibleChips.length;
              return (
                <tr key={item.recommendation}>
                  <td><div className="rec-cell-text">{item.recommendation}</div></td>
                  <td>
                    <span className={`badge ${catBadgeClass(item.category)}`}>{item.category}</span>
                  </td>
                  <td>
                    <span className="impact-inline">
                      <span className={`impact-dot impact-dot-${(item.impact || '').toLowerCase()}`} />
                      {item.impact}
                    </span>
                  </td>
                  <td>{item.count}</td>
                  <td><div className="desc-cell">{item.potentialBenefits}</div></td>
                  <td>
                    {item.retirementDate
                      ? <span className="retire-date">{item.retirementDate}</span>
                      : <span className="text-soft">—</span>
                    }
                  </td>
                  <td><div className="retiring-feature-cell">{item.retiringFeature || '—'}</div></td>
                  <td>
                    <div className="res-chips">
                      {visibleChips.map(name => (
                        <span key={name} className="res-chip" title={name}>{name}</span>
                      ))}
                      {extra > 0 && (
                        <span
                          className="res-chip res-chip-more"
                          title={chips.slice(10).join(', ')}
                        >
                          +{extra} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={triage.status || 'unset'}
                      data-status={triage.status || 'unset'}
                      onChange={e => handleStatusChange(item.recommendation, e.target.value)}
                    >
                      <option value="unset">Unset</option>
                      <option value="remediate">Remediate</option>
                      <option value="dismiss">Dismiss</option>
                      <option value="exempt">Exempt</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="notes-input"
                      type="text"
                      placeholder="Add notes…"
                      defaultValue={triage.notes || ''}
                      key={item.recommendation}
                      onBlur={e => handleNotesChange(item.recommendation, e.target.value)}
                      onChange={e => handleNotesChange(item.recommendation, e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={totalItems} pageSize={PAGE_SIZE} onPage={setPage} />
    </>
  );
}

// ── All Items View ──────────────────────────────────────────────────────────

function AllItemsView({ rows }) {
  const [page, setPage] = useState(1);

  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Recommendation</th>
              <th>Workload</th>
              <th>Category</th>
              <th>Impact</th>
              <th>Resource Type</th>
              <th>Resource Name</th>
              <th>Savings</th>
              <th>Retire By</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={`${row.recommendation}__${row.subscriptionId}__${row.resourceName}`}>
                <td><div className="rec-cell-text">{row.recommendation}</div></td>
                <td>{row.workload}</td>
                <td>
                  <span className={`badge ${catBadgeClass(row.category)}`}>{row.category}</span>
                </td>
                <td>
                  <span className="impact-inline">
                    <span className={`impact-dot impact-dot-${(row.impact || '').toLowerCase()}`} />
                    {row.impact}
                  </span>
                </td>
                <td>{row.type}</td>
                <td><span className="res-chip">{row.resourceName}</span></td>
                <td>{row.savings ? `${row.currency || ''} ${row.savings}`.trim() : '—'}</td>
                <td>
                  {row.retirementDate
                    ? <span className="retire-date">{row.retirementDate}</span>
                    : '—'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE} onPage={setPage} />
    </>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function RecommendationTable({ rows, triageState, onTriageChange }) {
  const [tab, setTab] = useState('byrec');

  const handleExport = useCallback(() => {
    exportToXlsx(rows, triageState);
  }, [rows, triageState]);

  return (
    <div className="table-section">
      <div className="table-section-header">
        <div className="view-tabs">
          <button
            className={`view-tab${tab === 'byrec' ? ' active' : ''}`}
            onClick={() => setTab('byrec')}
          >
            By Recommendation
          </button>
          <button
            className={`view-tab${tab === 'all' ? ' active' : ''}`}
            onClick={() => setTab('all')}
          >
            All Items
          </button>
        </div>
        <button
          className="btn btn-accent"
          onClick={handleExport}
        >
          ↓ Export Excel
        </button>
      </div>

      {tab === 'byrec' ? (
        <ByRecView rows={rows} triageState={triageState} onTriageChange={onTriageChange} />
      ) : (
        <AllItemsView rows={rows} />
      )}
    </div>
  );
}
