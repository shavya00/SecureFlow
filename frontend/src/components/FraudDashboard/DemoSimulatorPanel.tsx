import React, { useState } from 'react';
import { api } from '../../services/api';
import { Zap, Play, CheckCircle2, ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

interface DemoSimulatorPanelProps {
  onScenarioTriggered: () => void;
}

export const DemoSimulatorPanel: React.FC<DemoSimulatorPanelProps> = ({ onScenarioTriggered }) => {
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any | null>(null);

  const runScenario = async (
    key: 'large-amount' | 'rapid-burst' | 'impossible-velocity' | 'structuring',
    title: string
  ) => {
    setRunningScenario(key);
    setLastResult(null);
    try {
      const res = await api.triggerDemo(key);
      setLastResult({ scenario: title, data: res });
      onScenarioTriggered();
    } catch (err: any) {
      setLastResult({ scenario: title, error: err.message });
    } finally {
      setRunningScenario(null);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl space-y-5">
      <div className="flex items-center space-x-2">
        <Zap className="w-5 h-5 text-amber-400" />
        <div>
          <h2 className="text-base font-semibold text-white font-mono">FRAUD ATTACK SIMULATOR &amp; SCENARIO TRIGGER</h2>
          <p className="text-xs text-slate-400">Trigger simulated threat vectors to demonstrate the Java rule evaluation engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        {/* Scenario 1 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase">RULE 1 SCENARIO</span>
            <h3 className="font-bold text-white text-sm mt-0.5">High-Value Spike ($35,000)</h3>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Triggers single-transaction threshold breach of $10,000.
            </p>
          </div>
          <button
            disabled={runningScenario !== null}
            onClick={() => runScenario('large-amount', 'Unusually Large Transfer')}
            className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center space-x-1.5 transition-colors font-semibold"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{runningScenario === 'large-amount' ? 'Firing...' : 'Fire Spike'}</span>
          </button>
        </div>

        {/* Scenario 2 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] text-rose-400 font-bold uppercase">RULE 2 SCENARIO</span>
            <h3 className="font-bold text-white text-sm mt-0.5">Rapid Velocity Burst</h3>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Fires 4 rapid transfers in 5 seconds to breach velocity limit.
            </p>
          </div>
          <button
            disabled={runningScenario !== null}
            onClick={() => runScenario('rapid-burst', 'Rapid Burst Transactions')}
            className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center space-x-1.5 transition-colors font-semibold"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{runningScenario === 'rapid-burst' ? 'Executing...' : 'Fire Burst'}</span>
          </button>
        </div>

        {/* Scenario 3 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] text-sky-400 font-bold uppercase">RULE 5 SCENARIO</span>
            <h3 className="font-bold text-white text-sm mt-0.5">Impossible Travel Velocity</h3>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Initiates transfer in Singapore 30s after New York transaction.
            </p>
          </div>
          <button
            disabled={runningScenario !== null}
            onClick={() => runScenario('impossible-velocity', 'Impossible Velocity Jump')}
            className="w-full py-2 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center justify-center space-x-1.5 transition-colors font-semibold"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{runningScenario === 'impossible-velocity' ? 'Simulating...' : 'Fire Geo-Jump'}</span>
          </button>
        </div>

        {/* Scenario 4 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] text-purple-400 font-bold uppercase">RULE 7 SCENARIO</span>
            <h3 className="font-bold text-white text-sm mt-0.5">Structuring ($9,650)</h3>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Detects calibrated pattern designed just below $10k reporting limit.
            </p>
          </div>
          <button
            disabled={runningScenario !== null}
            onClick={() => runScenario('structuring', 'Structuring Smurfing Tranche')}
            className="w-full py-2 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center space-x-1.5 transition-colors font-semibold"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{runningScenario === 'structuring' ? 'Emitting...' : 'Fire Structuring'}</span>
          </button>
        </div>
      </div>

      {/* Result Card */}
      {lastResult && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 font-mono text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Scenario Result: {lastResult.scenario}
            </span>
            <span className="text-slate-400 text-[10px]">Triggered via REST API</span>
          </div>
          <pre className="p-3 bg-black/60 rounded-lg text-slate-300 overflow-x-auto text-[11px]">
            {JSON.stringify(lastResult.data || lastResult.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
