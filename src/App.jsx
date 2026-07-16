import { useState, useEffect } from 'react';
import UploadPage from './components/UploadPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('advisor-theme');
    const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    // rows are not persisted; user re-uploads the CSV each session
  }, []);

  if (!rows) return <UploadPage onLoad={setRows} />;
  return <Dashboard rows={rows} onReset={() => setRows(null)} />;
}
