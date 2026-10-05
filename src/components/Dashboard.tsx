import React from 'react';
import { ActiveTab, TutorialProject } from '../types';
import {
  Sparkles,
  Video,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  Zap,
  Bot,
  ShieldCheck,
  Server,
  Globe,
  Terminal,
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  projects: TutorialProject[];
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, projects }) => {
  const stats = [
    {
      label: 'Rendered Tutorials',
      value: String(projects.length),
      sub: 'Autonomous Production',
      icon: <Video size={18} className="text-indigo-400" />,
    },
    {
      label: 'Model Routers',
      value: '4+',
      sub: 'ModelScope, HF, Local',
      icon: <Cpu size={18} className="text-emerald-400" />,
    },
    {
      label: 'Avg Blueprint Latency',
      value: '1.2s',
      sub: 'Streaming Token Pipeline',
      icon: <Clock size={18} className="text-amber-400" />,
    },
    {
      label: 'Inference Cost',
      value: '$0.00',
      sub: 'Free Tier & Local Daemon',
      icon: <Layers size={18} className="text-purple-400" />,
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-zinc-900 to-black border border-white/[0.08] p-8 sm:p-12 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
            <Bot size={14} className="text-indigo-400" />
            <span>XENNIALS AUTOMATION V4.2 • MULTI-MODEL ROUTER</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Turn Tech Documentation Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-purple-400">
              Viral AI Tutorial Videos
            </span>
          </h1>

          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            Autonomous tutorial video generation powered by intelligent multi-model routing across
            <strong className="text-white"> Alibaba ModelScope</strong>,
            <strong className="text-white"> HuggingFace Inference Router</strong>,
            and local desktop models (<strong className="text-white">LM Studio & Ollama</strong>).
            Synthesizes 3-column production blueprints, talking avatars, and video timelines in seconds.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('generator')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Launch Tutorial Agent</span>
            </button>

            <button
              onClick={() => setActiveTab('models')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/90 text-white font-semibold text-sm border border-white/10 transition-all cursor-pointer"
            >
              <Cpu size={16} className="text-indigo-400" />
              <span>Configure Model Router</span>
            </button>

            <button
              onClick={() => setActiveTab('automation')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-sm border border-emerald-500/30 transition-all cursor-pointer"
            >
              <Zap size={16} className="text-emerald-400" />
              <span>Batch VEO Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => (
          <div
            key={st.label}
            className="bg-zinc-900/70 border border-white/[0.08] rounded-2xl p-5 space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{st.label}</span>
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">{st.icon}</div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{st.value}</div>
            <div className="text-[11px] text-zinc-400">{st.sub}</div>
          </div>
        ))}
      </div>

      {/* Model Providers Active Status Bar */}
      <div className="bg-zinc-900/60 border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Connected Multi-Model Gateways
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('models')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Providers</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'modelscope',
              name: 'ModelScope',
              model: 'Qwen-Max / Turbo',
              type: 'Cloud',
              icon: <Globe size={16} className="text-indigo-400" />,
            },
            {
              id: 'huggingface',
              name: 'HuggingFace',
              model: 'Llama-3.1-70B',
              type: 'Cloud Router',
              icon: <Zap size={16} className="text-amber-400" />,
            },
            {
              id: 'lmstudio',
              name: 'LM Studio',
              model: 'Local Port 1234',
              type: 'Local Desktop',
              icon: <Server size={16} className="text-emerald-400" />,
            },
            {
              id: 'ollama',
              name: 'Ollama',
              model: 'Llama 3.1 / Qwen',
              type: 'Local Daemon',
              icon: <Terminal size={16} className="text-purple-400" />,
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab('models')}
              className="bg-black/40 border border-white/[0.06] hover:border-indigo-500/40 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-200">{item.name}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono">{item.model}</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* The Xennials 2-Phase Tutorial Production Blueprint */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">The Xennials 2-Phase Production Workflow</h2>
            <p className="text-zinc-400 text-xs mt-0.5">
              From raw technical prompt to multi-track timeline blueprint and UGC avatar video
            </p>
          </div>
          <button
            onClick={() => setActiveTab('generator')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Studio</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/70 border border-white/[0.08] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-md shadow-indigo-600/30">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Data-Driven 3-Column Scripting</h3>
                <span className="text-[10px] text-indigo-400 font-mono">ModelScope & HuggingFace Gateway</span>
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Feed raw technical documentation, pull requests, or product feature ideas into the AI Agent.
              The model router parses the input into an exact 3-column blueprint:
              <strong className="text-white"> Timestamps, Visual Screencast/Graphic description, and Spoken Script</strong>.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-2 border-t border-white/[0.06]">
              <CheckCircle2 size={14} />
              <span>Multi-model routing with automatic offline fallback</span>
            </div>
          </div>

          <div className="bg-zinc-900/70 border border-white/[0.08] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-sm font-black text-white shadow-md shadow-cyan-600/30">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Production & Avatar Polish</h3>
                <span className="text-[10px] text-cyan-400 font-mono">No Watermarks • UGC Avatars • Google Veo</span>
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Attach realistic UGC avatars in casual t-shirts to build viewer trust and stop scrolling.
              Apply neural auto-enhanced voice modulation with micro-pauses, filler word removal,
              and synchronized timeline playback with optional Google Veo video synthesis.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium pt-2 border-t border-white/[0.06]">
              <CheckCircle2 size={14} />
              <span>Zero watermarks, complete Markdown & JSON batch export</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tutorial Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Tutorial Projects</h2>
            <p className="text-zinc-400 text-xs mt-0.5">Explore blueprints ready for rendering or export</p>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            View All Projects ({projects.length})
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {projects.slice(0, 2).map((proj) => (
            <div
              key={proj.id}
              className="bg-zinc-900/70 border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-6 space-y-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-semibold">
                    {proj.provider}
                  </span>
                  <span>/</span>
                  <span className="font-mono text-zinc-300">{proj.model}</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {proj.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{proj.title}</h3>
              <p className="text-xs text-zinc-400 line-clamp-2">{proj.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                  <Clock size={13} /> {proj.duration} • {proj.steps?.length || 0} steps
                </span>

                <button
                  onClick={() => setActiveTab('projects')}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  <Play size={12} className="fill-indigo-400" />
                  <span>Inspect Tutorial</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
