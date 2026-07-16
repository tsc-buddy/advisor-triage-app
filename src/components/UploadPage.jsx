import { useState, useRef } from 'react';
import { parseAdvisorCsv } from '../utils/csvParser';
import { saveTriageState, loadTriageState } from '../utils/storage';

export default function UploadPage({ onLoad }) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function processFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a .csv file.');
      return;
    }
    setLoading(true);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const { rows, triageState } = parseAdvisorCsv(e.target.result);
        if (rows.length === 0) {
          setError('No valid recommendations found in this CSV.');
          setLoading(false);
          return;
        }
        // rows are NOT persisted to localStorage (quota); triage state persists separately
        // Merge triage state (preserve existing decisions)
        if (Object.keys(triageState).length > 0) {
          const existing = loadTriageState();
          saveTriageState({ ...existing, ...triageState });
        }
        onLoad(rows);
      } catch (err) {
        setError('Failed to parse CSV: ' + err.message);
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setLoading(false);
    };
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(e) {
    processFile(e.target.files[0]);
  }

  return (
    <div className="upload-page">
      <div className="upload-logo">⚡</div>
      <h1 className="upload-heading">Azure Advisor Triage</h1>
      <p className="upload-sub">Upload your Azure Advisor CSV export to get started</p>

      {loading ? (
        <div className="upload-loading">Parsing recommendations…</div>
      ) : (
        <div
          className={`drop-zone${dragOver ? ' drag-over' : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
          <div className="drop-icon">📋</div>
          <div className="drop-heading">Drop your Azure Advisor CSV here</div>
          <div className="drop-sub">Exported from the Azure Portal Advisor blade</div>
          <div className="drop-cta">or browse to upload</div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
        </div>
      )}

      {error && <div className="upload-error">{error}</div>}

      <div className="upload-footer">
        🔒 Data stays in your browser — nothing is uploaded
      </div>
    </div>
  );
}
