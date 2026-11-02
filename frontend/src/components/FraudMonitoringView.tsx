import React, { useState, useEffect } from 'react';
import { FraudAlert, Transaction } from '../types';
import { Sparkline } from './Sparkline';
import {
  ShieldAlert,
  Activity,
  ArrowLeftRight,
  ShieldCheck,
  AlertTriangle,
  Ban,
  BarChart3,
  PieChart as PieIcon,
  Zap,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface FraudMonitoringViewProps {
  alerts: FraudAlert[];
  transactions: Transaction[];
  onRefresh: () => void;
  onOpenInvestigation: (alert: FraudAlert) => void;
  onTriggerScenario?: (type: string) => void;
}

// Sparkline Mock Data
const SPARK_TOTAL = [18, 22, 20, 26, 24, 30, 28, 35, 33, 40, 38, 44];
const SPARK_SUCCESS = [17, 21, 19, 25, 23, 29, 27, 34, 32, 38, 36, 42];
const SPARK_FLAGGED = [8, 12, 10, 15, 12, 19, 14, 22, 18, 25, 20, 27];
const SPARK_BLOCKED = [5, 7, 6, 9, 8, 12, 10, 14, 11, 16, 13, 18];

// Fraud Trends Chart Data
const TRENDS_DATA = [
  { time: '12AM', total: 60, alerts: 20 },
  { time: '4AM', total: 85, alerts: 30 },
  { time: '8AM', total: 72, alerts: 24 },
  { time: '12PM', total: 110, alerts: 45 },
  { time: '4PM', total: 95, alerts: 38 },
  { time: '8PM', total: 140, alerts: 60 },
  { time: '12AM', total: 130, alerts: 52 },
];

// Donut Chart Data
const RISK_DISTRIBUTION_DATA = [
  { name: 'Low', value: 72.3, color: '#10B981' },
  { name: 'Medium', value: 16.1, color: '#F59E0B' },
  { name: 'High', value: 7.4, color: '#F97316' },
  { name: 'Critical', value: 3.2, color: '#EF4444' }
];

interface AlertRow {
  alertId: string;
  transactionId: string;
  customer: string;
  riskScore: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  detectedAt: string;
  status: 'Under Review' | 'Investigating' | 'Flagged' | 'Monitoring' | 'Resolved';
  isFirst?: boolean;
  rawAlert?: FraudAlert;
}

const DEFAULT_ALERTS: AlertRow[] = [
  {
    alertId: 'FA-10472',
    transactionId: 'TXN-78421',
    customer: 'Aarav Mehta',
    riskScore: 92,
    severity: 'Critical',
    detectedAt: '14:41:12',
    status: 'Under Review',
    isFirst: true
  },
  {
    alertId: 'FA-10471',
    transactionId: 'TXN-78420',
    customer: 'Diya Sharma',
    riskScore: 78,
    severity: 'High',
    detectedAt: '14:39:47',
    status: 'Investigating'
  },
  {
    alertId: 'FA-10470',
    transactionId: 'TXN-78419',
    customer: 'Rohan Gupta',
    riskScore: 65,
    severity: 'High',
    detectedAt: '14:37:21',
    status: 'Flagged'
  },
  {
    alertId: 'FA-10469',
    transactionId: 'TXN-78418',
    customer: 'Ishita Verma',
    riskScore: 52,
    severity: 'Medium',
    detectedAt: '14:35:09',
    status: 'Monitoring'
  },
  {
    alertId: 'FA-10468',
    transactionId: 'TXN-78417',
    customer: 'Kabir Singh',
    riskScore: 48,
    severity: 'Medium',
    detectedAt: '14:32:18',
    status: 'Resolved'
  }
];

interface FeedItem {
  time: string;
  amount: string;
  status: 'Flagged' | 'Blocked' | 'Approved';
  reason: string;
}

const DEFAULT_FEED: FeedItem[] = [
  { time: '14:42:10', amount: '₹75,000', status: 'Flagged', reason: 'Unusual location detected' },
  { time: '14:41:56', amount: '₹2,50,000', status: 'Blocked', reason: 'High risk score (92/100)' },
  { time: '14:41:33', amount: '₹12,500', status: 'Approved', reason: 'Normal transaction' },
  { time: '14:41:20', amount: '₹8,300', status: 'Approved', reason: 'Normal transaction' }
];

export const FraudMonitoringView: React.FC<FraudMonitoringViewProps> = ({
  alerts,
  transactions,
  onRefresh,
  onOpenInvestigation,
  onTriggerScenario
}) => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [showSimulatorDrawer, setShowSimulatorDrawer] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Merge live alerts with defaults
  const displayAlerts: AlertRow[] = React.useMemo(() => {
    if (!alerts || alerts.length === 0) return DEFAULT_ALERTS;

    const liveConverted: AlertRow[] = alerts.slice(0, 5).map((a, idx) => {
      const dateObj = new Date(a.createdAt);
      const timeStr = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      let sev: AlertRow['severity'] = 'High';
      if (a.severity === 'CRITICAL') sev = 'Critical';
      else if (a.severity === 'HIGH') sev = 'High';
      else if (a.severity === 'MEDIUM') sev = 'Medium';
      else sev = 'Low';

      let stat: AlertRow['status'] = 'Under Review';
      if (a.status === 'INVESTIGATING') stat = 'Investigating';
      else if (a.status === 'CONFIRMED_FRAUD') stat = 'Flagged';
      else if (a.status === 'RESOLVED') stat = 'Resolved';
      else if (idx === 0) stat = 'Under Review';
      else if (idx === 3) stat = 'Monitoring';

      return {
        alertId: `FA-${10472 - idx}`,
        transactionId: a.referenceId ? `TXN-${a.referenceId.slice(-5)}` : `TXN-${78421 - idx}`,
        customer: a.customerName || 'Customer Account',
        riskScore: a.riskScore || 85,
        severity: sev,
        detectedAt: timeStr,
        status: stat,
        isFirst: idx === 0,
        rawAlert: a
      };
    });

    return liveConverted.length >= 5 ? liveConverted : [...liveConverted, ...DEFAULT_ALERTS.slice(liveConverted.length)];
  }, [alerts]);

  const handleAlertClick = (alertRow: AlertRow) => {
    if (alertRow.rawAlert) {
      onOpenInvestigation(alertRow.rawAlert);
    } else if (alerts && alerts.length > 0) {
      onOpenInvestigation(alerts[0]);
    } else {
      // Synthesize a representative alert for exploration
      const mockAlert: FraudAlert = {
        id: alertRow.alertId,
        transactionId: alertRow.transactionId,
        referenceId: alertRow.transactionId,
        transactionAmount: 75000,
        customerAccountNumber: 'SENT-1001-2001-3001',
        customerName: alertRow.customer,
        category: 'Unusual Location',
        riskScore: alertRow.riskScore,
        severity: alertRow.severity.toUpperCase() as any,
        reason: `[Unusual Location (+25 pts)]: Geolocation jump detected within unrealistic transit threshold. | [Risk Score ${alertRow.riskScore}/100]: Flagged for manual analyst verification.`,
        status: 'INVESTIGATING',
        createdAt: new Date().toISOString(),
        notes: []
      };
      onOpenInvestigation(mockAlert);
    }
  };

  const handleSimulateAttack = async (type: string) => {
    if (!onTriggerScenario) return;
    setSimulating(true);
    try {
      await onTriggerScenario(type);
    } finally {
      setSimulating(false);
      setShowSimulatorDrawer(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn select-none">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Title & Red Badge */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/25 via-red-600/20 to-rose-700/30 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-6 h-6 text-rose-400 fill-rose-500/20" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Fraud Monitoring</h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Real-time fraud detection and risk analysis</p>
          </div>
        </div>

        {/* Right: Live Monitoring Pulse + UTC Time + Simulator Toggle */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-[#0C1222] border border-emerald-500/30 flex items-center gap-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-400">Live Monitoring</span>
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse ml-0.5" />
          </div>

          <div className="text-xs text-slate-300 font-mono tracking-tight bg-[#0C1222] px-3.5 py-1.5 rounded-full border border-[#162038]">
            Apr 25, 2025 • 14:42:18 UTC
          </div>

          <button
            onClick={() => setShowSimulatorDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-semibold transition-all shadow-sm"
            title="Inject attack vector into live Java engine"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Simulate</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Transactions */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Transactions</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">248,732</div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>↑ +12.5%</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <Sparkline color="#38BDF8" data={SPARK_TOTAL} width={90} height={32} glowClass="filter drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
          </div>
        </div>

        {/* Card 2: Successful */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Successful</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">232,540</div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>↑ +11.8%</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <Sparkline color="#10B981" data={SPARK_SUCCESS} width={90} height={32} glowClass="filter drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        {/* Card 3: Flagged */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Flagged</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">2,341</div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>↑ +22.7%</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <Sparkline color="#F43F5E" data={SPARK_FLAGGED} width={90} height={32} glowClass="filter drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
          </div>
        </div>

        {/* Card 4: Blocked */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Blocked</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">1,287</div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>↑ +18.4%</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <Sparkline color="#A855F7" data={SPARK_BLOCKED} width={90} height={32} glowClass="filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Fraud Trends + Risk Distribution + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Fraud Trends (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-[#0C1222] border border-[#162038] p-5 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header with Title and Time Pills */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Fraud Trends</h3>
              </div>

              <div className="flex items-center bg-[#070A13] border border-[#162038] rounded-lg p-0.5 text-xs">
                {(['1h', '24h', '7d', '30d'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTimeRange(tab)}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                      timeRange === tab
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 mb-4 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] inline-block shadow-sm shadow-[#38BDF8]" />
                <span className="text-slate-300">Total Transactions</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] inline-block shadow-sm shadow-[#F43F5E]" />
                <span className="text-slate-300">Fraud Alerts</span>
              </div>
            </div>
          </div>

          {/* Glowing Area Chart */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TRENDS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fraudTotalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fraudAlertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '11px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#fraudTotalGrad)"
                  dot={{ r: 3, fill: '#38BDF8' }}
                />
                <Area
                  type="monotone"
                  dataKey="alerts"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#fraudAlertGrad)"
                  dot={{ r: 3, fill: '#F43F5E' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Middle: Risk Distribution (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-[#0C1222] border border-[#162038] p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Risk Distribution</h3>
          </div>

          <div className="flex items-center justify-between my-2">
            {/* Center Donut */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RISK_DISTRIBUTION_DATA}
                    innerRadius={38}
                    outerRadius={54}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {RISK_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-white">6.8%</span>
                <span className="text-[10px] text-slate-400">Fraud Rate</span>
              </div>
            </div>

            {/* Legend on Right */}
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-slate-300 text-[11px]">Low</span>
                </div>
                <span className="text-white font-semibold text-[11px]">72.3%</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span className="text-slate-300 text-[11px]">Medium</span>
                </div>
                <span className="text-white font-semibold text-[11px]">16.1%</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                  <span className="text-slate-300 text-[11px]">High</span>
                </div>
                <span className="text-white font-semibold text-[11px]">7.4%</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span className="text-slate-300 text-[11px]">Critical</span>
                </div>
                <span className="text-white font-semibold text-[11px]">3.2%</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono border-t border-[#162038] pt-2">
            Calculated across 248k audited events
          </div>
        </div>

        {/* Right: Top Fraud Categories (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-[#0C1222] border border-[#162038] p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Top Fraud Categories</h3>
          </div>

          {/* Category Progress Bars */}
          <div className="space-y-3.5 my-2 text-xs">
            {/* Category 1: Unusual Location */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                <span>Unusual Location</span>
                <span className="font-semibold text-white">34.2%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 w-[34.2%]" />
              </div>
            </div>

            {/* Category 2: Large Transaction */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                <span>Large Transaction</span>
                <span className="font-semibold text-white">28.7%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 w-[28.7%]" />
              </div>
            </div>

            {/* Category 3: Rapid Transactions */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                <span>Rapid Transactions</span>
                <span className="font-semibold text-white">22.5%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[22.5%]" />
              </div>
            </div>

            {/* Category 4: Failed Attempts */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                <span>Failed Attempts</span>
                <span className="font-semibold text-white">14.6%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[14.6%]" />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono border-t border-[#162038] pt-2">
            Top trigger: Impossible Velocity rule
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Fraud Alerts Table + Live Transaction Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Fraud Alerts (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#162038]">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Recent Fraud Alerts</h3>
            </div>

            <button
              onClick={onRefresh}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#162038] text-[11px] font-medium text-slate-400">
                  <th className="py-3 px-5">Alert ID</th>
                  <th className="py-3 px-5">Transaction ID</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Risk Score</th>
                  <th className="py-3 px-5">Severity</th>
                  <th className="py-3 px-5">Detected At</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162038]/60 text-xs font-medium">
                {displayAlerts.map((row) => (
                  <tr
                    key={row.alertId}
                    className="hover:bg-[#12192C]/80 transition-colors group cursor-pointer"
                    onClick={() => handleAlertClick(row)}
                  >
                    {/* Alert ID */}
                    <td className="py-3.5 px-5 font-mono text-slate-300 whitespace-nowrap">
                      {row.alertId}
                    </td>

                    {/* Transaction ID */}
                    <td className="py-3.5 px-5 font-mono text-slate-400 whitespace-nowrap">
                      {row.transactionId}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-5 text-white font-medium whitespace-nowrap">
                      {row.customer}
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`font-bold ${
                        row.riskScore >= 80
                          ? 'text-rose-400'
                          : row.riskScore >= 60
                          ? 'text-orange-400'
                          : row.riskScore >= 40
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {row.riskScore}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {row.severity === 'Critical' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Critical</span>
                        </span>
                      ) : row.severity === 'High' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>High</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                          <span>Medium</span>
                        </span>
                      )}
                    </td>

                    {/* Detected At */}
                    <td className="py-3.5 px-5 font-mono text-slate-400 whitespace-nowrap">
                      {row.detectedAt}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {row.status === 'Under Review' ? (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/15 text-amber-300">
                          Under Review
                        </span>
                      ) : row.status === 'Investigating' ? (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/15 text-blue-300">
                          Investigating
                        </span>
                      ) : row.status === 'Flagged' ? (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/15 text-rose-300">
                          Flagged
                        </span>
                      ) : row.status === 'Monitoring' ? (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/15 text-sky-300">
                          Monitoring
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-300">
                          Resolved
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {row.isFirst ? (
                        <button
                          onClick={() => handleAlertClick(row)}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/30 transition-all"
                        >
                          Investigate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAlertClick(row)}
                          className="px-3 py-1 rounded-lg border border-[#253352] text-xs text-slate-300 hover:text-white hover:border-blue-500 transition-all font-medium"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Live Transaction Feed (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0C1222] border border-[#162038] p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-[#162038]">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Live Transaction Feed</h3>
            </div>

            {/* List of feed items */}
            <div className="space-y-4">
              {DEFAULT_FEED.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs">
                  {/* Status Dot */}
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    item.status === 'Flagged' || item.status === 'Blocked' ? 'bg-rose-500 shadow-sm shadow-rose-500' : 'bg-emerald-500 shadow-sm shadow-emerald-500'
                  }`} />

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">{item.time}</span>
                      <span className="text-white font-bold">{item.amount}</span>
                      <span className={`font-semibold ${
                        item.status === 'Flagged' || item.status === 'Blocked' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        ● {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-[#162038] flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Kafka Ingestion Stream:</span>
            <span className="text-emerald-400">4,200 msg/sec</span>
          </div>
        </div>
      </div>

      {/* 5. Threat Scenario Injector Modal / Slide-over */}
      {showSimulatorDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0C1222] border border-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#162038]">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white font-mono">EMIT THREAT VECTOR TO SENTINEL ENGINE</h3>
              </div>
              <button
                onClick={() => setShowSimulatorDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#162038]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-xs text-slate-400">
                Execute live simulation against the Spring Boot 3 Java Fraud Detection Engine. Risk scores will be calculated in real-time across the 7 active detection rules.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  disabled={simulating}
                  onClick={() => handleSimulateAttack('rapid')}
                  className="w-full text-left p-3 rounded-xl bg-[#070A13] hover:bg-[#12192C] border border-[#162038] hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-white">
                    <span>RULE 2 &amp; 3: Rapid High-Frequency Burst</span>
                    <span className="text-blue-400 group-hover:translate-x-1 transition-transform">Run →</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    5 consecutive transfers within 10 seconds triggering velocity spikes.
                  </p>
                </button>

                <button
                  disabled={simulating}
                  onClick={() => handleSimulateAttack('large')}
                  className="w-full text-left p-3 rounded-xl bg-[#070A13] hover:bg-[#12192C] border border-[#162038] hover:border-rose-500/50 transition-all group"
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-white">
                    <span>RULE 1: Whale Transfer Exceeding Limit</span>
                    <span className="text-rose-400 group-hover:translate-x-1 transition-transform">Run →</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Single transfer of $75,000 exceeding threshold by 750%.
                  </p>
                </button>

                <button
                  disabled={simulating}
                  onClick={() => handleSimulateAttack('velocity')}
                  className="w-full text-left p-3 rounded-xl bg-[#070A13] hover:bg-[#12192C] border border-[#162038] hover:border-amber-500/50 transition-all group"
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-white">
                    <span>RULE 5: Impossible Geolocation Jump</span>
                    <span className="text-amber-400 group-hover:translate-x-1 transition-transform">Run →</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Transaction in New York followed 30 seconds later from Lagos, Nigeria.
                  </p>
                </button>

                <button
                  disabled={simulating}
                  onClick={() => handleSimulateAttack('structuring')}
                  className="w-full text-left p-3 rounded-xl bg-[#070A13] hover:bg-[#12192C] border border-[#162038] hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-white">
                    <span>RULE 7: Structuring / Smurfing Pattern</span>
                    <span className="text-purple-400 group-hover:translate-x-1 transition-transform">Run →</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Repetitive transfers between $8,500 and $9,950 avoiding $10k reporting.
                  </p>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#162038] bg-[#0A0F1D] flex justify-end">
              <button
                onClick={() => setShowSimulatorDrawer(false)}
                className="px-4 py-2 rounded-xl bg-[#162038] hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
