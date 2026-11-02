import React, { useState } from 'react';
import { Transaction } from '../../types';
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, RefreshCw, FileText } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filtered = transactions.filter(t => {
    const matchesSearch =
      t.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.sourceAccountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destinationAccountNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white font-mono">TRANSACTION LEDGER & STATEMENT</h2>
          <p className="text-xs text-slate-400">Searchable history with cryptographic tracking references</p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="/api/transactions/export/csv"
            download
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search reference, description, account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FLAGGED">FLAGGED</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="FAILED">FAILED</option>
            <option value="REVERSED">REVERSED</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-500">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="REVERSAL">REVERSAL</option>
            <option value="DEPOSIT">DEPOSIT</option>
          </select>
        </div>
      </div>

      {/* High-density Transaction Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Reference & Date</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">From &rarr; To</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Risk Score</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-200">{t.referenceId}</div>
                  <div className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  <div className="truncate max-w-[200px]">{t.description || 'Transfer'}</div>
                  {t.location && <div className="text-[10px] text-slate-500">{t.location}</div>}
                </td>
                <td className="py-3 px-4 text-slate-400 text-[11px]">
                  <div>Src: {t.sourceAccountNumber}</div>
                  <div>Dst: {t.destinationAccountNumber}</div>
                </td>
                <td className="py-3 px-4 text-right font-semibold text-slate-100">
                  ${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.riskScore >= 80 ? 'bg-rose-500/20 text-rose-300' :
                    t.riskScore >= 60 ? 'bg-amber-500/20 text-amber-300' :
                    t.riskScore >= 30 ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {t.riskScore}/100
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    t.status === 'FLAGGED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    t.status === 'BLOCKED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    t.status === 'REVERSED' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No transactions match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
