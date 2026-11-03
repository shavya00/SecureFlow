import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { FraudMonitoringView } from './components/FraudMonitoringView';
import { AccountsView } from './components/AccountsView';
import { TransactionHistory } from './components/CustomerPortal/TransactionHistory';
import { AccountManagement } from './components/CustomerPortal/AccountManagement';
import { MoneyTransferModal } from './components/CustomerPortal/MoneyTransferModal';
import { FraudAlertCenter } from './components/FraudDashboard/FraudAlertCenter';
import { LiveTransactionMonitoring } from './components/FraudDashboard/LiveTransactionMonitoring';
import { FraudRulesAdmin } from './components/FraudDashboard/FraudRulesAdmin';
import { DemoSimulatorPanel } from './components/FraudDashboard/DemoSimulatorPanel';
import { AlertInvestigationModal } from './components/FraudDashboard/AlertInvestigationModal';
import { CaseStudyView } from './components/CaseStudyView';
import { api } from './services/api';
import { Transaction, FraudAlert, FraudRule, DashboardOverview, Account } from './types';
import { CheckCircle2, AlertCircle, ShieldAlert, X, Plus, Send } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, accounts, refreshAccounts } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [inspectedTxn, setInspectedTxn] = useState<Transaction | null>(null);

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [allSystemAccounts, setAllSystemAccounts] = useState<Account[]>([]);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'warn' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'warn' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const loadData = async () => {
    try {
      const [txnsData, alertsData, rulesData, overviewData, logsData, allAccs] = await Promise.all([
        api.getMyTransactions(0, 50).catch(() => ({ content: [] })),
        api.getFraudAlerts(0, 50).catch(() => ({ content: [] })),
        api.getFraudRules().catch(() => []),
        api.getDashboardOverview().catch(() => null),
        api.getAuditLogs(0, 30).catch(() => ({ content: [] })),
        api.getAllAccounts().catch(() => []),
      ]);

      setTransactions(txnsData.content || []);
      setAlerts(alertsData.content || []);
      setRules(rulesData || []);
      setOverview(overviewData);
      setAuditLogs(logsData.content || []);
      if (allAccs && allAccs.length > 0) {
        setAllSystemAccounts(allAccs);
      }
      refreshAccounts();
    } catch (err: any) {
      console.warn('Live sync note:', err.message);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleTransferSuccess = (txn: Transaction) => {
    if (txn.status === 'COMPLETED') {
      showToast('success', `Transfer of $${Number(txn.amount).toLocaleString()} settled in double-entry ledger.`);
    } else if (txn.status === 'FLAGGED') {
      showToast('warn', `Transfer held for compliance review. Risk score: ${txn.riskScore}/100.`);
    }
    loadData();
  };

  return (
    <div className="flex h-screen bg-[#060913] text-slate-100 overflow-hidden font-sans">
      {/* 1. Left Sidebar matching target design */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <TopHeader
          onOpenNotifications={() => setActiveTab('fraud-monitoring')}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-200">
            <div className={`p-4 rounded-xl border shadow-2xl font-mono text-xs flex items-center space-x-3 ${
              toastMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' :
              toastMessage.type === 'warn' ? 'bg-amber-950/90 border-amber-500/40 text-amber-200' :
              'bg-rose-950/90 border-rose-500/40 text-rose-200'
            }`}>
              {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toastMessage.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
              {toastMessage.type === 'error' && <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{toastMessage.text}</span>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white pl-2">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Viewport Content */}
        <main className="p-6 sm:p-8 flex-1">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setActiveTab}
              onOpenTransfer={() => setIsTransferModalOpen(true)}
              overview={overview}
              accounts={accounts}
              transactions={transactions}
              alerts={alerts}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              accounts={accounts}
              onRefresh={loadData}
              onOpenTransfer={() => setIsTransferModalOpen(true)}
            />
          )}

          {activeTab === 'fraud-monitoring' && (
            <FraudMonitoringView
              alerts={alerts}
              transactions={transactions}
              onRefresh={loadData}
              onOpenInvestigation={(alert) => setSelectedAlert(alert)}
              onTriggerScenario={async (scenarioType) => {
                const typeMap: Record<string, 'large-amount' | 'rapid-burst' | 'impossible-velocity' | 'structuring'> = {
                  rapid: 'rapid-burst',
                  large: 'large-amount',
                  velocity: 'impossible-velocity',
                  structuring: 'structuring'
                };
                const scenario = typeMap[scenarioType] || 'rapid-burst';
                try {
                  await api.triggerDemo(scenario);
                  await loadData();
                  showToast('warn', `Simulated threat vector (${scenario}) processed by Java Fraud Engine.`);
                } catch (e: any) {
                  showToast('error', `Failed to trigger scenario: ${e.message}`);
                }
              }}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsView
              accounts={allSystemAccounts.length > 0 ? allSystemAccounts : accounts}
              onRefresh={loadData}
              onOpenTransfer={() => setIsTransferModalOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <DashboardView
                onNavigateTab={setActiveTab}
                onOpenTransfer={() => setIsTransferModalOpen(true)}
                overview={overview}
                accounts={accounts}
                transactions={transactions}
                alerts={alerts}
                onRefresh={loadData}
              />
            </div>
          )}

          {activeTab === 'audit-logs' && (
            <div className="max-w-7xl mx-auto rounded-2xl bg-[#0C1222] border border-[#162038] p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white font-mono">IMMUTABLE SYSTEM AUDIT TRAIL</h2>
                  <p className="text-xs text-slate-400">Cryptographic audit log of user logins, transfers, and security events</p>
                </div>
                <button onClick={loadData} className="text-xs font-mono text-sky-400 hover:text-sky-300">
                  Refresh Logs
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#162038]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#070A13] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#162038]">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Entity Type</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4 text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162038]/60 bg-[#0C1222]">
                    {auditLogs.map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-[#12192C] transition-colors">
                        <td className="py-3 px-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4 font-semibold text-white">{log.action}</td>
                        <td className="py-3 px-4 text-sky-400">{log.entityType}</td>
                        <td className="py-3 px-4 text-slate-300 truncate max-w-[280px]">{log.details}</td>
                        <td className="py-3 px-4 text-right text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No audit logs recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'case-study' && (
            <CaseStudyView />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-7xl mx-auto space-y-4">
              <FraudRulesAdmin rules={rules} onRefresh={loadData} />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <MoneyTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onTransferSuccess={handleTransferSuccess}
      />

      <AlertInvestigationModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAlertUpdated={() => {
          loadData();
          showToast('success', 'Fraud alert adjudication recorded and synced to database.');
          if (selectedAlert) {
            api.getFraudAlertById(selectedAlert.id).then(setSelectedAlert).catch(() => setSelectedAlert(null));
          }
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
