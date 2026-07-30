import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    try {
      const res = await api.post('/register', form);
      login(res.data.user, res.data.token);
      navigate('/stores');
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="form-container">
      <h2>Register</h2>
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

        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
