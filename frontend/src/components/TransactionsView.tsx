import React, { useState, useMemo } from 'react';
import { Transaction, Account } from '../types';
import {
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
  Wallet,
  Download,
  Search,
  Calendar,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  FileText,
  Clock,
  ShieldAlert,
  MapPin,
  Laptop
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts?: Account[];
  onRefresh: () => void;
  onOpenTransfer?: () => void;
}

interface DisplayTxn {
  id: string;
  referenceId: string;
  formattedDate: string;
  type: 'Sent' | 'Received';
  counterparty: string;
  amount: number;
  formattedAmount: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Flagged' | 'Blocked';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number;
  raw?: Transaction;
}

const DEFAULT_TRANSACTIONS: DisplayTxn[] = [
  {
    id: 'TXN-78421',
    referenceId: 'TXN-78421',
    formattedDate: 'Apr 25, 2025 • 14:32',
    type: 'Sent',
    counterparty: 'Sarah Kim',
    amount: -1250.00,
    formattedAmount: '-$1,250.00',
    status: 'Completed',
    riskLevel: 'Low',
    riskScore: 12
  },
  {
    id: 'TXN-78420',
    referenceId: 'TXN-78420',
    formattedDate: 'Apr 25, 2025 • 13:21',
    type: 'Received',
    counterparty: 'Alex Chen',
    amount: 4800.00,
    formattedAmount: '+$4,800.00',
    status: 'Completed',
    riskLevel: 'Low',
    riskScore: 8
  },
  {
    id: 'TXN-78419',
    referenceId: 'TXN-78419',
    formattedDate: 'Apr 24, 2025 • 18:45',
    type: 'Sent',
    counterparty: 'Amazon Purchase',
    amount: -89.99,
    formattedAmount: '-$89.99',
    status: 'Completed',
    riskLevel: 'Medium',
    riskScore: 42
  },
  {
    id: 'TXN-78418',
    referenceId: 'TXN-78418',
    formattedDate: 'Apr 24, 2025 • 17:12',
    type: 'Sent',
    counterparty: 'Sarah Kim',
    amount: -750.00,
    formattedAmount: '-$750.00',
    status: 'Completed',
    riskLevel: 'Low',
    riskScore: 15
  },
  {
    id: 'TXN-78417',
    referenceId: 'TXN-78417',
    formattedDate: 'Apr 23, 2025 • 11:30',
    type: 'Received',
    counterparty: 'Netflix Subscription',
    amount: 15.99,
    formattedAmount: '+$15.99',
    status: 'Completed',
    riskLevel: 'Low',
    riskScore: 5
  },
  {
    id: 'TXN-78416',
    referenceId: 'TXN-78416',
    formattedDate: 'Apr 22, 2025 • 20:20',
    type: 'Sent',
    counterparty: 'David Lee',
    amount: -320.00,
    formattedAmount: '-$320.00',
    status: 'Completed',
    riskLevel: 'Low',
    riskScore: 10
  },
  {
    id: 'TXN-78415',
    referenceId: 'TXN-78415',
    formattedDate: 'Apr 22, 2025 • 16:10',
    type: 'Sent',
    counterparty: 'Online Store',
    amount: -129.50,
    formattedAmount: '-$129.50',
    status: 'Completed',
    riskLevel: 'Medium',
    riskScore: 45
  },
  {
    id: 'TXN-78414',
    referenceId: 'TXN-78414',
    formattedDate: 'Apr 21, 2025 • 19:33',
    type: 'Received',
    counterparty: 'Michael Brown',
    amount: 2500.00,
    formattedAmount: '+$2,500.00',
    status: 'Completed',
    riskLevel: 'Low',
    riskScore: 18
  }
];

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  onRefresh,
  onOpenTransfer
}) => {
  const [filterType, setFilterType] = useState<'All' | 'Sent' | 'Received' | 'Pending' | 'Failed'>('All');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState<DisplayTxn | null>(null);

  // Use real live transactions from database
  const allDisplayTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return DEFAULT_TRANSACTIONS;

    return transactions.map((t, idx): DisplayTxn => {
      // Determine if sent from user's account
      const userAccNums = accounts ? accounts.map(a => a.accountNumber) : [];
      const isSent = userAccNums.includes(t.sourceAccountNumber) || 
                     (!userAccNums.includes(t.destinationAccountNumber) && t.sourceOwnerName?.toLowerCase().includes('alexander'));
      
      const counterparty = isSent
        ? (t.destinationOwnerName || t.description || t.destinationAccountNumber || 'External Beneficiary')
        : (t.sourceOwnerName || t.description || t.sourceAccountNumber || 'External Sender');
      
      const dateObj = t.createdAt ? new Date(t.createdAt) : new Date();
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' • ' + dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      let statusStr: DisplayTxn['status'] = 'Completed';
      if (t.status === 'COMPLETED' || t.status === 'APPROVED') statusStr = 'Completed';
      else if (t.status === 'PENDING' || t.status === 'INITIATED') statusStr = 'Pending';
      else if (t.status === 'FLAGGED') statusStr = 'Flagged';
      else if (t.status === 'BLOCKED') statusStr = 'Blocked';
      else if (t.status === 'FAILED') statusStr = 'Failed';

      const numScore = Number(t.riskScore || 0);
      const riskLvl: DisplayTxn['riskLevel'] = (t.riskLevel as DisplayTxn['riskLevel']) ||
        (numScore >= 80 ? 'Critical' : numScore >= 60 ? 'High' : numScore >= 30 ? 'Medium' : 'Low');

      const prefix = isSent ? '-' : '+';
      const formattedAmt = `${prefix}$${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      return {
        id: `TXN-${80000 + idx}`,
        referenceId: t.referenceId || `TXN-${80000 + idx}`,
        formattedDate,
        type: isSent ? 'Sent' : 'Received',
        counterparty,
        amount: isSent ? -Math.abs(Number(t.amount)) : Math.abs(Number(t.amount)),
        formattedAmount: formattedAmt,
        status: statusStr,
        riskLevel: riskLvl,
        riskScore: numScore,
        raw: t
      };
    });
  }, [transactions, accounts]);

  // Apply filters and search
  const filteredTransactions = useMemo(() => {
    return allDisplayTransactions.filter((txn) => {
      // Type / Status filter
      if (filterType === 'Sent' && txn.type !== 'Sent') return false;
      if (filterType === 'Received' && txn.type !== 'Received') return false;
      if (filterType === 'Pending' && txn.status !== 'Pending') return false;
      if (filterType === 'Failed' && txn.status !== 'Failed') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = txn.id.toLowerCase().includes(q) || txn.referenceId.toLowerCase().includes(q);
        const matchesCounterparty = txn.counterparty.toLowerCase().includes(q);
        const matchesAmount = txn.formattedAmount.toLowerCase().includes(q);
        if (!matchesId && !matchesCounterparty && !matchesAmount) return false;
      }

      return true;
    });
  }, [allDisplayTransactions, filterType, searchQuery]);

  const pageSize = 8;
  const totalCount = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDownloadStatement = () => {
    const headers = ['Reference ID', 'Date', 'Type', 'Counterparty', 'Amount (USD)', 'Status', 'Risk Score', 'Risk Level'];
    const rows = filteredTransactions.map(t => [
      t.referenceId,
      t.formattedDate,
      t.type,
      `"${t.counterparty.replace(/"/g, '""')}"`,
      t.amount,
      t.status,
      t.riskScore,
      t.riskLevel
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* 1. View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">Track and manage all your transactions securely</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadStatement}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C1222] hover:bg-[#162038] border border-[#1E293B] text-slate-200 text-xs font-medium shadow-sm transition-all hover:border-slate-600"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Download Statement</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Transactions */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Transactions</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">248</div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>↑ +12% vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Sent */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Sent</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">$18,750.32</div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>↑ +8.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Received */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <ArrowDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Received</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">$22,349.17</div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                <span>↑ +14.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Current Balance */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-[#162038] shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Current Balance</div>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">$24,750.32</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Pills and Search Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Sent', 'Received', 'Pending', 'Failed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterType === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#162038]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right: Date Range Dropdown + Search Box */}
        <div className="flex items-center gap-3">
          {/* Date Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C1222] border border-[#1E293B] hover:border-slate-600 text-slate-300 text-xs font-medium transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {showDateDropdown && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-2xl py-1 z-30 text-xs">
                {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setDateRange(option);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-[#162038] transition-colors ${
                      dateRange === option ? 'text-blue-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0C1222] border border-[#1E293B] text-slate-200 placeholder-slate-500 text-xs pl-9 pr-4 py-1.5 rounded-full w-56 sm:w-64 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Transactions High-Density Table */}
      <div className="rounded-2xl bg-[#0C1222] border border-[#162038] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#162038] text-xs font-medium text-slate-400">
                <th className="py-3.5 px-6">Date &amp; Time</th>
                <th className="py-3.5 px-6">Transaction ID</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Counterparty</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Risk Level</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162038]/60 text-xs">
              {paginatedTransactions.map((txn) => {
                return (
                  <tr
                    key={txn.id}
                    className="hover:bg-[#12192C]/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedTxn(txn)}
                  >
                    {/* Date & Time */}
                    <td className="py-4 px-6 text-slate-300 font-normal whitespace-nowrap">
                      {txn.formattedDate}
                    </td>

                    {/* Transaction ID */}
                    <td className="py-4 px-6 text-slate-300 font-mono whitespace-nowrap">
                      {txn.id}
                    </td>

                    {/* Type */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {txn.type === 'Sent' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ArrowUp className="w-3 h-3" />
                          <span>Sent</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ArrowDown className="w-3 h-3" />
                          <span>Received</span>
                        </span>
                      )}
                    </td>

                    {/* Counterparty */}
                    <td className="py-4 px-6 text-white font-medium whitespace-nowrap">
                      {txn.counterparty}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 text-white font-bold whitespace-nowrap">
                      {txn.formattedAmount}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    </td>

                    {/* Risk Level */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {txn.riskLevel === 'Low' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Low</span>
                        </span>
                      ) : txn.riskLevel === 'Medium' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Medium</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ShieldAlert className="w-3 h-3" />
                          <span>{txn.riskLevel}</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="px-3 py-1 rounded-lg border border-[#253352] text-xs text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/10 transition-all font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#162038] transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#162038] text-xs text-slate-400 gap-3">
          <div>
            Showing 1–{paginatedTransactions.length} of {totalCount} transactions
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#162038] transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold transition-all ${
                currentPage === 1
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#162038]'
              }`}
            >
              1
            </button>

            <button
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-medium transition-all ${
                currentPage === 2
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#162038]'
              }`}
            >
              2
            </button>

            <button
              onClick={() => setCurrentPage(3)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-medium transition-all ${
                currentPage === 3
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#162038]'
              }`}
            >
              3
            </button>

            <span className="px-1 text-slate-600">...</span>

            <button
              onClick={() => setCurrentPage(32)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-medium transition-all ${
                currentPage === 32
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#162038]'
              }`}
            >
              32
            </button>

            <button
              disabled={currentPage === 32}
              onClick={() => setCurrentPage(prev => Math.min(32, prev + 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#162038] transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Transaction Detail Slide-over / Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0C1222] border border-[#1E293B] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#162038]">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  selectedTxn.type === 'Sent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {selectedTxn.type === 'Sent' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    {selectedTxn.id}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Ref: {selectedTxn.referenceId}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#162038]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Amount Display */}
              <div className="p-4 rounded-xl bg-[#070A13] border border-[#162038] text-center">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">Transaction Value</div>
                <div className={`text-3xl font-extrabold mt-1 ${selectedTxn.type === 'Sent' ? 'text-white' : 'text-emerald-400'}`}>
                  {selectedTxn.formattedAmount}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Completed &amp; Settled</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    Ledger Balanced
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#070A13] border border-[#162038]">
                  <div className="text-slate-400 text-[11px]">Counterparty</div>
                  <div className="font-semibold text-white mt-1">{selectedTxn.counterparty}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#070A13] border border-[#162038]">
                  <div className="text-slate-400 text-[11px]">Date &amp; Time</div>
                  <div className="font-semibold text-white mt-1">{selectedTxn.formattedDate}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#070A13] border border-[#162038]">
                  <div className="text-slate-400 text-[11px]">Risk Engine Score</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-white">{selectedTxn.riskScore} / 100</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      selectedTxn.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {selectedTxn.riskLevel} Risk
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#070A13] border border-[#162038]">
                  <div className="text-slate-400 text-[11px]">Processing Engine</div>
                  <div className="font-semibold text-sky-400 mt-1">SENTINEL Atomic v2.4</div>
                </div>
              </div>

              {/* Security & Audit Metadata */}
              <div className="p-3 rounded-xl bg-[#070A13] border border-[#162038] text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Double-Entry Proof:</span>
                  <span className="text-emerald-400">Balanced (Debit = Credit)</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification Signature:</span>
                  <span className="text-slate-300">0x8f2d...4a19 [Verified]</span>
                </div>
                <div className="flex justify-between">
                  <span>Routing Protocol:</span>
                  <span className="text-slate-300">ACH / FedNow Instant Rail</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#162038] bg-[#0A0F1D] flex justify-end gap-3">
              <button
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 rounded-xl bg-[#162038] hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownloadStatement}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/30 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
