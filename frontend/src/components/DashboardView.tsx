import React, { useState, useMemo } from 'react';
import { Sparkline } from './Sparkline';
import { GaugeChart } from './GaugeChart';
import {
  Wallet, ArrowLeftRight, AlertTriangle, ShieldCheck, Shield, BarChart2,
  ChevronDown, CheckCircle2, ShoppingCart, Film, DollarSign, Filter, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { Account, Transaction, FraudAlert, DashboardOverview } from '../types';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenTransfer: () => void;
  overview?: DashboardOverview | null;
  accounts?: Account[];
  transactions?: Transaction[];
  alerts?: FraudAlert[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenTransfer,
  overview,
  accounts = [],
  transactions = [],
  alerts = [],
  isLoading = false,
  onRefresh,
}) => {
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'FLAGGED' | 'BLOCKED'>('ALL');
  const [amountFilter, setAmountFilter] = useState<'ALL' | 'UNDER_1K' | 'OVER_1K'>('ALL');

  // Calculate live total balance across all active accounts
  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);
  }, [accounts]);

  // Dynamic Donut chart data based on real user accounts
  const donutColors = ['#38BDF8', '#10B981', '#A855F7', '#F59E0B', '#EC4899'];
  const donutData = useMemo(() => {
    if (!accounts || accounts.length === 0) {
      return [
        { name: 'Checking', value: 48250.75, color: '#38BDF8', percent: '28%' },
        { name: 'Savings', value: 125000.00, color: '#10B981', percent: '72%' }
      ];
    }
    return accounts.map((acc, index) => {
      const val = Number(acc.balance || 0);
      const percent = totalBalance > 0 ? `${Math.round((val / totalBalance) * 100)}%` : '0%';
      const label = `${acc.accountType} (${acc.maskedAccountNumber || acc.accountNumber?.slice(-4) || '****'})`;
      return {
        name: label,
        value: val,
        color: donutColors[index % donutColors.length],
        percent
      };
    });
  }, [accounts, totalBalance]);

  // Dynamic chart data from backend overview or transactions
  const chartData = useMemo(() => {
    if (overview?.transactionsOverTime && overview.transactionsOverTime.length > 0) {
      return overview.transactionsOverTime.map(item => ({
        date: item.time,
        income: Number(item.normal || 0) * 1200 + 4000,
        expenses: (Number(item.flagged || 0) + Number(item.blocked || 0)) * 900 + 2500
      }));
    }
    return [
      { date: '12AM', income: 7200, expenses: 3800 },
      { date: '4AM', income: 9800, expenses: 4800 },
      { date: '8AM', income: 8500, expenses: 4200 },
      { date: '12PM', income: 11200, expenses: 6200 },
      { date: '4PM', income: 9400, expenses: 5400 },
      { date: '8PM', income: 13500, expenses: 7800 },
    ];
  }, [overview]);

  // Filtered recent transactions list
  const filteredRecentTransactions = useMemo(() => {
    let list = transactions.length > 0 ? transactions : (overview?.recentTransactions || []);

    if (statusFilter !== 'ALL') {
      list = list.filter(t => t.status === statusFilter);
    }

    if (amountFilter === 'UNDER_1K') {
      list = list.filter(t => Number(t.amount) < 1000);
    } else if (amountFilter === 'OVER_1K') {
      list = list.filter(t => Number(t.amount) >= 1000);
    }

    return list.slice(0, 5);
  }, [transactions, overview, statusFilter, amountFilter]);

  // Display alerts
  const displayAlerts = useMemo(() => {
    return alerts.length > 0 ? alerts.slice(0, 5) : (overview?.recentAlerts || []).slice(0, 5);
  }, [alerts, overview]);

  // Metrics
  const totalTxnCount = overview ? overview.totalTransactions : transactions.length;
  const alertCount = overview ? (overview.flaggedTransactions + overview.blockedTransactions) : alerts.length;
  const fraudRate = overview ? `${overview.fraudDetectionRate.toFixed(1)}%` : '0.0%';

  // Average risk score for Gauge
  const avgRiskScore = useMemo(() => {
    if (transactions.length === 0) return 12;
    const sum = transactions.reduce((s, t) => s + (t.riskScore ? Number(t.riskScore) : 0), 0);
    return Math.round(sum / transactions.length);
  }, [transactions]);

  // Sparklines
  const balanceSparkline = [20, 22, 21, 24, 23, 27, 26, 30, 28, 33, 31, 35];
  const txnsSparkline = [15, 18, 17, 22, 20, 24, 23, 28, 27, 32, 30, 36];
  const alertsSparkline = [10, 14, 12, 19, 15, 23, 18, 25, 20, 27, 24, 29];
  const rateSparkline = [30, 32, 31, 33, 32, 35, 34, 36, 35, 38, 37, 39];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 1. Welcome Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
            <Shield className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Executive Banking Overview</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Real-time multi-account ledger and continuous fraud telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh live data"
              className="p-2.5 rounded-xl bg-[#0C1222] hover:bg-[#162038] border border-[#162038] text-slate-300 hover:text-white transition-all text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          )}

          <button
            onClick={onOpenTransfer}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Send Money</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards with Neon Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Balance */}
        <div className="rounded-2xl bg-[#0C1222] border border-[#162038] p-4 shadow-lg flex flex-col justify-between hover:border-slate-700/60 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
              <Wallet className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Total Balance</span>
          </div>

          <div className="text-2xl font-bold text-white tracking-tight my-1 font-mono">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              ↑ Verified Ledger
            </span>
            <Sparkline color="#10B981" glowClass="glow-green" data={balanceSparkline} width={110} height={32} />
          </div>
        </div>

        {/* Card 2: Total Transactions */}
        <div className="rounded-2xl bg-[#0C1222] border border-[#162038] p-4 shadow-lg flex flex-col justify-between hover:border-slate-700/60 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
              <ArrowLeftRight className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Total Transactions</span>
          </div>

          <div className="text-2xl font-bold text-white tracking-tight my-1 font-mono">
            {totalTxnCount}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-sky-400 flex items-center gap-0.5">
              • Settled Stream
            </span>
            <Sparkline color="#38BDF8" glowClass="glow-blue" data={txnsSparkline} width={110} height={32} />
          </div>
        </div>

        {/* Card 3: Fraud Alerts */}
        <div className="rounded-2xl bg-[#0C1222] border border-[#162038] p-4 shadow-lg flex flex-col justify-between hover:border-slate-700/60 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Fraud Alerts</span>
          </div>

          <div className="text-2xl font-bold text-white tracking-tight my-1 font-mono">
            {alertCount}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-0.5">
              {alertCount > 0 ? 'Active Triage' : 'Zero Breaches'}
            </span>
            <Sparkline color="#F43F5E" glowClass="glow-red" data={alertsSparkline} width={110} height={32} />
          </div>
        </div>

        {/* Card 4: Fraud Detection Rate */}
        <div className="rounded-2xl bg-[#0C1222] border border-[#162038] p-4 shadow-lg flex flex-col justify-between hover:border-slate-700/60 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Fraud Detection Rate</span>
          </div>

          <div className="text-2xl font-bold text-white tracking-tight my-1 font-mono">
            {fraudRate}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-purple-400 flex items-center gap-0.5">
              • 7 Heuristics Active
            </span>
            <Sparkline color="#A855F7" glowClass="glow-purple" data={rateSparkline} width={110} height={32} />
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Account Overview & Fraud Risk Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Account Overview (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0C1222] border border-[#162038] p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-white">Liquid Balance &amp; Flow Dynamics</h2>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#141C30] border border-slate-700/50 text-xs text-slate-300">
              <span>{timeframe}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Donut Chart with Center Text (5 cols) */}
            <div className="md:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={64}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Donut Center Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <div className="text-xs font-bold text-white font-mono">
                    ${totalBalance > 1000 ? `${(totalBalance / 1000).toFixed(1)}k` : totalBalance.toFixed(0)}
                  </div>
                  <div className="text-[9px] text-slate-400 leading-none">Net Liquid</div>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="space-y-2 text-xs">
                {donutData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="leading-tight">
                      <div className="text-slate-200 font-medium text-[11px] truncate max-w-[120px]">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">${item.value.toLocaleString()} ({item.percent})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Income vs Expenses Glowing Line Chart (7 cols) */}
            <div className="md:col-span-7">
              <div className="flex items-center justify-end space-x-4 mb-2 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Settled Inflows
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> Transfer Outflows
                </span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#070A13', borderColor: '#162038', borderRadius: '8px', fontSize: '11px' }} />
                    <Line
                      type="natural"
                      dataKey="income"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#10B981', stroke: '#070A13', strokeWidth: 1.5 }}
                      activeDot={{ r: 5 }}
                      className="glow-green"
                    />
                    <Line
                      type="natural"
                      dataKey="expenses"
                      stroke="#38BDF8"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#38BDF8', stroke: '#070A13', strokeWidth: 1.5 }}
                      activeDot={{ r: 5 }}
                      className="glow-blue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Fraud Risk Status (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0C1222] border border-[#162038] p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Fraud Risk Status</h2>
          </div>

          <GaugeChart
            score={avgRiskScore}
            level={avgRiskScore >= 80 ? 'Critical Risk' : avgRiskScore >= 60 ? 'High Risk' : avgRiskScore >= 30 ? 'Medium Risk' : 'Low Risk'}
            trend="Active Scoring"
            subtitle="Scored in real time by rule engine."
          />
        </div>
      </div>

      {/* 4. Filter Toolbar for Recent Activity */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0C1222] border border-[#162038] text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-3.5 h-3.5 text-sky-400" />
          <span>Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#141C30] rounded-lg p-0.5 border border-slate-800">
            {(['ALL', 'COMPLETED', 'FLAGGED', 'BLOCKED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  statusFilter === st ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Amount Filter */}
          <div className="flex items-center gap-1 bg-[#141C30] rounded-lg p-0.5 border border-slate-800">
            {(['ALL', 'UNDER_1K', 'OVER_1K'] as const).map((amt) => (
              <button
                key={amt}
                onClick={() => setAmountFilter(amt)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  amountFilter === amt ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {amt === 'ALL' ? 'Any $' : amt === 'UNDER_1K' ? '< $1k' : '≥ $1k'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Recent Transactions & Fraud Alerts Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Table: Recent Transactions (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0C1222] border border-[#162038] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ArrowLeftRight className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
              </div>
              <button
                onClick={() => onNavigateTab('transactions')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
              >
                View All &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-slate-400 border-b border-[#162038] pb-2">
                  <tr>
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Beneficiary / Memo</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162038]/60">
                  {filteredRecentTransactions.map((tx) => {
                    const isIncome = tx.description?.toLowerCase().includes('deposit') ||
                            tx.description?.toLowerCase().includes('salary');
                    return (
                      <tr key={tx.id || tx.referenceId} className="hover:bg-[#12192C]/50 transition-colors">
                        <td className="py-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </td>
                        <td className="py-3 font-medium text-slate-200 truncate max-w-[180px]">
                          {tx.destinationOwnerName || tx.description || 'Account Transfer'}
                        </td>
                        <td className={`py-3 text-right font-semibold whitespace-nowrap font-mono ${
                          isIncome ? 'text-emerald-400' : 'text-slate-100'
                        }`}>
                          {isIncome ? '+' : '-'}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            tx.status === 'FLAGGED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            tx.status === 'BLOCKED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRecentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                        No transactions matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Table: Fraud Alerts (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0C1222] border border-[#162038] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">Active Fraud Alerts</h3>
              </div>
              <button
                onClick={() => onNavigateTab('fraud-monitoring')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
              >
                View All &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[11px] text-slate-400 border-b border-[#162038] pb-2 font-sans">
                  <tr>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium text-center">Risk Score</th>
                    <th className="pb-3 font-medium text-right font-sans">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162038]/60">
                  {displayAlerts.map((fa) => (
                    <tr key={fa.id} className="hover:bg-[#12192C]/50 transition-colors">
                      <td className="py-3 text-slate-300 font-medium truncate max-w-[140px]">
                        {fa.category || 'Velocity Breach'}
                      </td>
                      <td className={`py-3 text-center font-bold ${
                        Number(fa.riskScore) >= 80 ? 'text-rose-500' :
                        Number(fa.riskScore) >= 60 ? 'text-amber-500' : 'text-sky-400'
                      }`}>
                        {fa.riskScore} / 100
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${
                          fa.status === 'INVESTIGATING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          fa.status === 'CONFIRMED_FRAUD' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          fa.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {fa.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {displayAlerts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500 text-xs">
                        No active fraud alerts detected. System secure.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
