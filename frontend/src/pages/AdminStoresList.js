import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export default function AdminStoresList() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState('');

  const fetchStores = useCallback(async () => {
    try {
      const res = await api.get('/stores', { params: { ...filters, sortBy, sortOrder } });
      setStores(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores');
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  function toggleSort(field) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }

  return (
    <div className="page-container">
      <h2>Stores</h2>
      {error && <div className="error-box">{error}</div>}

      <div className="filters">
        <input
          placeholder="Filter by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Filter by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort('name')} className="sortable">Name</th>
            <th>Email</th>
            <th onClick={() => toggleSort('address')} className="sortable">Address</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.address}</td>
              <td>{s.averageRating ?? 'No ratings yet'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
