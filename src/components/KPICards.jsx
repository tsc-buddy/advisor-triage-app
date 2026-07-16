function fmt(n) {
  return n.toLocaleString('en-NZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function KPICards({ rows }) {
  const total = rows.length;
  const highCount = rows.filter(r => r.impact === 'High').length;
  const secCount = rows.filter(r => r.category === 'Security').length;
  const uniqueRecs = new Set(rows.map(r => r.recommendation)).size;

  const totalSavings = rows.reduce((sum, r) => {
    const v = parseFloat(r.savings);
    return isNaN(v) ? sum : sum + v;
  }, 0);
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
