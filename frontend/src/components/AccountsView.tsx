import React, { useState, useMemo } from 'react';
import { Account } from '../types';
import { Sparkline } from './Sparkline';
import {
  Wallet,
  Coins,
  Users,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CreditCard,
  Wifi,
  Landmark,
  Send,
  ArrowDownToLine,
  FileText,
  MoreHorizontal,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';

interface AccountsViewProps {
  accounts: Account[];
  onRefresh: () => void;
  onOpenTransfer?: () => void;
}

interface DisplayAccount {
  id: string;
  accountNumber: string;
  maskedNumber: string;
  customerName: string;
  accountType: 'Savings' | 'Current' | 'Fixed Deposit';
  balance: number;
  formattedBalance: string;
  status: 'Active' | 'Blocked';
  lastActivity: string;
  ifsc: string;
  branch: string;
  monthlyActivity: { month: string; value: number }[];
}

const DEFAULT_ACCOUNTS: DisplayAccount[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    accountNumber: 'SENT-4827-001',
    maskedNumber: '**** 001',
    customerName: 'Alexander Vance',
    accountType: 'Current',
    balance: 48151.75,
    formattedBalance: '$48,151.75',
    status: 'Active',
    lastActivity: 'Active Live',
    ifsc: 'SENT0001001',
    branch: 'Sentinel Federal Reserve',
    monthlyActivity: [
      { month: 'Jan', value: 45 },
      { month: 'Feb', value: 65 },
      { month: 'Mar', value: 85 },
      { month: 'Apr', value: 95 }
    ]
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    accountNumber: 'SENT-2613-003',
    maskedNumber: '**** 003',
    customerName: 'Sarah Kim',
    accountType: 'Current',
    balance: 34599.00,
    formattedBalance: '$34,599.00',
    status: 'Active',
    lastActivity: 'Active Live',
    ifsc: 'SENT0001001',
    branch: 'Sentinel Tech Hub',
    monthlyActivity: [
      { month: 'Jan', value: 30 },
      { month: 'Feb', value: 50 },
      { month: 'Mar', value: 70 },
      { month: 'Apr', value: 80 }
    ]
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    accountNumber: 'SENT-5588-005',
    maskedNumber: '**** 005',
    customerName: 'Shavya',
    accountType: 'Current',
    balance: 50000.00,
    formattedBalance: '$50,000.00',
    status: 'Active',
    lastActivity: 'Active Live',
    ifsc: 'SENT0001001',
    branch: 'Sentinel Global Branch',
    monthlyActivity: [
      { month: 'Jan', value: 55 },
      { month: 'Feb', value: 75 },
      { month: 'Mar', value: 90 },
      { month: 'Apr', value: 85 }
    ]
  }
];

