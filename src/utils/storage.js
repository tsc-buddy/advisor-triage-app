const DATA_KEY = 'advisor-triage-data';
const TRIAGE_KEY = 'advisor-triage-status';
const BANNER_KEY = 'advisor-triage-banner-dismissed';
const THEME_KEY = 'advisor-theme';

export function saveData(rows) { localStorage.setItem(DATA_KEY, JSON.stringify(rows)); }
export function loadData() {
  try {
    const v = localStorage.getItem(DATA_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
export function clearData() { localStorage.removeItem(DATA_KEY); }

export function saveTriageState(state) { localStorage.setItem(TRIAGE_KEY, JSON.stringify(state)); }
export function loadTriageState() {
  try {
    const v = localStorage.getItem(TRIAGE_KEY);
    return v ? JSON.parse(v) : {};
  } catch { return {}; }
}

export function saveBannerDismissed(val) { localStorage.setItem(BANNER_KEY, val ? '1' : '0'); }
export function loadBannerDismissed() { return localStorage.getItem(BANNER_KEY) === '1'; }

export function saveTheme(theme) { localStorage.setItem(THEME_KEY, theme); }
export function loadTheme() {
  return localStorage.getItem(THEME_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
