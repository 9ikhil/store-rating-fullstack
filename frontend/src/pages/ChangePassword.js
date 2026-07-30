import React, { useState } from 'react';
import api from '../api/axios';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.put('/change-password', { oldPassword, newPassword });
      setMessage(res.data.message);
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  }

  return (
    <div className="form-container">
      <h2>Change Password</h2>
      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Old Password</label>
        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />

        <label>New Password (8-16 chars, 1 uppercase, 1 special char)</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}
