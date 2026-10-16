import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';

// Layout
import Header from './components/common/Header.tsx';
import Sidebar from './components/common/Sidebar.tsx';

// Pages
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import FarmersPage from './pages/FarmersPage.tsx';
import BuyersPage from './pages/BuyersPage.tsx';
import FieldOfficersPage from './pages/FieldOfficersPage.tsx';
import CropsPage from './pages/CropsPage.tsx';
import CultivationPage from './pages/CultivationPage.tsx';
import ContractsPage from './pages/ContractsPage.tsx';
import FieldVisitsPage from './pages/FieldVisitsPage.tsx';
import InputIssuesPage from './pages/InputIssuesPage.tsx';
import HarvestsPage from './pages/HarvestsPage.tsx';
import DeliveriesPage from './pages/DeliveriesPage.tsx';
import SettlementsPage from './pages/SettlementsPage.tsx';
import ReportsPage from './pages/ReportsPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';

const AppLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fbfbf8]">
        <div className="flex flex-col items-center gap-2 text-stone-500 text-xs">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Initializing FarmContract System...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fbfbf8] flex text-stone-800">
      {/* Persistent Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/farmers" element={<FarmersPage />} />
            <Route path="/buyers" element={<BuyersPage />} />
            <Route path="/field-officers" element={<FieldOfficersPage />} />
            <Route path="/crops" element={<CropsPage />} />
            <Route path="/cultivation" element={<CultivationPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/field-visits" element={<FieldVisitsPage />} />
            <Route path="/input-issues" element={<InputIssuesPage />} />
            <Route path="/harvests" element={<HarvestsPage />} />
            <Route path="/deliveries" element={<DeliveriesPage />} />
            <Route path="/settlements" element={<SettlementsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
