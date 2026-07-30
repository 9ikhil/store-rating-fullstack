import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AdminAddStore() {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // fetch store_owner users to populate the owner dropdown
    api.get('/users', { params: { role: 'store_owner' } })
      .then((res) => setOwners(res.data))
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setMessage('');
    try {
      await api.post('/stores', { ...form, ownerId: form.ownerId || null });
      setMessage('Store created successfully');
      setTimeout(() => navigate('/admin/stores'), 800);
    } catch (err) {
      if (err.response?.data?.errors) setFieldErrors(err.response.data.errors);
      setError(err.response?.data?.message || 'Failed to create store');
    }
  }

  return (
    <div className="form-container">
      <h2>Add Store</h2>
      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Store Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}

        <label>Address (max 400 characters)</label>
        <textarea name="address" value={form.address} onChange={handleChange} required />
        {fieldErrors.address && <div className="field-error">{fieldErrors.address}</div>}

        <label>Store Owner (optional - must already exist with role Store Owner)</label>
        <select name="ownerId" value={form.ownerId} onChange={handleChange}>
          <option value="">-- No owner --</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
          ))}
        </select>

        <button type="submit">Create Store</button>
      </form>
    </div>
  );
}
