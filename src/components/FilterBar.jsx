import { useMemo } from 'react';

function workloadCssClass(wl) {
  // Derives a CSS class from the workload name, e.g. "APIM-PRD" → "wl-apim-prd"
  return `wl-${wl.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;
}

export default function FilterBar({ rows, filters, onFiltersChange }) {
  const allWorkloads = useMemo(
    () => [...new Set(rows.map(r => r.workload).filter(Boolean))].sort(),
    [rows],
  );
  const allCategories = useMemo(
    () => [...new Set(rows.map(r => r.category).filter(Boolean))].sort(),
    [rows],
  );
  const impacts = ['High', 'Medium', 'Low'];

  function toggleSet(key, value) {
    const next = new Set(filters[key]);
    next.has(value) ? next.delete(value) : next.add(value);
    onFiltersChange({ ...filters, [key]: next });
  }

  function reset() {
    onFiltersChange({ workloads: new Set(), categories: new Set(), impacts: new Set(), search: '' });
  }

  return (
    <div className="filters-bar">
      {/* Workloads */}
      <div className="filters-row">
        <span className="filters-label">Workload</span>
        {allWorkloads.map(wl => {
          const cssClass = workloadCssClass(wl);
          const active = filters.workloads.has(wl);
          return (
            <button
              key={wl}
              className={`pill ${cssClass}${active ? ' active' : ''}`}
              onClick={() => toggleSet('workloads', wl)}
            >
              {wl}
            </button>
          );
        })}
      </div>

      {/* Categories */}
      <div className="filters-row">
        <span className="filters-label">Category</span>
        {allCategories.map(cat => (
          <button
            key={cat}
            className={`pill${filters.categories.has(cat) ? ' active' : ''}`}
            onClick={() => toggleSet('categories', cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Impacts + Search + Reset */}
      <div className="filters-row">
        <span className="filters-label">Impact</span>
        {impacts.map(imp => {
          const cls = `impact-${imp.toLowerCase()}`;
          return (
            <button
              key={imp}
              className={`pill ${cls}${filters.impacts.has(imp) ? ' active' : ''}`}
              onClick={() => toggleSet('impacts', imp)}
            >
              {imp}
            </button>
          );
        })}
        <input
          className="search-input"
          type="text"
          placeholder="Search recommendations…"
          value={filters.search}
          onChange={e => onFiltersChange({ ...filters, search: e.target.value })}
        />
        <button className="btn" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
