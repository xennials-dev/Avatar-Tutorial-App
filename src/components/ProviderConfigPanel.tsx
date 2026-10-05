import React, { useState } from 'react';
import { Key, Globe, Server, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ModelProvider } from '../types';

interface ProviderConfigPanelProps {
  provider: ModelProvider;
  onSaved: (updated: ModelProvider) => void;
  onClose: () => void;
}

export const ProviderConfigPanel: React.FC<ProviderConfigPanelProps> = ({
  provider,
  onSaved,
  onClose,
}) => {
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl || '');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isLocal = provider.type === 'local';

  const defaultUrl =
    provider.id === 'modelscope'
      ? 'https://api-inference.modelscope.cn/v1'
      : provider.id === 'huggingface'
      ? 'https://router.huggingface.co/v1'
      : provider.id === 'lmstudio'
      ? 'http://localhost:1234/v1'
      : provider.id === 'ollama'
      ? 'http://localhost:11434'
      : '';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/providers/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          baseUrl: baseUrl.trim() || defaultUrl,
          apiKey: apiKey.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update provider configuration');
      }

      setStatusMessage({
        type: 'success',
        text: `Configuration saved! Status: ${data.provider?.status || 'Active'}${
          data.provider?.latency ? ` (${data.provider.latency})` : ''
        }`,
      });

      if (data.provider) {
        onSaved(data.provider);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Connection error. Check URL and Key.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setBaseUrl(defaultUrl);
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.08] bg-black/40 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLocal ? <Server size={15} className="text-emerald-400" /> : <Globe size={15} className="text-indigo-400" />}
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Configure {provider.name}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-white cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        {/* Base URL */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-zinc-300">OpenAI-Compatible Base URL</label>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
            >
              Reset to Default
            </button>
          </div>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={defaultUrl}
            className="w-full bg-zinc-900/90 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <p className="text-[10px] text-zinc-400 mt-1">
            {provider.id === 'modelscope' && 'Default: https://api-inference.modelscope.cn/v1 (Alibaba DashScope)'}
            {provider.id === 'huggingface' && 'Default: https://router.huggingface.co/v1 (Inference Providers router)'}
            {provider.id === 'lmstudio' && 'Default: http://localhost:1234/v1 (LM Studio Local Server)'}
            {provider.id === 'ollama' && 'Default: http://localhost:11434 (Ollama Local Daemon)'}
          </p>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
            API Key / Token {isLocal && <span className="text-zinc-400 font-normal">(Optional for local runner)</span>}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                provider.id === 'modelscope'
                  ? 'sk-...'
                  : provider.id === 'huggingface'
                  ? 'hf_...'
                  : 'Optional (e.g. lm-studio)'
              }
              className="w-full bg-zinc-900/90 border border-white/10 rounded-lg pl-3 pr-9 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/30 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Key size={12} />
                <span>Save & Test Route</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
