import React, { useState } from 'react';
import { FraudRule, RuleAction } from '../../types';
import { api } from '../../services/api';
import { Sliders, Check, RefreshCw, AlertCircle, Save } from 'lucide-react';

interface FraudRulesAdminProps {
  rules: FraudRule[];
  onRefresh: () => void;
}

export const FraudRulesAdmin: React.FC<FraudRulesAdminProps> = ({ rules, onRefresh }) => {
  const [editingRule, setEditingRule] = useState<FraudRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleToggleEnable = async (rule: FraudRule) => {
    try {
      await api.updateFraudRule(rule.id, { enabled: !rule.enabled });
      onRefresh();
    } catch (err: any) {
      alert(`Failed to update rule state: ${err.message}`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRule) return;
    setIsSaving(true);
    try {
      await api.updateFraudRule(editingRule.id, editingRule);
      setSaveSuccess(`Rule ${editingRule.ruleCode} parameters saved successfully.`);
      setEditingRule(null);
      onRefresh();
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-semibold text-white font-mono">FRAUD DETECTION RULE POLICIES & WEIGHT SCORING</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure risk thresholds, scoring weights, time windows, and mitigation actions
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Policies</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-300 flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Rules Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Rule Code &amp; Name</th>
              <th className="py-3 px-4">Threshold Parameter</th>
              <th className="py-3 px-4 text-center">Weight</th>
              <th className="py-3 px-4 text-center">Window</th>
              <th className="py-3 px-4 text-center">Action</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {rules.map(rule => (
              <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-200">{rule.ruleName}</div>
                  <div className="text-[10px] text-slate-500">{rule.ruleCode}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{rule.description}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-1 rounded bg-slate-800 text-sky-300 font-bold">
                    {rule.thresholdValue}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                  +{rule.weightScore} pts
                </td>
                <td className="py-3.5 px-4 text-center text-slate-400">
                  {rule.timeWindowSeconds > 0 ? `${rule.timeWindowSeconds}s` : 'Per-Txn'}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rule.action === 'BLOCK' ? 'bg-rose-500/20 text-rose-300' :
                    rule.action === 'HOLD' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {rule.action}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => handleToggleEnable(rule)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                      rule.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setEditingRule({ ...rule })}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    Configure
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inline Configuration Drawer / Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">CONFIGURE RULE: {editingRule.ruleCode}</h3>
              <button onClick={() => setEditingRule(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Threshold Parameter Value</label>
              <input
                type="text"
                value={editingRule.thresholdValue}
                onChange={(e) => setEditingRule({ ...editingRule, thresholdValue: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Risk Weight (Points 1-50)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editingRule.weightScore}
                  onChange={(e) => setEditingRule({ ...editingRule, weightScore: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Time Window (Seconds)</label>
                <input
                  type="number"
                  min="0"
                  value={editingRule.timeWindowSeconds}
                  onChange={(e) => setEditingRule({ ...editingRule, timeWindowSeconds: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Trigger Action</label>
              <select
                value={editingRule.action}
                onChange={(e) => setEditingRule({ ...editingRule, action: e.target.value as RuleAction })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="FLAG">FLAG (Hold for Analyst Review)</option>
                <option value="BLOCK">BLOCK (Immediate Interception)</option>
                <option value="HOLD">HOLD (Security Verification)</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEdit}
                className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Parameters'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
