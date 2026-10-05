import React, { useState, useEffect } from 'react';
import { ModelProvider } from '../types';
import {
  Cpu,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Server,
  ShieldCheck,
  Zap,
  Globe,
  Settings,
  Sparkles,
  ArrowRight,
  Clock,
  Play,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { ProviderConfigPanel } from './ProviderConfigPanel';

export const ModelRouterCenter: React.FC = () => {
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [configuringProviderId, setConfiguringProviderId] = useState<string | null>(null);

  // Playground state
  const [activeTestProvider, setActiveTestProvider] = useState<string>('modelscope');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [testPrompt, setTestPrompt] = useState<string>(
    'Explain how automated video rendering works in 2 concise sentences for a developer tutorial.'
  );
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testStats, setTestStats] = useState<{ latencyMs: number; tokens?: number } | null>(null);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      if (Array.isArray(data.providers)) {
        setProviders(data.providers);
        setLastRefreshed(new Date());

        // Update default model if not set
        const currentProv = data.providers.find((p: ModelProvider) => p.id === activeTestProvider);
        if (currentProv && currentProv.models?.length > 0 && !selectedModel) {
          setSelectedModel(currentProv.models[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    const prov = providers.find((p) => p.id === activeTestProvider);
    if (prov && prov.models?.length > 0) {
      setSelectedModel(prov.models[0]);
    }
  }, [activeTestProvider, providers]);

  const handleTestRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim()) return;

    setIsTesting(true);
    setTestResult(null);
    setTestStats(null);
    const start = Date.now();

    try {
      const res = await fetch('/api/generate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeTestProvider,
          model: selectedModel,
          prompt: testPrompt,
          temperature: 0.7,
        }),
      });

      const latencyMs = Date.now() - start;
      const data = await res.json();

      if (data.success) {
        setTestResult(data.text);
        setTestStats({
          latencyMs,
          tokens: data.usage?.totalTokens,
        });
      } else {
        setTestResult(`Error: ${data.error || 'Request failed'}`);
      }
    } catch (err: any) {
      setTestResult(`Connection Error: ${err.message}. If using local LM Studio/Ollama, ensure the daemon is running.`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleProviderUpdated = (updated: ModelProvider) => {
    setProviders((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setConfiguringProviderId(null);
  };

  const statusBadge = (status: ModelProvider['status']) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        );
      case 'standby':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Standby (Needs Key)
          </span>
        );
      case 'error':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 border border-red-500/30 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Offline / Unreachable
          </span>
        );
    }
  };

  const currentProvider = providers.find((p) => p.id === activeTestProvider);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border border-white/[0.08] p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu size={14} />
            <span>Universal Model Router Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            ModelScope, HuggingFace, LM Studio & Ollama
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
            Intelligent multi-model routing across Alibaba ModelScope, HuggingFace Inference Router,
            local LM Studio, and Ollama. All routed through OpenAI-compatible interfaces with automatic fallback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProviders}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh Health</span>
          </button>
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {providers.map((prov) => {
          const isSelected = activeTestProvider === prov.id;
          const isConfiguring = configuringProviderId === prov.id;

          return (
            <div
              key={prov.id}
              className={`bg-zinc-900/70 border rounded-2xl p-5 space-y-4 transition-all relative ${
                isSelected
                  ? 'border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    {prov.id === 'modelscope' && <Globe size={20} className="text-indigo-400" />}
                    {prov.id === 'huggingface' && <Zap size={20} className="text-amber-400" />}
                    {prov.id === 'lmstudio' && <Server size={20} className="text-emerald-400" />}
                    {prov.id === 'ollama' && <Terminal size={20} className="text-purple-400" />}
                    {prov.id === 'gemini' && <Sparkles size={20} className="text-cyan-400" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{prov.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {statusBadge(prov.status)}
                      <span className="text-xs text-zinc-400 font-mono">
                        {prov.latency && prov.latency !== '--' ? prov.latency : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setConfiguringProviderId(isConfiguring ? null : prov.id)}
                  className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isConfiguring
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                  title="Configure base URL or API key"
                >
                  <Settings size={15} />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed">{prov.description}</p>

              {/* Error warning if any */}
              {prov.error && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{prov.error}</span>
                </div>
              )}

              {/* Models list preview */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Available Models ({prov.models?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                  {(prov.models || []).map((m) => (
                    <span
                      key={m}
                      onClick={() => {
                        setActiveTestProvider(prov.id);
                        setSelectedModel(m);
                      }}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-indigo-500/20 hover:text-indigo-200 border border-white/[0.06] text-zinc-300 cursor-pointer transition-colors"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => setActiveTestProvider(prov.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] hover:text-white'
                  }`}
                >
                  {isSelected ? '✓ Selected for Playground' : 'Select for Testing'}
                </button>

                <span className="text-[11px] text-zinc-400 font-mono">
                  {prov.type === 'local' ? 'Local Daemon' : 'Cloud Endpoint'}
                </span>
              </div>

              {/* Inline config panel */}
              {isConfiguring && (
                <ProviderConfigPanel
                  provider={prov}
                  onSaved={handleProviderUpdated}
                  onClose={() => setConfiguringProviderId(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Testing Playground */}
      <div className="bg-zinc-900/80 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Terminal size={14} />
              <span>Real-Time Provider Execution Console</span>
            </div>
            <h2 className="text-xl font-bold text-white">Live Model Test Playground</h2>
            <p className="text-zinc-400 text-xs mt-0.5">
              Send direct requests to verify routing, check token latency, and test responses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-zinc-400">Active Provider:</span>
              <span className="font-bold text-indigo-300 uppercase">{currentProvider?.name || activeTestProvider}</span>
            </div>
          </div>
        </div>

        {/* Test form */}
        <form onSubmit={handleTestRoute} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Provider</label>
              <select
                value={activeTestProvider}
                onChange={(e) => setActiveTestProvider(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Model Selection</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              >
                {currentProvider?.models?.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300">Prompt</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTestPrompt(
                      'Explain how to implement WebSockets in React and Node.js for real-time video timeline collaboration.'
                    )
                  }
                  className="text-[10px] text-zinc-400 hover:text-indigo-300 cursor-pointer"
                >
                  Preset: WebSockets
                </button>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={() =>
                    setTestPrompt(
                      'Write 3 script steps for an AI avatar explaining Docker multi-stage container builds.'
                    )
                  }
                  className="text-[10px] text-zinc-400 hover:text-indigo-300 cursor-pointer"
                >
                  Preset: Docker Tutorial
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter your prompt to test the model..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">
              Provider endpoint will be called directly through the server route.
            </span>
            <button
              type="submit"
              disabled={isTesting || !testPrompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isTesting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Streaming / Requesting...</span>
                </>
              ) : (
                <>
                  <Play size={14} className="fill-white" />
                  <span>Execute Model Test</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Output Console */}
        {testResult && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Console Response</span>
              {testStats && (
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock size={12} /> {testStats.latencyMs}ms
                  </span>
                  {testStats.tokens && <span>Tokens: {testStats.tokens}</span>}
                </div>
              )}
            </div>
            <div className="bg-black/80 border border-white/10 rounded-2xl p-4 font-mono text-xs text-zinc-200 max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {testResult}
            </div>
          </div>
        )}
      </div>

      {/* Fallback Architecture Overview */}
      <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          Autonomous Multi-Model Routing Strategy
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          When generating video tutorial blueprints, Xennials first routes to your chosen provider (e.g. ModelScope Qwen).
          If the primary model is busy, unconfigured, or times out, the router automatically cascades through the fallback chain:
          <span className="text-indigo-300 font-semibold"> ModelScope → HuggingFace → Google Gemini → Local LM Studio → Local Ollama</span>.
          This ensures zero broken workflows and production reliability even during external API downtime.
        </p>
      </div>
    </div>
  );
};
