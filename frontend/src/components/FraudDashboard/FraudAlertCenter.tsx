import React, { useState } from 'react';
import { FraudAlert, AlertStatus, AlertSeverity } from '../../types';
import { api } from '../../services/api';
import { ShieldAlert, AlertTriangle, CheckCircle, Search, RefreshCw, Eye, MessageSquare, Check, X, ShieldX } from 'lucide-react';

interface FraudAlertCenterProps {
  alerts: FraudAlert[];
  onRefresh: () => void;
  onOpenInvestigation: (alert: FraudAlert) => void;
}

export const FraudAlertCenter: React.FC<FraudAlertCenterProps> = ({
  alerts,
  onRefresh,
  onOpenInvestigation,
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = alerts.filter(a => {
    const matchesSearch =
      a.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.customerAccountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleQuickStatus = async (alertId: string, status: AlertStatus, note: string) => {
    setActionLoading(alertId);
    try {
      await api.resolveAlert(alertId, status, note);
      onRefresh();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-semibold text-white font-mono">FRAUD ALERT INTELLIGENCE & TRIAGE CENTER</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Automated detection triage queue with investigator state machine</p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search alert, reference, rule..."
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
            <option value="NEW">NEW</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="CONFIRMED_FRAUD">CONFIRMED_FRAUD</option>
            <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-500">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filtered.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border transition-all ${
              alert.status === 'NEW'
                ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                : 'bg-slate-900/40 border-slate-800/60'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    {alert.severity}
                  </span>

                  <span className="font-mono text-xs font-bold text-white">{alert.category}</span>
                  <span className="text-[11px] font-mono text-slate-500">Txn: {alert.referenceId}</span>
                </div>

                <div className="text-xs text-slate-300 font-mono leading-relaxed">
                  {alert.reason}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400 pt-1">
                  <span>Customer: <strong className="text-slate-200">{alert.customerName}</strong> ({alert.customerAccountNumber})</span>
                  <span>Amount: <strong className="text-white">${Number(alert.transactionAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
                  <span>Detected: {new Date(alert.createdAt).toLocaleString()}</span>
                  {alert.investigatedByName && (
                    <span>Assigned: <strong className="text-sky-300">{alert.investigatedByName}</strong></span>
                  )}
                </div>
              </div>

              {/* Status & Actions Column */}
              <div className="flex flex-col items-end space-y-2 shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-rose-400">Score: {alert.riskScore}/100</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    alert.status === 'NEW' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    alert.status === 'INVESTIGATING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    alert.status === 'CONFIRMED_FRAUD' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    alert.status === 'FALSE_POSITIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {alert.status}
                  </span>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center space-x-1.5 pt-1">
                  <button
                    onClick={() => onOpenInvestigation(alert)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-mono transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Dossier</span>
                  </button>

                  {alert.status === 'NEW' && (
                    <button
                      disabled={actionLoading === alert.id}
                      onClick={() => handleQuickStatus(alert.id, 'INVESTIGATING', 'Investigation initiated by analyst')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                    >
                      Investigate
                    </button>
                  )}

                  {alert.status !== 'CONFIRMED_FRAUD' && (
                    <button
                      disabled={actionLoading === alert.id}
                      onClick={() => handleQuickStatus(alert.id, 'CONFIRMED_FRAUD', 'Confirmed fraudulent behavior')}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-mono transition-colors"
                      title="Confirm Fraud"
                    >
                      <ShieldX className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {alert.status !== 'FALSE_POSITIVE' && (
                    <button
                      disabled={actionLoading === alert.id}
                      onClick={() => handleQuickStatus(alert.id, 'FALSE_POSITIVE', 'Verified legitimate user behavior')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono transition-colors"
                      title="Mark False Positive"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs font-mono text-slate-500">
            No fraud alerts currently match the filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
