import React, { useState, useMemo } from 'react';
import {
  FileText, ExternalLink, BookOpen, Binary, Cpu, BarChart3,
  CheckCircle2, ArrowRight, ShieldCheck, Copy, Check, Download
} from 'lucide-react';

interface HuffmanNode {
  char: string | null;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
}

const CASE_STUDY_URL = "https://ap.wps.com/cms/docs/d/cbCaehdc77wBATjy?platform=pc&refer=whatsapp";

export const CaseStudyView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [inputText, setInputText] = useState('SENTINEL_FINTECH_DOUBLE_ENTRY_LEDGER_TRANSACTION');

  const copyUrl = () => {
    navigator.clipboard.writeText(CASE_STUDY_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Interactive Huffman Coding Logic for interactive demonstration
  const huffmanStats = useMemo(() => {
    if (!inputText || inputText.length === 0) return null;

    // 1. Calculate frequencies
    const freqMap: Record<string, number> = {};
    for (const char of inputText) {
      freqMap[char] = (freqMap[char] || 0) + 1;
    }

    // 2. Build Min-Heap of Nodes
    const nodes: HuffmanNode[] = Object.entries(freqMap).map(([char, freq]) => ({
      char,
      freq,
      left: null,
      right: null,
    }));

    if (nodes.length === 1) {
      const codeMap: Record<string, string> = { [nodes[0].char!]: '0' };
      const originalBits = inputText.length * 8;
      const compressedBits = inputText.length;
      return {
        freqMap,
        codeMap,
        originalBits,
        compressedBits,
        savingsPercent: ((1 - compressedBits / originalBits) * 100).toFixed(1),
      };
    }

    // Min heap simulation
    const queue = [...nodes].sort((a, b) => a.freq - b.freq);
    while (queue.length > 1) {
      const left = queue.shift()!;
      const right = queue.shift()!;
      const parent: HuffmanNode = {
        char: null,
        freq: left.freq + right.freq,
        left,
        right,
      };
      queue.push(parent);
      queue.sort((a, b) => a.freq - b.freq);
    }

    const root = queue[0];
    const codeMap: Record<string, string> = {};

    const traverse = (node: HuffmanNode | null, currentCode: string) => {
      if (!node) return;
      if (node.char !== null) {
        codeMap[node.char] = currentCode || '0';
        return;
      }
      traverse(node.left, currentCode + '0');
      traverse(node.right, currentCode + '1');
    };

    traverse(root, '');

    const originalBits = inputText.length * 8;
    let compressedBits = 0;
    for (const char of inputText) {
      compressedBits += codeMap[char]?.length || 0;
    }

    const savings = originalBits > 0 ? ((1 - compressedBits / originalBits) * 100).toFixed(1) : '0';

    return {
      freqMap,
      codeMap,
      originalBits,
      compressedBits,
      savingsPercent: savings,
    };
  }, [inputText]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header & Call-to-Action Bar */}
      <div className="rounded-2xl bg-[#0C1222] border border-[#162038] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                ACADEMIC CASE STUDY DOSSIER
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-mono">
                Huffman_Coding_Case_Study.docx
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
              Huffman Coding & Algorithmic Data Compression
            </h1>

            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Comprehensive analysis of optimal prefix coding, greedy tree construction algorithms,
              information-theoretic entropy limits, and real-time payload compression in distributed banking systems.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={copyUrl}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-[#12192C] hover:bg-[#1A233C] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-mono transition-all"
              title="Copy Case Study Document Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copied Link!' : 'Copy Doc Link'}</span>
            </button>

            <a
              href={CASE_STUDY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all group"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>Open in WPS Docs</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Document Access Card & Embedded Viewer */}
      <div className="rounded-2xl bg-[#0C1222] border border-[#162038] overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-[#080D1A] border-b border-[#162038] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono">DOCUMENT PREVIEW & ACCESS</div>
              <div className="text-[11px] text-slate-400">WPS Cloud Document • Shared Online View</div>
            </div>
          </div>

          <a
            href={CASE_STUDY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:text-sky-300 font-mono flex items-center space-x-1"
          >
            <span>Direct Document Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Embedded Iframe Preview with Fallback Overlay */}
        <div className="relative w-full h-[580px] bg-[#070A13]">
          <iframe
            src={CASE_STUDY_URL}
            title="Huffman Coding Case Study Document"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />

          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#0C1222]/95 border border-[#1E293B] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Full Case Study Document:</span> If the cloud viewer requires login or preview is restricted by browser headers, click open to read the complete doc.
              </div>
            </div>
            <a
              href={CASE_STUDY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5"
            >
              <span>Launch Full Document</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Interactive Huffman Coding Simulator */}
      <div className="rounded-2xl bg-[#0C1222] border border-[#162038] p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#162038]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Binary className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">LIVE HUFFMAN ALGORITHM DEMONSTRATOR</h2>
              <p className="text-xs text-slate-400">Interactive optimal prefix encoding and payload compression computation</p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#162038] text-slate-300">
            Complexity: O(n log n)
          </span>
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-2">
            Sample Telemetry Payload / Text String to Compress:
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-[#070A13] border border-[#162038] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono focus:outline-none transition-colors"
            placeholder="Type payload or transaction log string..."
          />
        </div>

        {/* Compression Statistics Cards */}
        {huffmanStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#070A13] border border-[#162038]">
              <div className="text-[11px] text-slate-400 font-mono">Original Size (ASCII 8-bit)</div>
              <div className="text-2xl font-bold text-slate-200 font-mono mt-1">
                {huffmanStats.originalBits} <span className="text-xs text-slate-500">bits</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{inputText.length} characters × 8 bits</div>
            </div>

            <div className="p-4 rounded-xl bg-[#070A13] border border-[#162038]">
              <div className="text-[11px] text-slate-400 font-mono">Huffman Encoded Size</div>
              <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
                {huffmanStats.compressedBits} <span className="text-xs text-sky-600">bits</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Variable prefix bitcodes</div>
            </div>

            <div className="p-4 rounded-xl bg-[#070A13] border border-[#162038]">
              <div className="text-[11px] text-slate-400 font-mono">Compression Savings</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {huffmanStats.savingsPercent}%
              </div>
              <div className="text-[11px] text-emerald-500/80 mt-1">Reduction in payload footprint</div>
            </div>

            <div className="p-4 rounded-xl bg-[#070A13] border border-[#162038]">
              <div className="text-[11px] text-slate-400 font-mono">Unique Symbols</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {Object.keys(huffmanStats.freqMap).length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Distinct alphabet size</div>
            </div>
          </div>
        )}

        {/* Character Code Breakdown Table */}
        {huffmanStats && (
          <div>
            <h3 className="text-xs font-bold text-slate-300 font-mono mb-3 uppercase tracking-wider">
              Character Frequency & Huffman Prefix Table
            </h3>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-[#162038]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#070A13] text-slate-400 sticky top-0 border-b border-[#162038]">
                  <tr>
                    <th className="py-2.5 px-4">Character</th>
                    <th className="py-2.5 px-4">Frequency</th>
                    <th className="py-2.5 px-4">Huffman Code</th>
                    <th className="py-2.5 px-4">Code Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162038]/60 bg-[#0C1222]">
                  {Object.entries(huffmanStats.codeMap)
                    .sort((a, b) => (huffmanStats.freqMap[b[0]] || 0) - (huffmanStats.freqMap[a[0]] || 0))
                    .map(([char, code]) => (
                      <tr key={char} className="hover:bg-[#12192C]">
                        <td className="py-2 px-4 font-bold text-white">
                          {char === ' ' ? '<SPACE>' : char}
                        </td>
                        <td className="py-2 px-4 text-slate-300">{huffmanStats.freqMap[char]}</td>
                        <td className="py-2 px-4 text-emerald-400 font-mono">{code}</td>
                        <td className="py-2 px-4 text-slate-400">{code.length} bits</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4. Core Concepts & Architectural Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-[#0C1222] border border-[#162038] p-5 shadow-lg space-y-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">Greedy Min-Heap Tree</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Constructs an optimal binary tree bottom-up by repeatedly extracting the two lowest frequency
            nodes from a priority queue in O(log n) time per step.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0C1222] border border-[#162038] p-5 shadow-lg space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">Prefix-Free Property</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No code is a prefix of another code. This ensures deterministic, unambiguous real-time decoding
            without requiring separators or framing markers.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0C1222] border border-[#162038] p-5 shadow-lg space-y-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">Fintech Telemetry Impact</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Reduces network transmission bandwidth for transactional outbox streaming and immutable audit trail
            archiving by up to 40–60% with zero information loss.
          </p>
        </div>
      </div>
    </div>
  );
};
