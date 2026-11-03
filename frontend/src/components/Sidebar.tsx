import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, ShieldAlert, Landmark, BarChart3,
  FileText, Settings, Shield, ShieldCheck, LogOut, ChevronDown, ChevronUp, Radio,
  BookOpen, ExternalLink
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, role, quickSwitch, logout, isLoading } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'fraud-monitoring', label: 'Fraud Monitoring', icon: ShieldAlert },
    { id: 'accounts', label: 'Accounts', icon: Landmark },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
    { id: 'case-study', label: 'Case Study', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#080D1A] border-r border-[#141C30] flex flex-col justify-between h-screen sticky top-0 shrink-0 z-40 select-none">
      {/* Top Logo & Branding */}
      <div>
        <div className="flex items-center space-x-3 px-6 py-5 border-b border-[#141C30]/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/40">
            <Shield className="w-5 h-5 text-white fill-white/20" />
          </div>
          <div>
            <div className="font-bold tracking-wider text-base text-white font-mono flex items-center gap-1.5">
              SENTINEL
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-tight">Intelligent Banking</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#152347] text-[#38BDF8] shadow-sm font-semibold border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1528]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#38BDF8]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Case Study Fast Link */}
        <div className="px-3 pt-1">
          <a
            href="https://ap.wps.com/cms/docs/d/cbCaehdc77wBATjy?platform=pc&refer=whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-mono font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 transition-all group shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Case Study Doc</span>
            </div>
            <ExternalLink className="w-3 h-3 text-amber-400/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Bottom Status Card & User Profile */}
      <div className="p-4 space-y-3 border-t border-[#141C30]/80">
        {/* Status Badge */}
        <div className="p-3 rounded-xl bg-[#0C1222] border border-[#162038] flex items-center space-x-3">
          {activeTab === 'transactions' ? (
            <>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white leading-none">Account Status</div>
                <div className="text-[10px] text-emerald-400 font-medium mt-1">Active</div>
              </div>
            </>
          ) : activeTab === 'fraud-monitoring' ? (
            <>
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white leading-none">System Status</div>
                <div className="text-[10px] text-slate-400 mt-0.5">All Systems Online</div>
              </div>
            </>
          ) : (
            <>
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white leading-none">System Online</div>
                <div className="text-[10px] text-slate-400 mt-0.5">All systems operational</div>
              </div>
            </>
          )}
        </div>

        {/* User Card with Role Switcher */}
        <div className="relative">
          <div
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="p-2.5 rounded-xl bg-[#0C1222] border border-[#162038] hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                JD
              </div>
              <div>
                <div className="text-xs font-semibold text-white leading-tight">
                  {activeTab === 'fraud-monitoring' || activeTab === 'accounts' ? 'Jane Doe' : user ? user.fullName : 'John Doe'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {activeTab === 'fraud-monitoring' ? 'Fraud Analyst' : 'Customer'}
                </div>
              </div>
            </div>
            {showRoleMenu ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </div>

          {/* Quick Role Switch Dropdown */}
          {showRoleMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-2xl space-y-1 text-xs font-mono z-50">
              <div className="text-[10px] uppercase text-slate-500 px-2 py-1">Switch Persona</div>
              <button
                disabled={isLoading}
                onClick={() => { quickSwitch('customer'); setShowRoleMenu(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                  role === 'CUSTOMER' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>John Doe</span>
                <span className="text-[10px] text-slate-400">Customer</span>
              </button>

              <button
                disabled={isLoading}
                onClick={() => { quickSwitch('analyst'); setShowRoleMenu(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                  role === 'FRAUD_ANALYST' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Fraud Analyst</span>
                <span className="text-[10px] text-slate-400">Analyst</span>
              </button>

              <button
                disabled={isLoading}
                onClick={() => { quickSwitch('admin'); setShowRoleMenu(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                  role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>CRO Admin</span>
                <span className="text-[10px] text-slate-400">Admin</span>
              </button>
            </div>
          )}
        </div>

        {/* Logout Link */}
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-200 px-2 transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
