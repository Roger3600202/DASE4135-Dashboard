const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const request = async (path) => {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with ${res.status}`);
  }
  return res.json();
};

export const fetchLatestMetrics = () => request('/api/metrics');
export const fetchHistory = (limit = 48) => request(`/api/metrics/history?limit=${limit}`);