const SPARK_ACCOUNTS = [10, 14, 12, 18, 16, 22, 20, 26, 24, 30, 28, 34];
const SPARK_BALANCE = [15, 18, 16, 22, 20, 27, 24, 32, 29, 36, 33, 40];
const SPARK_FLAGGED = [4, 6, 5, 8, 7, 10, 8, 12, 9, 14, 11, 15];

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  onRefresh,
  onOpenTransfer
}) => {
  const [filterType, setFilterType] = useState<'All Accounts' | 'Savings' | 'Current' | 'Fixed Deposit' | 'Blocked'>('All Accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc-1');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'Savings' | 'Current' | 'Fixed Deposit'>('Savings');
  const [newAccBalance, setNewAccBalance] = useState('100000');

  // Convert live database accounts
  const allAccounts: DisplayAccount[] = useMemo(() => {
    if (!accounts || accounts.length === 0) return DEFAULT_ACCOUNTS;

    return accounts.map((acc, idx) => {
      const typeStr = acc.accountType === 'SAVINGS' ? 'Savings' : 'Current';
      const statusStr = acc.status === 'BLOCKED' || acc.status === 'FROZEN' ? 'Blocked' : 'Active';
      const masked = acc.maskedAccountNumber || (acc.accountNumber ? `**** ${acc.accountNumber.slice(-4)}` : `**** ${4827 + idx}`);
      const bal = Number(acc.balance || 0);

      return {
        id: acc.id || `acc-live-${idx}`,
        accountNumber: acc.accountNumber || `SENT-${1000 + idx}-001`,
        maskedNumber: masked,
        customerName: acc.ownerName || 'Alexander Vance',
        accountType: typeStr,
        balance: bal,
        formattedBalance: `$${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: statusStr,
        lastActivity: 'Active Live',
        ifsc: 'SENT0001001',
        branch: 'Sentinel Main Branch',
        monthlyActivity: [
          { month: 'Jan', value: 45 },
          { month: 'Feb', value: 65 },
          { month: 'Mar', value: 85 },
          { month: 'Apr', value: 95 }
        ]
      };
    });
  }, [accounts]);

  // Apply filters and search
  const filteredAccounts = useMemo(() => {
    return allAccounts.filter((acc) => {
      if (filterType === 'Savings' && acc.accountType !== 'Savings') return false;
      if (filterType === 'Current' && acc.accountType !== 'Current') return false;
      if (filterType === 'Fixed Deposit' && acc.accountType !== 'Fixed Deposit') return false;
      if (filterType === 'Blocked' && acc.status !== 'Blocked') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = acc.customerName.toLowerCase().includes(q);
        const matchesNum = acc.maskedNumber.toLowerCase().includes(q) || acc.accountNumber.toLowerCase().includes(q);
        const matchesType = acc.accountType.toLowerCase().includes(q);
        if (!matchesName && !matchesNum && !matchesType) return false;
      }

      return true;
    });
  }, [allAccounts, filterType, searchQuery]);

  const selectedAccount = useMemo(() => {
    return allAccounts.find(a => a.id === selectedAccountId) || allAccounts[0] || DEFAULT_ACCOUNTS[0];
  }, [allAccounts, selectedAccountId]);

  // Dynamic KPIs calculated from allAccounts
  const totalBalance = useMemo(() => {
    return allAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [allAccounts]);

  const activeAccountsCount = useMemo(() => {
    return allAccounts.filter(a => a.status === 'Active').length;
  }, [allAccounts]);

  const flaggedAccountsCount = useMemo(() => {
    return allAccounts.filter(a => a.status === 'Blocked').length;
  }, [allAccounts]);

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    onRefresh();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn select-none">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Accounts</h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Manage and view account details, balances and activity
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Account</span>
        </button>
      </div>

      {/* 2. Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Accounts */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Accounts</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">{allAccounts.length}</div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>Verified banking ledgers</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <Sparkline color="#38BDF8" data={SPARK_ACCOUNTS} width={80} height={32} glowClass="filter drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
          </div>
        </div>

        {/* Card 2: Total Balance */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Balance</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>Combined liquidity</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <Sparkline color="#38BDF8" data={SPARK_BALANCE} width={80} height={32} glowClass="filter drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
          </div>
        </div>

        {/* Card 3: Active Accounts with Circular Meter */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Active Accounts</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">{activeAccountsCount}</div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>100% operational</span>
              </div>
            </div>
          </div>

          {/* Emerald Circular Gauge */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#1E293B"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#10B981"
                strokeWidth="3.5"
                strokeDasharray="100"
                strokeDashoffset="6"
                strokeLinecap="round"
                fill="transparent"
                className="filter drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Flagged Accounts */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Flagged Accounts</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">{flaggedAccountsCount}</div>
              <div className="text-slate-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>Zero compliance holds</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <Sparkline color="#F43F5E" data={SPARK_FLAGGED} width={80} height={32} glowClass="filter drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
          </div>
        </div>
      </div>

      {/* 3. Main Split Section: Accounts Table (Left) + Account Overview Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Filter Pills + Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['All Accounts', 'Savings', 'Current', 'Fixed Deposit', 'Blocked'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filterType === tab
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-[#162038]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Box & Filter Button */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0C1222] border border-[#1E293B] text-slate-200 placeholder-slate-500 text-xs pl-8 pr-3 py-1.5 rounded-xl w-44 sm:w-48 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C1222] border border-[#1E293B] hover:border-slate-600 text-slate-300 text-xs font-medium transition-colors">
                <Filter className="w-3 h-3 text-slate-400" />
                <span>Filter</span>
                <span className="text-[10px] text-slate-500">▾</span>
              </button>
            </div>
          </div>

          {/* Accounts High-Density Table */}
          <div className="rounded-2xl bg-[#0C1222] border border-[#162038] shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#162038] text-[11px] font-medium text-slate-400">
                    <th className="py-3.5 px-5">Account Number</th>
                    <th className="py-3.5 px-5">Customer Name</th>
                    <th className="py-3.5 px-5">Account Type</th>
                    <th className="py-3.5 px-5">Balance</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Last Activity</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162038]/60 text-xs">
                  {filteredAccounts.map((acc) => {
                    const isSelected = selectedAccountId === acc.id;
                    return (
                      <tr
                        key={acc.id}
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`transition-colors group cursor-pointer ${
                          isSelected ? 'bg-[#152347]/60' : 'hover:bg-[#12192C]/80'
                        }`}
                      >
                        {/* Account Number */}
                        <td className="py-3.5 px-5 font-mono text-slate-200 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                            <span>{acc.maskedNumber}</span>
                          </div>
                        </td>

                        {/* Customer Name */}
                        <td className="py-3.5 px-5 text-white font-medium whitespace-nowrap">
                          {acc.customerName}
                        </td>

                        {/* Account Type */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          {acc.accountType === 'Savings' ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
                              Savings
                            </span>
                          ) : acc.accountType === 'Current' ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/15 text-purple-400 border border-purple-500/20">
                              Current
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
                              Fixed Deposit
                            </span>
                          )}
                        </td>

                        {/* Balance */}
                        <td className="py-3.5 px-5 text-white font-bold whitespace-nowrap">
                          {acc.formattedBalance}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          {acc.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              <span>Blocked</span>
                            </span>
                          )}
                        </td>

                        {/* Last Activity */}
                        <td className="py-3.5 px-5 text-slate-400 font-normal whitespace-nowrap">
                          {acc.lastActivity}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setSelectedAccountId(acc.id)}
                              className="px-3 py-1 rounded-lg border border-[#253352] text-xs text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/10 transition-all font-medium"
                            >
                              View Details
                            </button>
                            <button className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#162038] transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#162038] text-xs text-slate-400 gap-3">
              <div>Showing 1–{filteredAccounts.length} of {allAccounts.length} accounts</div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-semibold bg-blue-600 text-white shadow-md shadow-blue-600/30"
                >
                  1
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Overview Dedicated Panel (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0C1222] border border-[#162038] p-5 shadow-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header with Title and Active Badge */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Account Overview</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                selectedAccount.status === 'Active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {selectedAccount.status}
              </span>
            </div>

            {/* Realistic Digital Bank Card Graphic */}
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-4 text-white shadow-xl overflow-hidden border border-blue-400/30">
              {/* Background watermark */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

              {/* Top Card Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* EMV Chip */}
                  <div className="w-7 h-5 rounded bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 border border-amber-300 shadow-sm flex items-center justify-center">
                    <div className="w-5 h-3 border border-amber-600/40 rounded-sm" />
                  </div>
                  {/* Contactless waves */}
                  <Wifi className="w-4 h-4 text-blue-200 transform rotate-90" />
                </div>

                <div className="flex items-center space-x-1.5 text-right">
                  <Landmark className="w-4 h-4 text-blue-200" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-blue-100 font-mono">
                    SENTINEL BANK
                  </span>
                </div>
              </div>

              {/* Bottom Card Row */}
              <div className="mt-8">
                <div className="font-mono text-base font-bold tracking-widest text-white drop-shadow">
                  {selectedAccount.maskedNumber}
                </div>
                <div className="text-[11px] text-blue-200 mt-1 font-medium">
                  {selectedAccount.accountType} Account
                </div>
              </div>
            </div>

            {/* Big Available Balance Display */}
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {selectedAccount.formattedBalance}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Available Balance</div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <button
                onClick={onOpenTransfer}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#070A13] hover:bg-[#12192C] border border-[#162038] hover:border-blue-500/40 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-slate-300 font-medium mt-1.5">Transfer</span>
              </button>

              <button
                onClick={() => alert(`Simulating deposit for ${selectedAccount.maskedNumber}...`)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#070A13] hover:bg-[#12192C] border border-[#162038] hover:border-emerald-500/40 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-slate-300 font-medium mt-1.5">Deposit</span>
              </button>

              <a
                href="/api/transactions/export/csv"
                download
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#070A13] hover:bg-[#12192C] border border-[#162038] hover:border-sky-500/40 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-slate-300 font-medium mt-1.5">Statement</span>
              </a>

              <button
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#070A13] hover:bg-[#12192C] border border-[#162038] hover:border-slate-600 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-slate-300 font-medium mt-1.5">More</span>
              </button>
            </div>

            {/* Account Details Key-Value List */}
            <div className="border-t border-[#162038] pt-4 space-y-2.5 text-xs">
              <div className="text-xs font-bold text-white">Account Details</div>

              <div className="space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Account Holder</span>
                  <span className="text-white font-medium">{selectedAccount.customerName}</span>
                </div>

                <div className="flex justify-between">
                  <span>Account Type</span>
                  <span className="text-white font-medium">{selectedAccount.accountType} Account</span>
                </div>

                <div className="flex justify-between">
                  <span>IFSC</span>
                  <span className="text-white font-mono font-medium">{selectedAccount.ifsc}</span>
                </div>

                <div className="flex justify-between">
                  <span>Branch</span>
                  <span className="text-white font-medium">{selectedAccount.branch}</span>
                </div>

                <div className="flex justify-between">
                  <span>Account Status</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{selectedAccount.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Activity Bar Chart */}
            <div className="border-t border-[#162038] pt-4">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-white">Monthly Activity</span>
                <span className="text-slate-400 font-mono">$12.5K</span>
              </div>

              <div className="h-20 flex items-end justify-between gap-3 px-2">
                {selectedAccount.monthlyActivity.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-md bg-blue-600 hover:bg-blue-500 transition-all shadow-sm shadow-blue-600/40"
                      style={{ height: `${bar.value}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-medium">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0C1222] border border-[#1E293B] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#162038]">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Create Simulated Account</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#162038]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full bg-[#070A13] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Account Type</label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value as any)}
                  className="w-full bg-[#070A13] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Savings">Savings Account</option>
                  <option value="Current">Current / Business Account</option>
                  <option value="Fixed Deposit">Fixed Deposit (FD)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Initial Ledger Balance ($)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full bg-[#070A13] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#162038] hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/30 transition-all"
                >
                  Open Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
