import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Store Rating App</div>
      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user && user.role === 'admin' && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/change-password">Change Password</Link>
          </>
        )}

        {user && user.role === 'user' && (
          <>
            <Link to="/stores">Stores</Link>
            <Link to="/change-password">Change Password</Link>
          </>
        )}

        {user && user.role === 'store_owner' && (
          <>
            <Link to="/owner">Dashboard</Link>
            <Link to="/change-password">Change Password</Link>
          </>
        )}

        {user && (
          <span className="navbar-user">
            {user.name} ({user.role})
            <button onClick={handleLogout} className="link-button">Logout</button>
          </span>
        )}
      </div>
    </nav>
  );
}
