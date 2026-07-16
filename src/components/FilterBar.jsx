const WL_CSS_CLASS = {
  'APIM-PRD': 'wl-apim-prd',
  'GIS-PRD': 'wl-gis-prd',
  'RTIME-PRD': 'wl-rtime-prd',
  'Web-PRD': 'wl-web-prd',
  'DAP-PRD': 'wl-dap-prd',
  'DIKU-PRD': 'wl-diku-prd',
};

export default function FilterBar({ rows, filters, onFiltersChange }) {
  const allWorkloads = [...new Set(rows.map(r => r.workload).filter(Boolean))].sort();
  const allCategories = [...new Set(rows.map(r => r.category).filter(Boolean))].sort();
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
          const cssClass = WL_CSS_CLASS[wl] || '';
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
