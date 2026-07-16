import { useState, useEffect, useCallback } from 'react';
import {
  loadTriageState,
  saveTriageState,
  loadBannerDismissed,
  saveBannerDismissed,
  clearData,
} from '../utils/storage';
import HowToBanner from './HowToBanner';
import KPICards from './KPICards';
import FilterBar from './FilterBar';
import Charts from './Charts';
import TopRecs from './TopRecs';
import RecommendationTable from './RecommendationTable';

const EMPTY_FILTERS = { workloads: new Set(), categories: new Set(), impacts: new Set(), search: '' };

function applyFilters(rows, filters) {
  return rows.filter(row => {
    if (filters.workloads.size > 0 && !filters.workloads.has(row.workload)) return false;
    if (filters.categories.size > 0 && !filters.categories.has(row.category)) return false;
    if (filters.impacts.size > 0 && !filters.impacts.has(row.impact)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !row.recommendation.toLowerCase().includes(q) &&
        !row.resourceName.toLowerCase().includes(q) &&
        !row.workload.toLowerCase().includes(q) &&
        !row.category.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
}

export default function Dashboard({ rows, onReset }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [triageState, setTriageState] = useState({});
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setTriageState(loadTriageState());
    setBannerDismissed(loadBannerDismissed());
    const saved = document.documentElement.getAttribute('data-theme');
    setTheme(saved || 'light');
  }, []);

  useEffect(() => {
    saveTriageState(triageState);
  }, [triageState]);

  const handleTriageChange = useCallback((rec, update) => {
    setTriageState(prev => ({ ...prev, [rec]: update }));
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('advisor-theme', next);
  }

  function handleDismissBanner() {
    setBannerDismissed(true);
    saveBannerDismissed(true);
  }

  function handleReset() {
    clearData();
    onReset();
  }

  const filteredRows = applyFilters(rows, filters);

  return (
    <>
      <header className="header">
        <div className="header-logo">⚡</div>
        <div>
          <div className="header-title">Azure Advisor Triage</div>
          <div className="header-subtitle">Recommendations Dashboard</div>
        </div>
        <div className="header-spacer" />
        <span className="header-meta">
          {filteredRows.length !== rows.length
            ? `${filteredRows.length} of ${rows.length} items`
            : `${rows.length} items`}
        </span>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn" onClick={handleReset}>⟳ Load new file</button>
        </div>
      </header>

      <main className="main">
        {!bannerDismissed && <HowToBanner onDismiss={handleDismissBanner} />}
        <KPICards rows={filteredRows} />
        <FilterBar rows={rows} filters={filters} onFiltersChange={setFilters} />
        <Charts rows={filteredRows} />
        <TopRecs rows={filteredRows} />
        <RecommendationTable
          rows={filteredRows}
          triageState={triageState}
          onTriageChange={handleTriageChange}
        />
      </main>
    </>
  );
}
