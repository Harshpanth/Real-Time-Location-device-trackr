import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/auth.store.js';
import Sidebar from "./components/Sidebar/Layout.jsx";
import Dashboard from './pages/Dashboard.jsx';
import Tracking from './pages/TrackingPage.jsx';
import History from './pages/HistoryPage.jsx';
import Geofences from './pages/GeofencePage.jsx';
import Alerts from './pages/Alerts.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import DriverApp from './pages/DriverApp.jsx';

function AppLayout() {
  return <Sidebar />;
}

function PrivateRoute() {
  const { token } = useAuthStore();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { token } = useAuthStore();
  return token ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  const { token } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/driver" element={<DriverApp />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/history" element={<History />} />
            <Route path="/geofences" element={<Geofences />} />
            <Route path="/alerts" element={<Alerts />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
