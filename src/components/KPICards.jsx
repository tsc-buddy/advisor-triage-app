import PropTypes from 'prop-types';
import { rowShape } from '../utils/propTypes';

function fmt(n) {
  return n.toLocaleString('en-NZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function KPICards({ rows }) {
  const total = rows.length;

  const { highCount, secCount, recSet, totalSavings } = rows.reduce((acc, r) => {
    if (r.impact === 'High') acc.highCount++;
    if (r.category === 'Security') acc.secCount++;
    acc.recSet.add(r.recommendation);
    const v = parseFloat(r.savings);
    if (!isNaN(v)) acc.totalSavings += v;
    return acc;
  }, { highCount: 0, secCount: 0, recSet: new Set(), totalSavings: 0 });

  const uniqueRecs = recSet.size;
  const savingsStr = totalSavings > 0 ? '$' + fmt(totalSavings) : '—';

  const cards = [
    {
      label: 'Total Items',
      value: total,
      sub: 'recommendations',
      color: 'var(--cp-accent)',
    },
    {
      label: 'High Impact',
      value: highCount,
      sub: total > 0 ? `${Math.round((highCount / total) * 100)}% of total` : '—',
      color: 'var(--cp-danger)',
    },
    {
      label: 'Security',
      value: secCount,
      sub: total > 0 ? `${Math.round((secCount / total) * 100)}% of total` : '—',
      color: 'var(--cp-link)',
    },
    {
      label: 'Unique Recs',
      value: uniqueRecs,
      sub: 'distinct recommendations',
      color: 'var(--cp-warning)',
    },
    {
      label: 'Potential Savings',
      value: savingsStr,
      sub: 'NZD annually',
      color: 'var(--cp-success)',
    },
  ];

  return (
    <div className="kpi-row">
      {cards.map(card => (
        <div className="kpi-card" key={card.label} style={{ '--kpi-color': card.color }}>
          <div className="kpi-label">{card.label}</div>
          <div className="kpi-value">{card.value}</div>
          <div className="kpi-sub">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}

KPICards.propTypes = {
  rows: PropTypes.arrayOf(rowShape).isRequired,
};
