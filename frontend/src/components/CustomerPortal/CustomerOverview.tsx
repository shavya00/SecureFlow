import React, { useState } from 'react';
import { Account, Transaction } from '../../types';
import { Landmark, ArrowUpRight, ArrowDownLeft, ShieldCheck, Eye, EyeOff, Plus, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface CustomerOverviewProps {
  accounts: Account[];
  recentTransactions: Transaction[];
  onOpenTransfer: () => void;
  onRefresh: () => void;
  onViewHistory: () => void;
}

export const CustomerOverview: React.FC<CustomerOverviewProps> = ({
  accounts,
  recentTransactions,
  onOpenTransfer,
  onRefresh,
  onViewHistory,
}) => {
  const [showMasked, setShowMasked] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const checkingAccount = accounts.find(a => a.accountType === 'CHECKING') || accounts[0];
  const savingsAccount = accounts.find(a => a.accountType === 'SAVINGS');

  const monthlyActivityData = [
    { day: 'Mon', income: 3500, expense: 450 },
    { day: 'Tue', income: 0, expense: 1200 },
    { day: 'Wed', income: 1500, expense: 320 },
    { day: 'Thu', income: 800, expense: 640 },
    { day: 'Fri', income: 4200, expense: 1100 },
    { day: 'Sat', income: 0, expense: 280 },
    { day: 'Sun', income: 0, expense: 150 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Total Net Worth & Account Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Liquid Balance</span>
              <button
                onClick={() => setShowMasked(!showMasked)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                title="Toggle privacy masking"
              >
                {showMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> FDIC INSURED / ATOMIC
            </span>
          </div>

          <div className="flex items-baseline space-x-3 mb-6">
            <h1 className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <span className="text-sm font-mono text-slate-400">USD</span>
          </div>

          {/* Sub-account Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            {checkingAccount && (
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Primary Checking</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {showMasked ? checkingAccount.accountNumber : checkingAccount.maskedAccountNumber}
                  </span>
                </div>
                <div className="text-xl font-mono font-semibold text-slate-100">
                  ${checkingAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}

            {savingsAccount ? (
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">High-Yield Treasury / Savings</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {showMasked ? savingsAccount.accountNumber : savingsAccount.maskedAccountNumber}
                  </span>
                </div>
                <div className="text-xl font-mono font-semibold text-sky-400">
                  ${savingsAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 p-3.5 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                Secondary Savings Account Configured
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Financial Controls</h2>
            <p className="text-xs text-slate-400 mb-6">Send funds securely with real-time velocity screening.</p>

            <button
              onClick={onOpenTransfer}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Initiate Money Transfer</span>
            </button>
          </div>

          <div className="space-y-2 pt-6 border-t border-slate-800">
            <a
              href="/api/transactions/export/csv"
              download
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Statement (CSV)</span>
            </a>

            <button
              onClick={onRefresh}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Account Balances</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics: Income vs Expense & Spending Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Weekly Cashflow Dynamics</h3>
              <p className="text-xs text-slate-400">Inflows vs Outflows processed through ledger</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Outflow
              </span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List in Overview */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
                <p className="text-xs text-slate-400">Verified through double-entry accounting</p>
              </div>
              <button
                onClick={onViewHistory}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                View Complete History &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map(txn => {
                const isOutflow = txn.type === 'TRANSFER' && txn.sourceAccountNumber === checkingAccount?.accountNumber;
                return (
                  <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isOutflow ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {isOutflow ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-200 line-clamp-1">{txn.description || 'Transfer'}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {new Date(txn.createdAt).toLocaleDateString()} &bull; {txn.referenceId}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-mono font-semibold ${isOutflow ? 'text-slate-200' : 'text-emerald-400'}`}>
                        {isOutflow ? '-' : '+'}${Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        txn.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        txn.status === 'FLAGGED' ? 'bg-amber-500/10 text-amber-400' :
                        txn.status === 'BLOCKED' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                );
              })}

              {recentTransactions.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No recent transactions recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
