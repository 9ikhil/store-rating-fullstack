import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export default function AdminUsersList() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users', { params: { ...filters, sortBy, sortOrder } });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function toggleSort(field) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }

  async function viewDetails(id) {
    setError('');
    try {
      const res = await api.get(`/users/${id}`);
      setSelectedUser(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user details');
    }
  }

  return (
    <div className="page-container">
      <h2>Users</h2>
      {error && <div className="error-box">{error}</div>}

      <div className="filters">
        <input
          placeholder="Filter by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Filter by email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          placeholder="Filter by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">Normal User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort('name')} className="sortable">Name</th>
            <th onClick={() => toggleSort('email')} className="sortable">Email</th>
            <th onClick={() => toggleSort('address')} className="sortable">Address</th>
            <th onClick={() => toggleSort('role')} className="sortable">Role</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.address}</td>
              <td>{u.role}</td>
              <td><button onClick={() => viewDetails(u.id)}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="detail-panel">
          <h3>User Details</h3>
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Address:</strong> {selectedUser.address}</p>
          <p><strong>Role:</strong> {selectedUser.role}</p>
          {selectedUser.role === 'store_owner' && selectedUser.store && (
            <p><strong>Store Rating:</strong> {selectedUser.store.averageRating ?? 'No ratings yet'}</p>
          )}
          <button onClick={() => setSelectedUser(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
