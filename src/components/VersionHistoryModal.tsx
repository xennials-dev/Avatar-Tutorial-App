import React, { useState } from 'react';
import { TutorialProject, ProjectVersion, TutorialStep } from '../types';
import {
  History,
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  Play,
} from 'lucide-react';
import { exportProjectAsJSON, exportProjectAsMarkdown } from '../utils/exportUtils';

interface VersionHistoryModalProps {
  project: TutorialProject | null;
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion: (projectId: string, versionNumber: number) => Promise<void>;
  onRerunProject?: (project: TutorialProject) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  project,
  isOpen,
  onClose,
  onRestoreVersion,
  onRerunProject,
}) => {
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [isRestoring, setIsRestoring] = useState<number | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const currentVersionNumber = project.version || 1;

  // Synthesize complete version list: current active version + archived history
  const allVersions: Array<{
    isCurrent: boolean;
    version: number;
    timestamp: string;
    title: string;
    description: string;
    duration: string;
    avatar: string;
    voice: string;
    provider: string;
    model: string;
    steps: TutorialStep[];
    prompt?: string;
    note?: string;
  }> = [
    {
      isCurrent: true,
      version: currentVersionNumber,
      timestamp: project.createdAt,
      title: project.title,
      description: project.description,
      duration: project.duration,
      avatar: project.avatar,
      voice: project.voice,
      provider: project.provider,
      model: project.model,
      steps: project.steps,
      prompt: project.prompt,
      note: 'Active working version',
    },
    ...(project.history || []).map((h) => ({
      isCurrent: false,
      version: h.version,
      timestamp: h.timestamp,
      title: h.title,
      description: h.description,
      duration: h.duration,
      avatar: h.avatar,
      voice: h.voice,
      provider: h.provider,
      model: h.model,
      steps: h.steps,
      prompt: h.prompt,
      note: h.note,
    })),
  ].sort((a, b) => b.version - a.version);

  const handleRestore = async (versionNum: number) => {
    setIsRestoring(versionNum);
    setRestoreSuccess(null);
    setErrorMessage(null);

    try {
      await onRestoreVersion(project.id, versionNum);
      setRestoreSuccess(`Successfully restored version v${versionNum}!`);
      setTimeout(() => setRestoreSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to restore version v${versionNum}`);
    } finally {
      setIsRestoring(null);
    }
  };

  const handleExportVersion = (v: typeof allVersions[0]) => {
    const versionProject: TutorialProject = {
      ...project,
      title: `${v.title} (v${v.version})`,
      description: v.description,
      duration: v.duration,
      avatar: v.avatar,
      voice: v.voice,
      provider: v.provider,
      model: v.model,
      steps: v.steps,
      version: v.version,
    };
    exportProjectAsJSON(versionProject);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-snug">Version History & Restore</h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Current: v{currentVersionNumber}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-md sm:max-w-xl mt-0.5">
                {project.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRerunProject && (
              <button
                onClick={() => {
                  onClose();
                  onRerunProject(project);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                title="Re-run generation to create a new version"
              >
                <Sparkles size={13} />
                <span className="hidden sm:inline">Re-Run (v{currentVersionNumber + 1})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feedback banners */}
        {restoreSuccess && (
          <div className="px-5 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 size={15} />
            <span>{restoreSuccess}</span>
          </div>
        )}

        {errorMessage && (
          <div className="px-5 py-2.5 bg-red-500/15 border-b border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Versions Timeline List */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="text-xs text-zinc-400 flex items-center justify-between pb-1">
            <span>{allVersions.length} version snapshot{allVersions.length > 1 ? 's' : ''} recorded</span>
            <span className="text-[11px] text-zinc-500">Re-running generation automatically creates new versions</span>
          </div>

          <div className="space-y-3">
            {allVersions.map((v) => {
              const isExpanded = expandedVersion === v.version;
              const isCurrent = v.isCurrent;

              return (
                <div
                  key={v.version}
                  className={`border rounded-2xl p-4 transition-all ${
                    isCurrent
                      ? 'bg-zinc-900 border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/5'
                      : 'bg-black/40 border-white/[0.08] hover:border-white/[0.14]'
                  }`}
                >
                  {/* Top card info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-white/[0.06] text-zinc-300 border border-white/[0.08]'
                        }`}
                      >
                        v{v.version}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm">{v.title}</h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Active Version
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 font-mono">
                          <span className="text-indigo-400 font-semibold">{v.provider}</span>
                          <span>/</span>
                          <span>{v.model}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {new Date(v.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isCurrent && (
                        <button
                          onClick={() => handleRestore(v.version)}
                          disabled={isRestoring === v.version}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isRestoring === v.version ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <RotateCcw size={13} />
                          )}
                          <span>Restore v{v.version}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleExportVersion(v)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                        title={`Export v${v.version} JSON`}
                      >
                        <Download size={14} />
                      </button>

                      <button
                        onClick={() => setExpandedVersion(isExpanded ? null : v.version)}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <span>{v.steps?.length || 0} steps</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {v.description && (
                    <p className="text-xs text-zinc-400 mt-2 pl-12 line-clamp-2 leading-relaxed">
                      {v.description}
                    </p>
                  )}

                  {/* Expandable steps preview */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] pl-1 sm:pl-12 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                        Production Steps in v{v.version}
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {(v.steps || []).map((st, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-black/50 border border-white/[0.04] rounded-xl p-2.5 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-mono text-[10px]">
                              <span className="font-bold text-indigo-400">Step {sIdx + 1} ({st.time})</span>
                              <span className="text-zinc-400">{st.visual}</span>
                            </div>
                            <p className="text-zinc-300 italic text-[11px]">"{st.script}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-white/[0.08] bg-black/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Restoring a version preserves existing history without data loss.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
