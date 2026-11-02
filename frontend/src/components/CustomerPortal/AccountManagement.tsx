import React from 'react';
import { Account } from '../../types';
import { ShieldCheck, Smartphone, Globe, Lock, Key, CreditCard, AlertCircle } from 'lucide-react';

interface AccountManagementProps {
  accounts: Account[];
}

export const AccountManagement: React.FC<AccountManagementProps> = ({ accounts }) => {
  return (
    <div className="space-y-6">
      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map(acc => {
          const usedDaily = 1200; // simulated spent today
          const dailyLimit = Number(acc.dailyLimit || 25000);
          const percentUsed = Math.min(100, Math.round((usedDaily / dailyLimit) * 100));

          return (
            <div key={acc.id} className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-sky-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    {acc.accountType} ACCOUNT
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {acc.status}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-mono">Full Account Number</div>
                <div className="text-sm font-mono font-bold text-white tracking-wider mt-0.5">{acc.accountNumber}</div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Available Liquid Funds</div>
                <div className="text-2xl font-mono font-bold text-slate-100 mt-1">
                  ${Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} {acc.currency}
                </div>
              </div>

              {/* Daily Limit Meter */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Daily Transfer Limit Usage</span>
                  <span className="text-slate-300">${usedDaily.toLocaleString()} / ${dailyLimit.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 text-right">
                  {100 - percentUsed}% limit remaining today
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Telemetry & Active Device Sessions */}
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white font-mono">SECURITY TELEMETRY & AUTHORIZED SESSIONS</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">ENCRYPTION: AES-256-GCM / SHA-256</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Current Session Client</span>
            </div>
            <div className="text-slate-200 font-semibold truncate">Vite Web / Chrome 124</div>
            <div className="text-[10px] text-slate-500">Fingerprint: fp-customer-verified</div>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Primary Gateway Location</span>
            </div>
            <div className="text-slate-200 font-semibold">New York, USA</div>
            <div className="text-[10px] text-slate-500">Lat: 40.7128 &bull; Lon: -74.0060</div>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Authentication Protocol</span>
            </div>
            <div className="text-slate-200 font-semibold">HMAC-SHA256 JWT</div>
            <div className="text-[10px] text-slate-500">Token validity: 24h</div>
          </div>
        </div>
      </div>
    </div>
  );
};
