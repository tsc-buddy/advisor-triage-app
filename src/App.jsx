import { useState, useEffect } from 'react';
import UploadPage from './components/UploadPage';
import Dashboard from './components/Dashboard';
import { loadTheme } from './utils/storage';

export default function App() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const theme = loadTheme();
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  if (!rows) return <UploadPage onLoad={setRows} />;
  return <Dashboard rows={rows} onReset={() => setRows(null)} />;
}
