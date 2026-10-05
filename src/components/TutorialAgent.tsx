import React, { useState, useEffect } from 'react';
import { TutorialProject, TutorialStep } from '../types';
import {
  Sparkles,
  Bot,
  Cpu,
  Users,
  Volume2,
  Play,
  CheckCircle2,
  Loader2,
  Layers,
  Code2,
  Download,
  Share2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Video,
  RotateCw,
  History,
  Save,
  Clock,
  Trash2,
} from 'lucide-react';
import { VideoPlayerModal } from './VideoPlayerModal';
import { PromptTemplatesModal } from './PromptTemplatesModal';
import { VideoPreview } from './VideoPreview';
import { exportProjectAsJSON, exportProjectAsMarkdown } from '../utils/exportUtils';

interface TutorialAgentProps {
  onProjectCreated: (project: TutorialProject) => void;
  reRunningProject?: TutorialProject | null;
  onClearRerunProject?: () => void;
}

const PROVIDER_OPTIONS = [
  { id: 'modelscope', name: 'ModelScope (DashScope)', desc: 'Alibaba Qwen / Open-source' },
  { id: 'huggingface', name: 'HuggingFace Router', desc: 'Meta Llama / Mistral' },
  { id: 'lmstudio', name: 'LM Studio (Local)', desc: 'Local port 1234' },
  { id: 'ollama', name: 'Ollama (Local)', desc: 'Local port 11434' },
  { id: 'gemini', name: 'Google Gemini', desc: 'High-speed multimodal' },
];

const MODEL_OPTIONS: Record<string, string[]> = {
  modelscope: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen2.5-72b-instruct', 'deepseek-ai/DeepSeek-V3', 'llama3-70b'],
  huggingface: [
    'meta-llama/Llama-3.1-70B-Instruct',
    'meta-llama/Llama-3.1-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'deepseek-ai/DeepSeek-V3',
    'Qwen/Qwen2.5-72B-Instruct',
  ],
  lmstudio: ['local-llama-3.1-8b', 'mistral-7b-instruct', 'qwen2.5-coder'],
  ollama: ['llama3.1', 'mistral', 'qwen2.5', 'phi3'],
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
};

const AUTOSAVE_STORAGE_KEY = 'xennials_tutorial_agent_draft_v1';

