import { useEffect, useRef } from 'react';

const CAT_COLORS = {
  Security: '#dc2626',
  Reliability: '#0078d4',
  Cost: '#16a34a',
  'Operational Excellence': '#f59e0b',
  Performance: '#8b5cf6',
};
const IMPACT_COLORS = { High: '#dc2626', Medium: '#f59e0b', Low: '#16a34a' };
const WL_COLORS = {
  'APIM-PRD': '#0078d4',
  'GIS-PRD': '#16a34a',
  'RTIME-PRD': '#f59e0b',
  'Web-PRD': '#8b5cf6',
  'DAP-PRD': '#b11f4b',
  'DIKU-PRD': '#0891b2',
};

function getThemeColors() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: dark ? '#919191' : '#5c5c5c',
    grid: dark ? '#474747' : '#dedede',
  };
}

function destroyChart(ref) {
  if (ref.current) {
    ref.current.destroy();
    ref.current = null;
  }
}

export default function Charts({ rows }) {
  const catCanvasRef = useRef(null);
  const impCanvasRef = useRef(null);
  const wlCanvasRef = useRef(null);
  const catChartRef = useRef(null);
  const impChartRef = useRef(null);
  const wlChartRef = useRef(null);

  useEffect(() => {
    const Chart = window.Chart;
    if (!Chart) return;

    const { text, grid } = getThemeColors();

    // --- By Category doughnut ---
    const catCounts = {};
    rows.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
    destroyChart(catChartRef);
    if (catCanvasRef.current) {
      catChartRef.current = new Chart(catCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(catCounts),
          datasets: [{
            data: Object.values(catCounts),
            backgroundColor: Object.keys(catCounts).map(k => CAT_COLORS[k] || '#888'),
            borderWidth: 2,
            borderColor: 'transparent',
          }],
        },
        options: {
          cutout: '62%',
          plugins: {
            legend: { position: 'bottom', labels: { color: text, font: { size: 11 }, padding: 12 } },
          },
        },
      });
    }

    // --- By Impact doughnut ---
    const impCounts = {};
    rows.forEach(r => { impCounts[r.impact] = (impCounts[r.impact] || 0) + 1; });
    destroyChart(impChartRef);
    if (impCanvasRef.current) {
      impChartRef.current = new Chart(impCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(impCounts),
          datasets: [{
            data: Object.values(impCounts),
            backgroundColor: Object.keys(impCounts).map(k => IMPACT_COLORS[k] || '#888'),
            borderWidth: 2,
            borderColor: 'transparent',
          }],
        },
        options: {
          cutout: '62%',
          plugins: {
            legend: { position: 'bottom', labels: { color: text, font: { size: 11 }, padding: 12 } },
          },
        },
      });
    }

    // --- Recs per Workload stacked bar ---
    const workloads = [...new Set(rows.map(r => r.workload).filter(Boolean))].sort();
    const impacts = ['High', 'Medium', 'Low'];
    const datasets = impacts.map(imp => ({
      label: imp,
      data: workloads.map(wl =>
        rows.filter(r => r.workload === wl && r.impact === imp).length
      ),
      backgroundColor: IMPACT_COLORS[imp],
    }));

    destroyChart(wlChartRef);
    if (wlCanvasRef.current) {
      wlChartRef.current = new Chart(wlCanvasRef.current, {
        type: 'bar',
        data: { labels: workloads, datasets },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              ticks: { color: text, font: { size: 11 } },
              grid: { color: grid },
            },
            y: {
              stacked: true,
              ticks: { color: text, font: { size: 11 } },
              grid: { display: false },
            },
          },
          plugins: {
            legend: { position: 'bottom', labels: { color: text, font: { size: 11 }, padding: 12 } },
          },
        },
      });
    }

    return () => {
      destroyChart(catChartRef);
      destroyChart(impChartRef);
      destroyChart(wlChartRef);
    };
  }, [rows]);

  return (
    <div className="charts-row">
      <div className="chart-card">
        <div className="chart-title">By Category</div>
        <div className="chart-canvas-wrap">
          <canvas ref={catCanvasRef} />
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-title">By Business Impact</div>
        <div className="chart-canvas-wrap">
          <canvas ref={impCanvasRef} />
        </div>
      </div>
      <div className="chart-card">
        <div className="chart-title">Recommendations per Workload</div>
        <div className="chart-canvas-wrap" style={{ height: 240 }}>
          <canvas ref={wlCanvasRef} />
        </div>
      </div>
    </div>
  );
}
