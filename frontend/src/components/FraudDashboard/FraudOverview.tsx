import React from 'react';
import { DashboardOverview, FraudAlert } from '../../types';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, Ban, TrendingUp, DollarSign,
  Activity, Users, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface FraudOverviewProps {
  overview: DashboardOverview | null;
  onOpenAlert: (alert: FraudAlert) => void;
  onViewLiveStream: () => void;
}

const RISK_COLORS = ['#10B981', '#38BDF8', '#F59E0B', '#EF4444'];

export const FraudOverview: React.FC<FraudOverviewProps> = ({
  overview,
  onOpenAlert,
  onViewLiveStream,
}) => {
  if (!overview) {
    return (
      <div className="py-20 text-center font-mono text-sm text-slate-500 animate-pulse">
        Connecting to SENTINEL Distributed Analytics Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 8 Primary FinTech KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Total Volume */}
        <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono uppercase">Gross Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            ${Number(overview.totalTransactionVolume || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Fully Balanced in Ledger
          </div>
        </div>

        {/* KPI 2: Total Transactions */}
        <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono uppercase">Total Processed</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            {overview.totalTransactions.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            {overview.successfulTransactions} Approved &amp; Settled
          </div>
        </div>

        {/* KPI 3: Fraud Detection Rate */}
        <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono uppercase">Fraud Interception</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-rose-400">
            {overview.fraudDetectionRate}%
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            {overview.flaggedTransactions + overview.blockedTransactions} Intercepted Breaches
          </div>
        </div>

        {/* KPI 4: High-Risk Accounts */}
        <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono uppercase">High-Risk Entities</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
            {overview.highRiskAccounts}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Accounts with active alerts
          </div>
        </div>
      </div>

      {/* Secondary KPI Bar: Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
          <span className="text-emerald-400">Approved:</span>
          <span className="font-bold text-emerald-300">{overview.successfulTransactions}</span>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
          <span className="text-amber-400">Held for Review:</span>
          <span className="font-bold text-amber-300">{overview.flaggedTransactions}</span>
        </div>
        <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
          <span className="text-rose-400">Blocked by Rules:</span>
          <span className="font-bold text-rose-300">{overview.blockedTransactions}</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
          <span className="text-slate-400">Failed (Funds):</span>
          <span className="font-bold text-slate-300">{overview.failedTransactions}</span>
        </div>
      </div>

      {/* Charts Row 1: Transactions Over Time & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions Velocity Timeline */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white font-mono">TRANSACTION STREAM DYNAMICS (24H)</h3>
              <p className="text-xs text-slate-400">Normal vs Flagged vs Blocked transaction rate</p>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Normal
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Flagged
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Blocked
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.transactionsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="normal" stroke="#0EA5E9" fillOpacity={1} fill="url(#colorNormal)" />
                <Area type="monotone" dataKey="flagged" stroke="#F59E0B" fillOpacity={1} fill="url(#colorFlagged)" />
                <Area type="monotone" dataKey="blocked" stroke="#EF4444" fillOpacity={1} fill="url(#colorBlocked)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white font-mono mb-1">RISK TIER BREAKDOWN</h3>
            <p className="text-xs text-slate-400 mb-4">Calculated risk score percentiles</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.riskDistribution}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {overview.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs font-mono">
            {overview.riskDistribution.map((r, i) => (
              <div key={r.level} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RISK_COLORS[i % RISK_COLORS.length] }} />
                  {r.level}
                </span>
                <span className="text-slate-400 font-bold">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Volume by Category & Alerts by Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl">
          <h3 className="text-sm font-semibold text-white font-mono mb-1">SETTLED VOLUME BY CATEGORY</h3>
          <p className="text-xs text-slate-400 mb-4">Monetary distribution across transaction streams</p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.volumeByCategory} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748B" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <YAxis type="category" dataKey="category" stroke="#64748B" fontSize={11} width={110} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Triage Ticker */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white font-mono">ACTIVE FRAUD ALERTS TRIAGE</h3>
              <button
                onClick={onViewLiveStream}
                className="text-xs text-sky-400 hover:text-sky-300 font-mono"
              >
                View Full Triage Queue &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {overview.recentAlerts.slice(0, 4).map(alert => (
                <div
                  key={alert.id}
                  onClick={() => onOpenAlert(alert)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-200 font-semibold">{alert.category}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[280px]">
                      {alert.reason}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-rose-400">Score: {alert.riskScore}</div>
                    <span className="text-[10px] text-slate-500">{alert.status}</span>
                  </div>
                </div>
              ))}

              {overview.recentAlerts.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No active fraud alerts. System perimeter is secure.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
