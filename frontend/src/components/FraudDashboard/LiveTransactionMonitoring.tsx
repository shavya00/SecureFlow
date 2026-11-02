import React, { useState } from 'react';
import { Transaction } from '../../types';
import { api } from '../../services/api';
import { Search, RotateCcw, AlertTriangle, ShieldCheck, Eye, MapPin, CheckCircle, RefreshCw, X } from 'lucide-react';

interface LiveTransactionMonitoringProps {
  transactions: Transaction[];
  onRefresh: () => void;
  onInspect: (txn: Transaction) => void;
}

export const LiveTransactionMonitoring: React.FC<LiveTransactionMonitoringProps> = ({
  transactions,
  onRefresh,
  onInspect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minScore, setMinScore] = useState(0);

  // Reversal State
  const [reversingTxn, setReversingTxn] = useState<Transaction | null>(null);
  const [reversalReason, setReversalReason] = useState('Analyst confirmed fraudulent activity');
  const [isReversing, setIsReversing] = useState(false);
  const [reversalSuccess, setReversalSuccess] = useState<string | null>(null);

  const filtered = transactions.filter(t => {
    const matchesSearch =
      t.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceAccountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destinationAccountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.sourceOwnerName && t.sourceOwnerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesScore = t.riskScore >= minScore;

    return matchesSearch && matchesStatus && matchesScore;
  });

  const handleExecuteReversal = async () => {
    if (!reversingTxn) return;
    setIsReversing(true);
    try {
      await api.reverseTransaction(reversingTxn.id, reversalReason);
      setReversalSuccess(`Transaction ${reversingTxn.referenceId} reversed successfully with compensating double-entry ledger entries.`);
      setReversingTxn(null);
      onRefresh();
      setTimeout(() => setReversalSuccess(null), 5000);
    } catch (err: any) {
      alert(`Reversal failed: ${err.message}`);
    } finally {
      setIsReversing(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-base font-semibold text-white font-mono">LIVE TRANSACTION MONITORING & AUDIT STREAM</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time inspection of inbound and settled transfers across all accounts</p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {reversalSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{reversalSuccess}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search reference, account, party..."
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
            <option value="REVERSED">REVERSED</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-500">Min Risk:</span>
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none"
          >
            <option value={0}>All Scores (0+)</option>
            <option value={30}>Medium Risk (30+)</option>
            <option value={60}>High Risk (60+)</option>
            <option value={80}>Critical Only (80+)</option>
          </select>
        </div>
      </div>

      {/* High-density monitoring table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Txn ID / Timestamp</th>
              <th className="py-3 px-4">Sender &rarr; Receiver</th>
              <th className="py-3 px-4">Telemetry Location</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Risk Score</th>
              <th className="py-3 px-4 text-center">Txn Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-200">{t.referenceId}</div>
                  <div className="text-[10px] text-slate-500">{new Date(t.createdAt).toLocaleTimeString()} &bull; {new Date(t.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="py-3 px-4 text-[11px]">
                  <div className="text-slate-300 font-medium truncate max-w-[180px]">{t.sourceOwnerName} ({t.sourceAccountNumber})</div>
                  <div className="text-slate-500 truncate max-w-[180px]">&rarr; {t.destinationOwnerName} ({t.destinationAccountNumber})</div>
                </td>
                <td className="py-3 px-4 text-slate-400 text-[11px]">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                    <span>{t.location || 'Local Gateway'}</span>
                  </div>
                  {t.ipAddress && <div className="text-[10px] text-slate-500 ml-4">{t.ipAddress}</div>}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-100">
                  ${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.riskScore >= 80 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    t.riskScore >= 60 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    t.riskScore >= 30 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {t.riskScore}/100
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
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
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    onClick={() => onInspect(t)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Inspect Risk Breakdown"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {t.status === 'COMPLETED' && (
                    <button
                      onClick={() => setReversingTxn(t)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                      title="Compensating Ledger Reversal"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Administrative Reversal Confirmation Modal */}
      {reversingTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-rose-400">
                <RotateCcw className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white">CONFIRM COMPENSATING REVERSAL</h3>
              </div>
              <button onClick={() => setReversingTxn(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              This action will reverse ${Number(reversingTxn.amount).toLocaleString()} for txn{' '}
              <span className="text-white font-bold">{reversingTxn.referenceId}</span> by generating balanced compensating double-entry ledger entries.
            </p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Administrative Audit Reason</label>
              <input
                type="text"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setReversingTxn(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isReversing}
                onClick={handleExecuteReversal}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center justify-center space-x-2"
              >
                {isReversing ? 'Processing...' : 'Execute Reversal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