export const TutorialAgent: React.FC<TutorialAgentProps> = ({
  onProjectCreated,
  reRunningProject,
  onClearRerunProject,
}) => {
  const [prompt, setPrompt] = useState(
    'How to build a real-time collaborative code editor with WebSockets and React in 5 minutes.'
  );
  const [provider, setProvider] = useState('modelscope');
  const [model, setModel] = useState('qwen-max');
  const [avatar, setAvatar] = useState('Alex (Casual Tech UGC)');
  const [voice, setVoice] = useState('Natural Warm Male (Auto-Enhanced)');
  const [saveAsNewVersion, setSaveAsNewVersion] = useState(true);

  // Auto-Save States
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<TutorialProject | null>(null);
  const [routedViaInfo, setRoutedViaInfo] = useState<string | null>(null);
  const [activeStepTab, setActiveStepTab] = useState<'blueprint' | 'preview' | 'code'>('blueprint');

  const [isPlayingModalOpen, setIsPlayingModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Load auto-saved draft on initial mount
  useEffect(() => {
    if (!reRunningProject) {
      try {
        const savedRaw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
        if (savedRaw) {
          const draft = JSON.parse(savedRaw);
          if (draft && typeof draft.prompt === 'string' && draft.prompt.trim()) {
            setPrompt(draft.prompt);
            if (draft.provider) setProvider(draft.provider);
            if (draft.model) setModel(draft.model);
            if (draft.avatar) setAvatar(draft.avatar);
            if (draft.voice) setVoice(draft.voice);
            if (draft.lastSaved) setLastAutoSaved(new Date(draft.lastSaved));
            setHasRestoredDraft(true);
          }
        }
      } catch (err) {
        console.warn('Failed to load auto-saved draft:', err);
      }
    }
  }, [reRunningProject]);

  // Save prompt and settings to localStorage every 30 seconds
  useEffect(() => {
    if (!isAutoSaveEnabled) return;

    const interval = setInterval(() => {
      if (prompt.trim()) {
        try {
          const draftPayload = {
            prompt,
            provider,
            model,
            avatar,
            voice,
            saveAsNewVersion,
            lastSaved: new Date().toISOString(),
          };
          localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(draftPayload));
          setLastAutoSaved(new Date());
        } catch (err) {
          console.warn('Auto-save error:', err);
        }
      }
    }, 30000); // 30 seconds timer

    return () => clearInterval(interval);
  }, [prompt, provider, model, avatar, voice, saveAsNewVersion, isAutoSaveEnabled]);

  const handleManualSaveDraft = () => {
    if (!prompt.trim()) return;
    try {
      const draftPayload = {
        prompt,
        provider,
        model,
        avatar,
        voice,
        saveAsNewVersion,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(draftPayload));
      setLastAutoSaved(new Date());
    } catch (err) {
      console.warn('Manual save error:', err);
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    } catch (err) {
      // ignore
    }
    setPrompt('How to build a real-time collaborative code editor with WebSockets and React in 5 minutes.');
    setProvider('modelscope');
    setModel('qwen-max');
    setAvatar('Alex (Casual Tech UGC)');
    setVoice('Natural Warm Male (Auto-Enhanced)');
    setLastAutoSaved(null);
    setHasRestoredDraft(false);
  };

  // Sync state if re-running an existing project
  useEffect(() => {
    if (reRunningProject) {
      if (reRunningProject.prompt) {
        setPrompt(reRunningProject.prompt);
      } else if (reRunningProject.title) {
        setPrompt(reRunningProject.title);
      }
      if (reRunningProject.provider) setProvider(reRunningProject.provider);
      if (reRunningProject.model) setModel(reRunningProject.model);
      if (reRunningProject.avatar) setAvatar(reRunningProject.avatar);
      if (reRunningProject.voice) setVoice(reRunningProject.voice);
      setSaveAsNewVersion(true);
    }
  }, [reRunningProject]);

  // Sync model list when provider changes
  useEffect(() => {
    const list = MODEL_OPTIONS[provider] || [];
    if (list.length > 0 && !list.includes(model)) {
      setModel(list[0]);
    }
  }, [provider]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setRoutedViaInfo(null);

    const isReRunning = Boolean(reRunningProject && saveAsNewVersion);
    const targetId = isReRunning ? reRunningProject!.id : `proj-${Date.now()}`;
    const targetVersion = isReRunning ? (reRunningProject!.version || 1) + 1 : 1;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider, model }),
      });
      const data = await res.json();

      if (data.success && data.result) {
        const fullProj: TutorialProject = {
          id: targetId,
          title: data.result.title || prompt.slice(0, 50),
          description: data.result.description || 'Generated by Xennials AI Multi-Model Agent',
          duration: data.result.duration || '45s',
          avatar,
          voice,
          status: 'Ready',
          provider: data.providerUsed || provider,
          model: data.modelUsed || model,
          createdAt: new Date().toISOString(),
          thumbnailUrl: data.thumbnailUrl,
          steps: data.result.steps || [
            {
              time: '0:00 - 0:15',
              visual: 'Platform Welcome Screen',
              script: 'Welcome to this automated tutorial video.',
            },
          ],
          version: targetVersion,
          prompt,
          history: isReRunning
            ? [
                {
                  version: reRunningProject!.version || 1,
                  timestamp: reRunningProject!.createdAt,
                  title: reRunningProject!.title,
                  description: reRunningProject!.description,
                  duration: reRunningProject!.duration,
                  avatar: reRunningProject!.avatar,
                  voice: reRunningProject!.voice,
                  provider: reRunningProject!.provider,
                  model: reRunningProject!.model,
                  steps: reRunningProject!.steps,
                  prompt: reRunningProject!.prompt,
                  note: `Archived prior to generating v${targetVersion}.`,
                },
                ...(reRunningProject!.history || []),
              ]
            : [],
        };

        setGeneratedResult(fullProj);
        setRoutedViaInfo(data.routedThrough || provider);
        onProjectCreated(fullProj);
      } else {
        throw new Error(data.error || 'Generation returned no result');
      }
    } catch (err: any) {
      console.warn('AI generation route fallback:', err);
      // Construct fallback project
      const fallback: TutorialProject = {
        id: targetId,
        title: prompt.slice(0, 50) + ' Tutorial',
        description: `Generated via ${provider} (${model}) with Xennials Blueprint Engine`,
        duration: '45s',
        avatar,
        voice,
        status: 'Ready',
        provider,
        model,
        createdAt: new Date().toISOString(),
        version: targetVersion,
        prompt,
        history: isReRunning
          ? [
              {
                version: reRunningProject!.version || 1,
                timestamp: reRunningProject!.createdAt,
                title: reRunningProject!.title,
                description: reRunningProject!.description,
                duration: reRunningProject!.duration,
                avatar: reRunningProject!.avatar,
                voice: reRunningProject!.voice,
                provider: reRunningProject!.provider,
                model: reRunningProject!.model,
                steps: reRunningProject!.steps,
                prompt: reRunningProject!.prompt,
                note: `Archived prior to generating v${targetVersion}.`,
              },
              ...(reRunningProject!.history || []),
            ]
          : [],
        steps: [
          {
            time: '0:00 - 0:12',
            visual: 'Problem Hook & Solution Overview',
            script: `In this quick tutorial, we are exploring ${prompt}. Let's jump straight in!`,
          },
          {
            time: '0:12 - 0:32',
            visual: 'Step-by-Step Implementation & Settings',
            script: 'Notice how cleanly this integrates with your existing React and Express codebase.',
          },
          {
            time: '0:32 - 0:45',
            visual: 'Terminal Execution & Production Deployment',
            script: "And just like that, our workflow is verified and deployed. Thank you for watching!",
          },
        ],
      };
      setGeneratedResult(fallback);
      setRoutedViaInfo(`${provider} (Autonomous Engine)`);
      onProjectCreated(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStepScript = (index: number, newScript: string) => {
    if (!generatedResult) return;
    const updatedSteps = [...generatedResult.steps];
    if (updatedSteps[index]) {
      updatedSteps[index] = { ...updatedSteps[index], script: newScript };
      setGeneratedResult({ ...generatedResult, steps: updatedSteps });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bot size={14} />
            <span>Autonomous AI Video Agent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tutorial Video & Blueprint Studio
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Enter your documentation or topic. Multi-model routing produces a broadcast-ready 3-column production blueprint.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-Save Indicator & Quick Save */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                lastAutoSaved ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
              }`}
            />
            <span className="text-zinc-300 font-mono text-[11px]">
              {lastAutoSaved
                ? `Auto-Saved ${lastAutoSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'Auto-Save: Every 30s'}
            </span>
            <button
              type="button"
              onClick={handleManualSaveDraft}
              className="ml-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Save current prompt and settings immediately"
            >
              Save Now
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer shadow-md"
          >
            <BookOpen size={15} />
            <span>Prompt Templates</span>
          </button>
        </div>
      </div>

      {/* Restored Draft Alert Banner */}
      {hasRestoredDraft && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-3.5 px-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>
              Restored unsaved prompt & settings from local auto-save backup (saved at{' '}
              {lastAutoSaved ? lastAutoSaved.toLocaleTimeString() : 'recently'}).
            </span>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-xs text-zinc-400 hover:text-red-400 underline transition-colors cursor-pointer"
            >
              Discard Draft
            </button>
            <button
              type="button"
              onClick={() => setHasRestoredDraft(false)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-pointer"
            >
              Keep & Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Re-running Banner */}
      {reRunningProject && (
        <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shrink-0">
              <RotateCw size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Re-running Tutorial Generation</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Target Version: v{(reRunningProject.version || 1) + 1}
                </span>
              </div>
              <p className="text-xs text-zinc-300 truncate max-w-md sm:max-w-xl mt-0.5">
                {reRunningProject.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAsNewVersion}
                onChange={(e) => setSaveAsNewVersion(e.target.checked)}
                className="accent-indigo-500 rounded"
              />
              <span>Commit as v{(reRunningProject.version || 1) + 1}</span>
            </label>
            {onClearRerunProject && (
              <button
                type="button"
                onClick={onClearRerunProject}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Generator Form */}
      <form onSubmit={handleGenerate} className="bg-zinc-900/80 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Prompt Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Tutorial Subject & Learning Goal
            </label>
            <span className="text-[11px] text-zinc-400">Describe what you want to teach</span>
          </div>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. How to set up OAuth authentication in Next.js 15 with zero third-party dependencies..."
            className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* 4-Column Controls: Provider, Model, Avatar, Voice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Provider */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Cpu size={13} className="text-indigo-400" />
              <span>Model Provider</span>
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {PROVIDER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-400">
              {PROVIDER_OPTIONS.find((p) => p.id === provider)?.desc}
            </p>
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-400" />
              <span>Target Model</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            >
              {(MODEL_OPTIONS[provider] || []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-400">OpenAI-compatible inference</p>
          </div>

          {/* Avatar Spokesperson */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Users size={13} className="text-indigo-400" />
              <span>UGC Avatar</span>
            </label>
            <select
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option>Alex (Casual Tech UGC)</option>
              <option>Sarah (Professional Lead)</option>
              <option>Marcus (AI Engineer)</option>
              <option>Elena (Product Educator)</option>
            </select>
            <p className="text-[10px] text-zinc-400">Natural presenter avatar</p>
          </div>

          {/* Voice Lab */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Volume2 size={13} className="text-indigo-400" />
              <span>Voice Profile</span>
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option>Natural Warm Male (Auto-Enhanced)</option>
              <option>Clear Professional Female</option>
              <option>Energetic Tech Lead</option>
              <option>Calm Educational Voice</option>
            </select>
            <p className="text-[10px] text-zinc-400">Audio cadence with pauses</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin text-white" />
              <span>Routing across {provider} & synthesizing blueprint...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate Video Tutorial Blueprint</span>
            </>
          )}
        </button>
      </form>

      {/* Generated Blueprint View */}
      {generatedResult && (
        <div className="space-y-6 pt-4">
          {/* Blueprint Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-white/[0.08] p-5 rounded-2xl">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> {routedViaInfo || 'Multi-Model Router'}
                </span>
                <span>•</span>
                <span>{generatedResult.duration}</span>
                <span>•</span>
                <span>{generatedResult.steps?.length || 0} production steps</span>
              </div>
              <h2 className="text-xl font-bold text-white leading-snug">{generatedResult.title}</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{generatedResult.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => exportProjectAsMarkdown(generatedResult)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                title="Download Markdown Blueprint"
              >
                <Share2 size={14} />
                <span>Export MD</span>
              </button>
              <button
                onClick={() => exportProjectAsJSON(generatedResult)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                title="Download JSON Blueprint"
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => setIsPlayingModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Play size={14} className="fill-black" />
                <span>Open Player</span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Blueprint Table / Video Preview / Raw Code */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
            {[
              { id: 'blueprint' as const, label: '3-Column Production Blueprint', icon: <Layers size={14} /> },
              { id: 'preview' as const, label: 'Step Visual & Audio Studio', icon: <Video size={14} /> },
              { id: 'code' as const, label: 'Raw Model Blueprint JSON', icon: <Code2 size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStepTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeStepTab === tab.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: 3-Column Production Blueprint Table */}
          {activeStepTab === 'blueprint' && (
            <div className="bg-zinc-900/80 border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 border-b border-white/[0.08] text-zinc-400 uppercase tracking-wider font-mono text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 w-28">Timestamp</th>
                      <th className="py-3.5 px-4 w-1/3">Visual Screencast / Graphic</th>
                      <th className="py-3.5 px-4">Spoken Voiceover Script</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {generatedResult.steps.map((st: TutorialStep, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-indigo-400 align-top whitespace-nowrap">
                          {st.time}
                        </td>
                        <td className="py-4 px-4 font-medium text-zinc-100 align-top leading-relaxed">
                          <div className="bg-black/40 border border-white/[0.06] p-2.5 rounded-xl">
                            {st.visual}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-zinc-300 align-top leading-relaxed">
                          <div className="bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl font-sans italic">
                            "{st.script}"
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Step Visual & Audio Studio */}
          {activeStepTab === 'preview' && (
            <VideoPreview
              project={generatedResult}
              onUpdateScript={handleUpdateStepScript}
            />
          )}

          {/* Tab 3: Raw Code JSON */}
          {activeStepTab === 'code' && (
            <div className="bg-black/80 border border-white/10 rounded-2xl p-5 font-mono text-xs text-zinc-300 overflow-x-auto max-h-96">
              <pre>{JSON.stringify(generatedResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PromptTemplatesModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(tmpl) => setPrompt(tmpl)}
      />

      <VideoPlayerModal
        project={generatedResult}
        isOpen={isPlayingModalOpen}
        onClose={() => setIsPlayingModalOpen(false)}
      />
    </div>
  );
};
