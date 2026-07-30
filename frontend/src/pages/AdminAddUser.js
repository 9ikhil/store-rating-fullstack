import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AdminAddUser() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setMessage('');
    try {
      await api.post('/users', form);
      setMessage('User created successfully');
      setTimeout(() => navigate('/admin/users'), 800);
    } catch (err) {
      if (err.response?.data?.errors) setFieldErrors(err.response.data.errors);
      setError(err.response?.data?.message || 'Failed to create user');
    }
  }

  return (
    <div className="form-container">
      <h2>Add User (Admin / Normal User / Store Owner)</h2>
      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Name (20-60 characters)</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}

        <label>Address (max 400 characters)</label>
        <textarea name="address" value={form.address} onChange={handleChange} required />
        {fieldErrors.address && <div className="field-error">{fieldErrors.address}</div>}

        <label>Password (8-16 chars, 1 uppercase, 1 special char)</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />
        {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}

        <label>Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">Normal User</option>
          <option value="admin">Admin</option>
          <option value="store_owner">Store Owner</option>
        </select>

        <button type="submit">Create User</button>
      </form>
    </div>
  );
}
