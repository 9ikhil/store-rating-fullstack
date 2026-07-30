import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/admin')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  return (
    <div className="page-container">
      <h2>Admin Dashboard</h2>
      {error && <div className="error-box">{error}</div>}

      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalStores}</div>
            <div className="stat-label">Total Stores</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalRatings}</div>
            <div className="stat-label">Total Ratings</div>
          </div>
        </div>
      )}

      <div className="admin-links">
        <Link to="/admin/users" className="button-link">View Users</Link>
        <Link to="/admin/users/new" className="button-link">Add User</Link>
        <Link to="/admin/stores" className="button-link">View Stores</Link>
        <Link to="/admin/stores/new" className="button-link">Add Store</Link>
      </div>
    </div>
  );
}
