import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import StoresPage from './pages/StoresPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersList from './pages/AdminUsersList';
import AdminAddUser from './pages/AdminAddUser';
import AdminStoresList from './pages/AdminStoresList';
import AdminAddStore from './pages/AdminAddStore';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/change-password" element={
            <PrivateRoute><ChangePassword /></PrivateRoute>
          } />

          {/* Normal user */}
          <Route path="/stores" element={
            <PrivateRoute allowedRoles={['user']}><StoresPage /></PrivateRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute allowedRoles={['admin']}><AdminUsersList /></PrivateRoute>
          } />
          <Route path="/admin/users/new" element={
            <PrivateRoute allowedRoles={['admin']}><AdminAddUser /></PrivateRoute>
          } />
          <Route path="/admin/stores" element={
            <PrivateRoute allowedRoles={['admin']}><AdminStoresList /></PrivateRoute>
          } />
          <Route path="/admin/stores/new" element={
            <PrivateRoute allowedRoles={['admin']}><AdminAddStore /></PrivateRoute>
          } />

          {/* Store owner */}
          <Route path="/owner" element={
            <PrivateRoute allowedRoles={['store_owner']}><StoreOwnerDashboard /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
