const HistoryChart = ({ history }) => {
  if (!history || history.length === 0) {
    return <div className="chart-placeholder">No history yet</div>;
  }

  const rates = history.map((d) => Number(d.defectRate || 0));
  const maxRate = Math.max(...rates, 1);
  const minRate = Math.min(...rates, 0);
  const span = Math.max(maxRate - minRate, 1);
  const points = history.map((d, idx) => {
    const x = (idx / Math.max(history.length - 1, 1)) * 100;
    const y = 100 - ((d.defectRate - minRate) / span) * 100;
    return `${x},${y}`;
  });

  const areaPoints = [`0,100`, ...points, `100,100`].join(' ');
  const linePoints = points.join(' ');

  return (
    <div className="chart">
      <div className="chart-header">
        <div>
          <p className="eyebrow">Defect rate trend</p>
          <p className="chart-title">Past {history.length} intervals</p>
        </div>
        <div className="badge subtle">{`Max ${maxRate.toFixed(2)}%`}</div>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points={areaPoints} className="chart-area" />
        <polyline points={linePoints} className="chart-line" />
      </svg>
      <div className="chart-footer">
        <p className="eyebrow">Now</p>
        <p className="eyebrow">Earlier</p>
      </div>
    </div>
  );
};

export default HistoryChart;
