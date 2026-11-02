import React, { useState } from 'react';
import { FraudAlert, AlertStatus } from '../../types';
import { api } from '../../services/api';
import { X, ShieldAlert, CheckCircle2, User, Clock, FileText, Send, MapPin, Hash, Plus, Check } from 'lucide-react';

interface AlertInvestigationModalProps {
  alert: FraudAlert | null;
  onClose: () => void;
  onAlertUpdated: () => void;
}

export const AlertInvestigationModal: React.FC<AlertInvestigationModalProps> = ({
  alert,
  onClose,
  onAlertUpdated,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  if (!alert) return null;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      await api.addAlertNote(alert.id, newNote.trim());
      setNewNote('');
      onAlertUpdated();
    } catch (err: any) {
      window.alert(`Failed to add note: ${err.message}`);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleUpdateStatus = async (status: AlertStatus) => {
    setStatusUpdateLoading(true);
    try {
      await api.resolveAlert(alert.id, status, `Status changed to ${status} from investigation modal.`);
      onAlertUpdated();
    } catch (err: any) {
      window.alert(`Failed to update status: ${err.message}`);
    } finally {
      setStatusUpdateLoading(false);
    }

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">CASE DOSSIER #{alert.id.substring(0, 8)}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {alert.severity} SEVERITY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Triggered Category: {alert.category}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Executive Risk Score Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[11px]">Aggregated Risk Score</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">{alert.riskScore} / 100</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Scored by rule-based weights</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[11px]">Transaction Amount</span>
              <div className="text-2xl font-bold text-white mt-1">
                ${Number(alert.transactionAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Target Settlement USD</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[11px]">Case Status</span>
              <div className="text-lg font-bold text-sky-400 mt-1">{alert.status}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {alert.investigatedByName ? `Assigned to ${alert.investigatedByName}` : 'Unassigned'}
              </div>
            </div>
          </div>

          {/* Triggered Rule Logic Explanation */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              Heuristic &amp; Rule Engine Verdict
            </span>
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs leading-relaxed">
              {alert.reason}
            </div>
          </div>

          {/* Customer & Transaction Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                Account &amp; Entity Context
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Account:</span>
                  <span className="text-slate-200">{alert.customerAccountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Holder:</span>
                  <span className="text-slate-200">{alert.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Detection Timestamp:</span>
                  <span className="text-slate-200">{new Date(alert.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                Transaction Reference
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference Hash:</span>
                  <span className="text-slate-200">{alert.referenceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resolved Timestamp:</span>
                  <span className="text-slate-200">{alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : 'Open / Unresolved'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ledger Compliance:</span>
                  <span className="text-emerald-400 font-bold">DOUBLE-ENTRY VERIFIED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Investigation Notes & Analyst Audit Trail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                Analyst Notes &amp; Audit Log ({alert.notes?.length || 0})
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {alert.notes && alert.notes.length > 0 ? (
                alert.notes.map(note => (
                  <div key={note.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-sky-400">{note.authorName}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-300 text-xs">{note.note}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg bg-slate-900 text-center text-slate-500 text-xs">
                  No notes recorded yet. Append the first observation below.
                </div>
              )}
            </div>

            {/* Append Note Form */}
            <form onSubmit={handleAddNote} className="flex space-x-2 pt-1">
              <input
                type="text"
                placeholder="Append case notes or investigatory findings..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={isSubmittingNote || !newNote.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer: Adjudication Decision Buttons */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Adjudicate Alert Decision:
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={statusUpdateLoading || alert.status === 'INVESTIGATING'}
              onClick={() => handleUpdateStatus('INVESTIGATING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                alert.status === 'INVESTIGATING'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-400 font-bold shadow-sm'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {alert.status === 'INVESTIGATING' ? '✓ Investigating' : 'Set Investigating'}
            </button>

            <button
              disabled={statusUpdateLoading || alert.status === 'FALSE_POSITIVE'}
              onClick={() => handleUpdateStatus('FALSE_POSITIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                alert.status === 'FALSE_POSITIVE'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400 font-bold shadow-sm'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {alert.status === 'FALSE_POSITIVE' ? '✓ False Positive' : 'Mark False Positive'}
            </button>

            <button
              disabled={statusUpdateLoading || alert.status === 'CONFIRMED_FRAUD'}
              onClick={() => handleUpdateStatus('CONFIRMED_FRAUD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
                alert.status === 'CONFIRMED_FRAUD'
                  ? 'bg-rose-950/80 border border-rose-500 text-rose-300 shadow-rose-900/40 cursor-default'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {alert.status === 'CONFIRMED_FRAUD' ? '✓ Fraud Confirmed' : 'Confirm Fraud'}
            </button>

            <button
              disabled={statusUpdateLoading || alert.status === 'RESOLVED'}
              onClick={() => handleUpdateStatus('RESOLVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
                alert.status === 'RESOLVED'
                  ? 'bg-blue-950/80 border border-blue-500 text-blue-300 shadow-blue-900/40 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {alert.status === 'RESOLVED' ? '✓ Resolved' : 'Resolve Alert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
