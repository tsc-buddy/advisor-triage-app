const DATA_KEY = 'advisor-triage-data';
const TRIAGE_KEY = 'advisor-triage-status';
const BANNER_KEY = 'advisor-triage-banner-dismissed';

export function saveData(rows) { localStorage.setItem(DATA_KEY, JSON.stringify(rows)); }
export function loadData() { const v = localStorage.getItem(DATA_KEY); return v ? JSON.parse(v) : null; }
export function clearData() { localStorage.removeItem(DATA_KEY); }

export function saveTriageState(state) { localStorage.setItem(TRIAGE_KEY, JSON.stringify(state)); }
export function loadTriageState() { const v = localStorage.getItem(TRIAGE_KEY); return v ? JSON.parse(v) : {}; }

export function saveBannerDismissed(val) { localStorage.setItem(BANNER_KEY, val ? '1' : '0'); }
export function loadBannerDismissed() { return localStorage.getItem(BANNER_KEY) === '1'; }
