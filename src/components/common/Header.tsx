import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import NotificationBell from './NotificationBell.tsx';
import { Sprout, LogOut, ShieldCheck, ChevronDown, RefreshCw } from 'lucide-react';
import { api } from '../../services/api.ts';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, quickSwitchRole } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const getAvatar = () => {
    switch (user?.role) {
      case 'farmer':
        return '/src/assets/images/avatar_farmer_1791919036424.jpg';
      case 'buyer':
        return '/src/assets/images/avatar_buyer_1791919036404.jpg';
      case 'officer':
        return '/src/assets/images/avatar_officer_1791919035890.jpg';
      default:
        return null;
    }
  };

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    admin: { label: 'Administrator', badge: 'bg-emerald-900 text-white' },
    farmer: { label: 'Farmer', badge: 'bg-amber-800 text-amber-50' },
    buyer: { label: 'Corporate Buyer', badge: 'bg-teal-900 text-teal-50' },
    officer: { label: 'Field Officer', badge: 'bg-emerald-800 text-emerald-50' },
  };

  const handleResetData = async () => {
    if (confirm('Reset all demo data back to clean initial state for contract testing?')) {
      setResetting(true);
      try {
        await api.admin.resetData();
        window.location.reload();
      } catch (err) {
        alert('Failed to reset demo data.');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-stone-200">
      {/* Left: Mobile Toggle & Breadcrumb / App identity on mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="p-2 -ml-2 text-stone-600 rounded-md md:hidden hover:bg-stone-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1b4332] flex items-center justify-center text-emerald-300 md:hidden">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1b4332] tracking-tight leading-tight md:hidden">
              FarmContract
            </h1>
            <p className="text-xs text-stone-500 hidden md:block">
              Contract Farming Management System &middot; <span className="text-emerald-700 font-medium">Kharif &amp; Rabi 2026</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Action Zone: Quick Switcher, Reset Seed, Notifications, Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Quick Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md border border-stone-200 transition-colors whitespace-nowrap"
            title="Switch demo role to test permissions"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold text-stone-900 capitalize">{user?.role || 'admin'}</span>
            <ChevronDown className="w-3 h-3 text-stone-500" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-stone-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                Switch Active Demo Persona
              </div>
              {(['admin', 'farmer', 'buyer', 'officer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    quickSwitchRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-stone-50 transition-colors ${
                    user?.role === r ? 'font-bold text-emerald-800 bg-emerald-50/60' : 'text-stone-700'
                  }`}
                >
                  <span className="capitalize">{r === 'officer' ? 'Field Officer (Dr. Priya)' : r === 'farmer' ? 'Farmer (Ramesh Patel)' : r === 'buyer' ? 'Buyer (AgroCorp)' : 'Admin (Director)'}</span>
                  {user?.role === r && <span className="text-emerald-600 font-bold">&#10003;</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Test Data Button */}
        {user?.role === 'admin' && (
          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Reset database to initial test state"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 rounded-md border border-stone-200 transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-emerald-700' : 'text-stone-400'}`} />
            <span>Reset Demo Data</span>
          </button>
        )}

        {/* Notifications */}
        <NotificationBell />

        {/* Profile Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
          {getAvatar() ? (
            <img
              src={getAvatar()!}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-emerald-300"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.name?.slice(0, 2) || 'AD'}
            </div>
          )}

          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-stone-900 truncate max-w-[130px] leading-tight">
              {user?.name || 'Demo User'}
            </div>
            <div className="text-[11px] text-stone-500 capitalize leading-tight">
              {roleLabels[user?.role || 'admin']?.label}
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
