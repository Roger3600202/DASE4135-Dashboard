const MetricCard = ({ label, value, helper, accent = 'var(--accent)' }) => (
  <div className="card">
    <p className="card-label">{label}</p>
    <p className="card-value" style={{ color: accent }}>
      {value}
    </p>
    {helper ? <p className="card-helper">{helper}</p> : null}
  </div>
);

export default MetricCard;
