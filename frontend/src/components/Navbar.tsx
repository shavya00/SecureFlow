import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Landmark, UserCheck, Shield, RefreshCw, LogOut, Radio, FileText, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, activePortal, setActivePortal, quickSwitch, logout, isLoading } = useAuth();
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <ShieldAlert className="w-5 h-5 text-sky-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold tracking-wider text-lg text-white">SENTINEL</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> ENGINE ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Distributed Banking Transaction & Fraud Detection Engine</p>
            </div>
          </div>

          {/* Portal Switcher Navigation */}
          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActivePortal('customer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activePortal === 'customer'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Customer Banking</span>
            </button>

            <button
              onClick={() => setActivePortal('fraud')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activePortal === 'fraud'
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-sm shadow-red-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Fraud Intelligence</span>
            </button>

            <a
              href="https://ap.wps.com/cms/docs/d/cbCaehdc77wBATjy?platform=pc&refer=whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-all border border-amber-500/20"
              title="Open Huffman Coding Case Study in WPS Docs"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Case Study</span>
              <ExternalLink className="w-3 h-3 text-amber-400/80" />
            </a>
          </div>

          {/* Demo Persona Switcher & Telemetry */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[11px] font-mono text-slate-400">{utcTime}</span>
              <span className="text-[10px] font-mono text-sky-400">DOUBLE-ENTRY LEDGER: SYNCED</span>
            </div>

            {/* Quick Persona Switcher */}
            <div className="flex items-center space-x-1 text-xs bg-slate-900 border border-slate-800 rounded-lg p-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 px-1 hidden md:inline">Role:</span>
              <button
                disabled={isLoading}
                onClick={() => quickSwitch('customer')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  role === 'CUSTOMER' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Log in as Alexander Vance (Customer)"
              >
                Customer
              </button>
              <button
                disabled={isLoading}
                onClick={() => quickSwitch('analyst')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  role === 'FRAUD_ANALYST' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Log in as Fraud Analyst"
              >
                Analyst
              </button>
              <button
                disabled={isLoading}
                onClick={() => quickSwitch('admin')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Log in as Chief Risk Officer (Admin)"
              >
                Admin
              </button>
            </div>

            {/* User Pill */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800 text-xs">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                  {user.fullName ? user.fullName[0] : 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-200 leading-tight">{user.fullName}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{user.role}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
