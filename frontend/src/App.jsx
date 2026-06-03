/**
 * @file App.jsx
 * Route definitions. Public auth routes plus the protected application shell
 * containing every feature page. Role-restricted routes are wrapped with a
 * ProtectedRoute that enforces RBAC.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import FirstLogin from './pages/FirstLogin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Extinguishers from './pages/Extinguishers.jsx';
import ExtinguisherDetails from './pages/ExtinguisherDetails.jsx';
import ExtinguisherForm from './pages/ExtinguisherForm.jsx';
import Inspections from './pages/Inspections.jsx';
import Maintenance from './pages/Maintenance.jsx';
import Reports from './pages/Reports.jsx';
import Users from './pages/Users.jsx';
import Profile from './pages/Profile.jsx';
import Notifications from './pages/Notifications.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/first-login" element={<ProtectedRoute><FirstLogin /></ProtectedRoute>} />

      {/* Protected shell */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/extinguishers" element={<Extinguishers />} />
        <Route path="/extinguishers/new" element={<ExtinguisherForm />} />
        <Route path="/extinguishers/:id" element={<ExtinguisherDetails />} />
        <Route path="/extinguishers/:id/edit" element={<ExtinguisherForm />} />
        <Route path="/inspections" element={<Inspections />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/users"
          element={<ProtectedRoute roles={['ADMIN']}><Users /></ProtectedRoute>}
        />
        <Route
          path="/audit-logs"
          element={<ProtectedRoute roles={['ADMIN']}><AuditLogs /></ProtectedRoute>}
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
