import React, { useState } from 'react';
import { Account, Transaction, TransferRequest } from '../../types';
import { api } from '../../services/api';
import { X, Send, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, Copy, Check, MapPin } from 'lucide-react';

interface MoneyTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onTransferSuccess: (txn: Transaction) => void;
}

const SIMULATED_LOCATIONS = [
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060, ip: '192.168.10.45' },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278, ip: '82.165.197.1' },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, ip: '133.242.18.2' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, ip: '118.189.20.1' },
  { name: 'Lagos, Nigeria', lat: 6.5244, lon: 3.3792, ip: '102.89.44.12' },
  { name: 'Zurich, Switzerland', lat: 47.3769, lon: 8.5417, ip: '193.134.25.9' }
];

export const MoneyTransferModal: React.FC<MoneyTransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onTransferSuccess,
}) => {
  const [step, setStep] = useState<'form' | 'review' | 'receipt'>('form');
  const [sourceAccountNumber, setSourceAccountNumber] = useState(accounts[0]?.accountNumber || '');
  const [destinationAccountNumber, setDestinationAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(SIMULATED_LOCATIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executedTxn, setExecutedTxn] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentSource = accounts.find(a => a.accountNumber === sourceAccountNumber) || accounts[0];

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please specify a positive transfer amount.');
      return;
    }
    if (!destinationAccountNumber.trim()) {
      setError('Recipient account number is required.');
      return;
    }
    if (destinationAccountNumber.trim() === sourceAccountNumber) {
      setError('Source and destination accounts must be distinct.');
      return;
    }
    setStep('review');
  };

  const handleConfirmTransfer = async () => {
    setIsSubmitting(true);
    setError(null);

    const payload: TransferRequest = {
      sourceAccountNumber,
      destinationAccountNumber: destinationAccountNumber.trim(),
      amount: parseFloat(amount),
      description: description.trim() || 'Direct Account Transfer',
      location: selectedLocation.name,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lon,
      ipAddress: selectedLocation.ip,
      deviceFingerprint: `dev-${navigator.userAgent.substring(0, 15)}`,
      idempotencyKey: `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    try {
      const result = await api.transfer(payload);
      setExecutedTxn(result);
      onTransferSuccess(result);
      setStep('receipt');
    } catch (err: any) {
      console.error('Transfer failed:', err);
      setError(err.message || 'Transfer failed. Check balance or risk engine triggers.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAndClose = () => {
    setStep('form');
    setAmount('');
    setDescription('');
    setDestinationAccountNumber('');
    setError(null);
    setExecutedTxn(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white font-mono">
              {step === 'form' && 'NEW MONEY TRANSFER'}
              {step === 'review' && 'REVIEW TRANSFER DETAILS'}
              {step === 'receipt' && 'TRANSACTION RECEIPT'}
            </h2>
          </div>
          <button
            onClick={resetAndClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: FORM INPUT */}
          {step === 'form' && (
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Source Account</label>
                <select
                  value={sourceAccountNumber}
                  onChange={(e) => setSourceAccountNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.accountNumber}>
                      {acc.accountType} - {acc.maskedAccountNumber} (${Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">Recipient Account Number</label>
                  <span className="text-[11px] text-slate-500 font-mono">Simulated format: SENT-XXXX-XXXX-XXXX</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. SENT-1000-2000-3000"
                  value={destinationAccountNumber}
                  onChange={(e) => setDestinationAccountNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                {currentSource && (
                  <div className="mt-1 text-[11px] text-slate-400 font-mono">
                    Available balance: ${Number(currentSource.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Consulting Invoice #412"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Simulated Geolocation Context */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-400" /> Simulated Device Telemetry Location
                </label>
                <select
                  value={selectedLocation.name}
                  onChange={(e) => {
                    const loc = SIMULATED_LOCATIONS.find(l => l.name === e.target.value);
                    if (loc) setSelectedLocation(loc);
                  }}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none"
                >
                  {SIMULATED_LOCATIONS.map(l => (
                    <option key={l.name} value={l.name}>
                      {l.name} (IP: {l.ip})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Tip: Change location rapidly between transfers to observe Rule 5 (Impossible Geolocation Velocity) trigger.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-lg shadow-blue-600/30"
                >
                  <span>Review Transfer Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW TRANSFER */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Debit Account</span>
                  <span className="text-slate-200">{sourceAccountNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Credit Account</span>
                  <span className="text-slate-200">{destinationAccountNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-bold text-sm">
                    ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Processing Fee</span>
                  <span className="text-emerald-400">$0.00 (Instant ACH/Wire)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Telemetry Location</span>
                  <span className="text-sky-300">{selectedLocation.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Memo</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{description || 'Direct Transfer'}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl text-[11px] text-sky-300/90 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Real-time Fraud Screening Activated
                </div>
                <p className="text-slate-400 text-[10px]">
                  This transaction will be evaluated in real time against velocity, geolocation, structuring, and balance thresholds.
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep('form')}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmTransfer}
                  className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>Authorize & Execute</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TRANSACTION RECEIPT */}
          {step === 'receipt' && executedTxn && (
            <div className="space-y-4">
              <div className="text-center py-3">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  executedTxn.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  executedTxn.status === 'FLAGGED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {executedTxn.status === 'COMPLETED' && <CheckCircle2 className="w-6 h-6" />}
                  {executedTxn.status === 'FLAGGED' && <AlertTriangle className="w-6 h-6" />}
                  {executedTxn.status === 'BLOCKED' && <ShieldAlert className="w-6 h-6" />}
                </div>

                <h3 className="text-base font-bold text-white font-mono">
                  {executedTxn.status === 'COMPLETED' && 'TRANSFER SUCCESSFUL'}
                  {executedTxn.status === 'FLAGGED' && 'HELD FOR MANUAL REVIEW'}
                  {executedTxn.status === 'BLOCKED' && 'TRANSFER BLOCKED'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {executedTxn.status === 'COMPLETED' && 'Balanced double-entry ledger records committed to database.'}
                  {executedTxn.status === 'FLAGGED' && 'Transaction flagged by behavioral rules; pending compliance clearance.'}
                  {executedTxn.status === 'BLOCKED' && 'Transaction rejected due to risk threshold breach.'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Reference ID</span>
                  <button
                    onClick={() => copyRef(executedTxn.referenceId)}
                    className="flex items-center space-x-1 text-slate-200 hover:text-white"
                  >
                    <span>{executedTxn.referenceId}</span>
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                  </button>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-bold">
                    ${Number(executedTxn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {executedTxn.currency}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Risk Assessment</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    executedTxn.riskScore >= 80 ? 'bg-rose-500/20 text-rose-300' :
                    executedTxn.riskScore >= 60 ? 'bg-amber-500/20 text-amber-300' :
                    executedTxn.riskScore >= 30 ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    SCORE: {executedTxn.riskScore}/100 ({executedTxn.riskLevel})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="text-slate-300">{new Date(executedTxn.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Ledger Status</span>
                  <span className="text-emerald-400 font-semibold">DOUBLE-ENTRY BALANCED</span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
              >
                Close Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
