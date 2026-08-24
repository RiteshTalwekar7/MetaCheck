import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  ShieldAlert,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Package,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  UserCheck,
  Scale
} from 'lucide-react';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inspections/new', label: 'New Inspection', icon: PlusCircle },
    { to: '/inspections', label: 'Inspections History', icon: ClipboardList },
    { to: '/products', label: 'Products Catalog', icon: Package },
    { to: '/rules', label: 'Legal Rules Registry', icon: BookOpen },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-900/50">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-slate-100 flex items-center gap-1.5">
                MetaCheck <span className="text-[10px] bg-brand-500/20 text-brand-400 border border-brand-500/30 px-1 rounded font-mono">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Legal Metrology Inspector</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Active Rule Set */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="mb-3 px-2 py-1.5 bg-slate-950/80 rounded border border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Rule-Set:</span>
            <span className="text-brand-400 font-bold">PCR-2026-v1</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 text-brand-400" />
              </div>
              <div className="overflow-hidden text-left">
                <div className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Officer'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.role || 'OFFICER'}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Enforcement System Operational
            </span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-slate-400 font-medium">Department of Consumer Affairs • Legal Metrology Division</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span>Badge: <b className="text-slate-200 font-mono">{user?.badgeNumber || 'LM-HQ-8942'}</b></span>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

