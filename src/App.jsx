import MetricCard from './components/MetricCard.jsx';
import HistoryChart from './components/HistoryChart.jsx';
import { useMetrics } from './hooks/useMetrics.js';

const formatNumber = (value) => (value || value === 0 ? value.toLocaleString('en-US') : '—');
const formatPercent = (value) => (value || value === 0 ? `${value.toFixed(2)}%` : '—');

function App() {
  const { metrics, history, source, loading, error, reload } = useMetrics(4000);

  return (
    <div className="page">
      <div className="bg-gradient" />
      <div className="shell">
        <header className="header">
          <div>
            <p className="eyebrow">Quality Ops · Live feed</p>
            <h1>Brick Quality Dashboard</h1>
            <p className="lede">
              Tracks total throughput, defects, and quality pulse. Connect your Supabase link to
              stream real production data.
            </p>
            <div className="badges">
              <span className="badge">{`Source: ${source || 'n/a'}`}</span>
              <span className="badge live">
                <span className="dot" />
                Live
              </span>
            </div>
          </div>
          <button className="ghost-button" onClick={reload}>
            Refresh now
          </button>
        </header>

        {error ? <div className="error">{error}</div> : null}

        <section className="grid cards">
          <MetricCard
            label="Total bricks"
            value={loading ? 'Loading…' : formatNumber(metrics?.totalBricks)}
            helper="Processed in latest interval"
          />
          <MetricCard
            label="Defects"
            value={loading ? 'Loading…' : formatNumber(metrics?.defectCount)}
            helper="Flagged by vision"
            accent="var(--warn)"
          />
          <MetricCard
            label="Good bricks"
            value={loading ? 'Loading…' : formatNumber(metrics?.goodCount)}
            helper="Passing QA"
            accent="var(--success)"
          />
          <MetricCard
            label="Defect rate"
            value={loading ? 'Loading…' : formatPercent(metrics?.defectRate)}
            helper={loading ? '' : `Updated ${new Date(metrics?.capturedAt || Date.now()).toLocaleString()}`}
            accent="var(--accent)"
          />
        </section>

        <section className="grid two">
          <div className="panel">
            <HistoryChart history={history} />
          </div>
          <div className="panel">
            <div className="chart-header">
              <div>
                <p className="eyebrow">Quality pulse</p>
                <p className="chart-title">Recent events</p>
              </div>
              <div className="badge subtle">{loading ? 'Loading…' : `${history.length} samples`}</div>
            </div>
            <div className="timeline">
              {history
                .slice(-5)
                .reverse()
                .map((item, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="dot" />
                    <div>
                      <p className="timeline-title">{formatPercent(item.defectRate)}</p>
                      <p className="timeline-meta">
                        {formatNumber(item.defectCount)} defects · {formatNumber(item.totalBricks)} total
                      </p>
                    </div>
                    <p className="timeline-time">{new Date(item.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
