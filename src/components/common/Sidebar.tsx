import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Wheat,
  Activity,
  FileSignature,
  CalendarCheck,
  AlertTriangle,
  PackageCheck,
  Truck,
  ReceiptText,
  BarChart3,
  Bell,
  Sprout,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    roles: string[];
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'buyer', 'officer'],
    },
    {
      label: 'Contracts',
      path: '/contracts',
      icon: <FileSignature className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'buyer', 'officer'],
    },
    {
      label: 'Farmers',
      path: '/farmers',
      icon: <Users className="w-4 h-4" />,
      roles: ['admin', 'officer', 'farmer'],
    },
    {
      label: 'Buyers & Companies',
      path: '/buyers',
      icon: <Building2 className="w-4 h-4" />,
      roles: ['admin', 'buyer'],
    },
    {
      label: 'Field Officers',
      path: '/field-officers',
      icon: <UserCheck className="w-4 h-4" />,
      roles: ['admin', 'officer'],
    },
    {
      label: 'Crop Catalog',
      path: '/crops',
      icon: <Wheat className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'buyer', 'officer'],
    },
    {
      label: 'Cultivation Tracking',
      path: '/cultivation',
      icon: <Activity className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'officer'],
    },
    {
      label: 'Field Visits',
      path: '/field-visits',
      icon: <CalendarCheck className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'officer'],
    },
    {
      label: 'Input Issues',
      path: '/input-issues',
      icon: <AlertTriangle className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'officer'],
    },
    {
      label: 'Harvest Entries',
      path: '/harvests',
      icon: <PackageCheck className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'buyer', 'officer'],
    },
    {
      label: 'Deliveries',
      path: '/deliveries',
      icon: <Truck className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'buyer', 'officer'],
    },
    {
      label: 'Settlements & Payouts',
      path: '/settlements',
      icon: <ReceiptText className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'buyer'],
    },
    {
      label: 'Reports & Export',
      path: '/reports',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'buyer', 'officer'],
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: <Bell className="w-4 h-4" />,
      roles: ['admin', 'farmer', 'buyer', 'officer'],
    },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#143224] text-stone-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight leading-tight">
                FarmContract
              </div>
              <div className="text-[10px] text-emerald-300 font-medium tracking-wide">
                MERN Agri-Enterprise
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-md md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-600/30 text-emerald-200 font-semibold border border-emerald-500/30 shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-white/10 text-[11px] text-stone-400 bg-black/15">
          <div className="font-semibold text-emerald-300 truncate">{user?.name}</div>
          <div className="text-stone-400 text-[10px] truncate capitalize">
            Role: {role}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
