import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/owner')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) return <div className="page-container"><div className="error-box">{error}</div></div>;
  if (!data) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <h2>{data.store.name} - Owner Dashboard</h2>
      <p><strong>Address:</strong> {data.store.address}</p>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{data.averageRating ?? 'N/A'}</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.totalRatings}</div>
          <div className="stat-label">Total Ratings</div>
        </div>
      </div>

      <h3>Users Who Rated Your Store</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {data.raters.map((r) => (
            <tr key={r.userId}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
