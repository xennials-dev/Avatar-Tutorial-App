import React from 'react';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Video,
  Cpu,
  Users,
  FolderKanban,
  Sparkles,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  providerCount?: number;
}

const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'generator', label: 'Tutorial Agent', icon: <Sparkles size={16} /> },
  { id: 'models', label: 'Model Router', icon: <Cpu size={16} />, badge: '4+' },
  { id: 'avatars', label: 'Avatar Studio', icon: <Users size={16} /> },
  { id: 'projects', label: 'Projects', icon: <FolderKanban size={16} /> },
  { id: 'automation', label: 'Batch VEO', icon: <Zap size={16} /> },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 group text-left cursor-pointer transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#09090b] rounded-[11px] flex items-center justify-center">
                <Video size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-tight text-white">XENNIALS</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Automation
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 tracking-wider">MULTI-MODEL TUTORIAL SUITE</p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-2xl border border-white/[0.06]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isAutomation = item.id === 'automation';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? isAutomation
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Router Live Status & Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('models')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors cursor-pointer"
              title="Open Model Router Gateway"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300">ModelScope / HF Online</span>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles size={14} className="text-indigo-200" />
              <span>Create Tutorial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-white/[0.04] overflow-x-auto gap-2 bg-[#09090b]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
              activeTab === item.id
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
