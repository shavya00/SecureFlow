import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Radio, FileText, ExternalLink } from 'lucide-react';

interface TopHeaderProps {
  onSearch?: (term: string) => void;
  onOpenNotifications?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onSearch, onOpenNotifications }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState('Apr 25, 2025 • 14:37 UTC');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[now.getUTCMonth()];
      const day = now.getUTCDate();
      const year = now.getUTCFullYear();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      setCurrentTime(`${month} ${day}, ${year} • ${hours}:${minutes} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const initials = user
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'JD';

  return (
    <header className="h-16 px-6 border-b border-[#141C30] bg-[#070A13]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar matching screenshot */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transactions, accounts, or alerts..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full bg-[#0C1222] border border-[#162038] hover:border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-12 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none transition-colors"
          />
          <div className="absolute right-3 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#162038] border border-slate-700 text-[10px] font-mono text-slate-400">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls matching screenshot */}
      <div className="flex items-center space-x-4 pl-4">
        {/* Case Study Fast Action Link */}
        <a
          href="https://ap.wps.com/cms/docs/d/cbCaehdc77wBATjy?platform=pc&refer=whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-medium transition-all group shadow-sm"
          title="Open Huffman Coding Case Study in WPS Docs"
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Case Study</span>
          <ExternalLink className="w-3 h-3 text-amber-400/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>

        {/* Live Clock with Live Green Tag */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span>{currentTime}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>

        {/* Notification Bell with Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-400 hover:text-white transition-colors"
          title="3 Unread Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-[#070A13]">
            3
          </span>
        </button>

        {/* User Avatar Circle */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-500/30 shadow-md">
          {initials}
        </div>
      </div>
    </header>
  );
};
