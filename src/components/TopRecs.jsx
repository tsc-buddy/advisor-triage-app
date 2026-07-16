import PropTypes from 'prop-types';
import { workloadColorClass } from '../utils/workloadColor';
import { rowShape } from '../utils/propTypes';

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

function impBadgeClass(imp) {
  return `badge-impact-${(imp || '').toLowerCase()}`;
}

export default function TopRecs({ rows }) {
  // Group by recommendation
  const grouped = {};
  rows.forEach(row => {
    const key = row.recommendation;
    if (!grouped[key]) {
      grouped[key] = {
        recommendation: key,
        category: row.category,
        impact: row.impact,
        workloads: new Set(),
        retirementDate: '',
        rows: [],
      };
    }
    grouped[key].workloads.add(row.workload);
    grouped[key].rows.push(row);
    if (row.retirementDate && !grouped[key].retirementDate) {
      grouped[key].retirementDate = row.retirementDate;
    }
  });

  const sorted = Object.values(grouped).sort((a, b) => {
    const wlDiff = b.workloads.size - a.workloads.size;
    if (wlDiff !== 0) return wlDiff;
    const impDiff = (IMPACT_ORDER[b.impact] || 0) - (IMPACT_ORDER[a.impact] || 0);
    if (impDiff !== 0) return impDiff;
    return b.rows.length - a.rows.length;
  });

  const total = sorted.length;
  const top6 = sorted.slice(0, 6);

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Top Cross-Workload Recommendations</span>
        {total > 6 && (
          <span className="section-meta">Top 6 of {total} unique</span>
        )}
      </div>
      <div className="top-recs-grid">
        {top6.map((rec, idx) => (
          <div className="rec-card" key={rec.recommendation}>
            <div className="rec-card-top">
              <span className="rec-rank">#{idx + 1}</span>
              <span className={`badge ${catBadgeClass(rec.category)}`}>{rec.category}</span>
              <span className={`badge ${impBadgeClass(rec.impact)}`}>{rec.impact}</span>
            </div>
            <div className="rec-text">{rec.recommendation}</div>
            <div className="wl-tags">
              {[...rec.workloads].sort().map(wl => (
                <span key={wl} className={`wl-tag ${workloadColorClass(wl)}`}>{wl}</span>
              ))}
            </div>
            <div className="rec-card-footer">
              <div className="rec-card-footer-left">
                <span className="rec-footer-meta">{rec.rows.length} instance{rec.rows.length !== 1 ? 's' : ''}</span>
                <span className="rec-footer-meta">·</span>
                <span className="rec-footer-meta">{rec.workloads.size} workload{rec.workloads.size !== 1 ? 's' : ''}</span>
              </div>
              {rec.retirementDate && (
                <span className="rec-retirement">⚠ Retires {rec.retirementDate}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
TopRecs.propTypes = {
  rows: PropTypes.arrayOf(rowShape).isRequired,
};