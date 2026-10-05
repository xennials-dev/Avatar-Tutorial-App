import React, { useState } from 'react';
import { TutorialProject, ActiveTab } from '../types';
import {
  FolderKanban,
  Play,
  Trash2,
  Plus,
  Clock,
  CheckSquare,
  Square,
  Download,
  Share2,
  Search,
  Layers,
  FileArchive,
  X,
  Filter,
  FileSpreadsheet,
  FileJson,
  History,
  RotateCw,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { VideoPlayerModal } from './VideoPlayerModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import {
  exportProjectAsJSON,
  exportProjectAsMarkdown,
  exportProjectsBatchAsZip,
  exportProjectsAsJSON,
  exportProjectsAsCSV,
} from '../utils/exportUtils';

interface ProjectsViewProps {
  projects: TutorialProject[];
  onDeleteProject: (id: string) => void;
  onDeleteProjects?: (ids: string[]) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onRestoreProjectVersion?: (projectId: string, versionNumber: number) => Promise<void>;
  onRerunProject?: (project: TutorialProject) => void;
  onUpdateProject?: (project: TutorialProject) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onDeleteProject,
  onDeleteProjects,
  setActiveTab,
  onRestoreProjectVersion,
  onRerunProject,
  onUpdateProject,
}) => {
  const [playingProject, setPlayingProject] = useState<TutorialProject | null>(null);
  const [viewingHistoryProject, setViewingHistoryProject] = useState<TutorialProject | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [isExportingBatch, setIsExportingBatch] = useState(false);
  const [generatingThumbnailIds, setGeneratingThumbnailIds] = useState<string[]>([]);
  const [isGeneratingBatchThumbnails, setIsGeneratingBatchThumbnails] = useState(false);
  const [thumbnailToast, setThumbnailToast] = useState<string | null>(null);

  const handleGenerateThumbnail = async (projectId: string) => {
    if (generatingThumbnailIds.includes(projectId)) return;
    setGeneratingThumbnailIds((prev) => [...prev, projectId]);
    setThumbnailToast(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/thumbnail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate thumbnail with Imagen');
      }

      if (data.project && onUpdateProject) {
        onUpdateProject(data.project);
      }
      setThumbnailToast(`Imagen thumbnail generated successfully!`);
      setTimeout(() => setThumbnailToast(null), 4000);
    } catch (err: any) {
      console.error('Thumbnail generation error:', err);
      alert(err.message || 'Failed to generate Imagen thumbnail');
    } finally {
      setGeneratingThumbnailIds((prev) => prev.filter((id) => id !== projectId));
    }
  };

  const handleBatchGenerateThumbnails = async () => {
    const targets = selectedIds.length > 0
      ? projects.filter((p) => selectedIds.includes(p.id))
      : filteredProjects;

    if (targets.length === 0) return;
    setIsGeneratingBatchThumbnails(true);

    try {
      for (const proj of targets) {
        await handleGenerateThumbnail(proj.id);
      }
    } finally {
      setIsGeneratingBatchThumbnails(false);
    }
  };

  const handleRestoreVersion = async (projectId: string, versionNumber: number) => {
    if (onRestoreProjectVersion) {
      await onRestoreProjectVersion(projectId, versionNumber);
      // Update viewing history modal project from current projects list
      const updated = projects.find((p) => p.id === projectId);
      if (updated) {
        setViewingHistoryProject(updated);
      }
    } else {
      const res = await fetch(`/api/projects/${projectId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetVersion: versionNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to restore version');
      }
      if (data.project) {
        setViewingHistoryProject(data.project);
      }
    }
  };

  const filteredProjects = projects.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.provider.toLowerCase().includes(query) ||
      (p.model && p.model.toLowerCase().includes(query)) ||
      p.description.toLowerCase().includes(query);

    const matchesProvider =
      providerFilter === 'all' || p.provider.toLowerCase() === providerFilter.toLowerCase();

    return matchesSearch && matchesProvider;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map((p) => p.id));
    }
  };

  const toggleSelectProject = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchExport = async () => {
    const selected = projects.filter((p) => selectedIds.includes(p.id));
    if (selected.length === 0) return;

    setIsExportingBatch(true);
    try {
      await exportProjectsBatchAsZip(selected);
    } catch (err) {
      console.error(err);
      alert('Batch export zip failed');
    } finally {
      setIsExportingBatch(false);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (onDeleteProjects) {
      onDeleteProjects(selectedIds);
    } else {
      selectedIds.forEach((id) => onDeleteProject(id));
    }
    setSelectedIds([]);
  };

  const getTargetExportProjects = () => {
    if (selectedIds.length > 0) {
      return projects.filter((p) => selectedIds.includes(p.id));
    }
    return filteredProjects.length > 0 ? filteredProjects : projects;
  };

  const handleExportJSON = () => {
    const targets = getTargetExportProjects();
    exportProjectsAsJSON(targets, selectedIds.length > 0 ? 'tutorials_selected' : 'tutorials_archive');
  };

  const handleExportCSV = () => {
    const targets = getTargetExportProjects();
    exportProjectsAsCSV(targets, selectedIds.length > 0 ? 'tutorials_selected' : 'tutorials_archive');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FolderKanban size={14} />
            <span>Xennials Project Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">All Tutorial Projects</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage, play back, and export your tutorial blueprints as JSON, CSV, or ZIP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metadata Archive Export Group */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-xl p-1">
            <span className="text-[10px] text-zinc-400 font-semibold px-2 hidden sm:inline">Archive:</span>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
              title={`Export ${selectedIds.length > 0 ? `${selectedIds.length} selected` : 'all'} tutorials as JSON metadata archive`}
            >
              <FileJson size={14} className="text-cyan-400" />
              <span>JSON{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
              title={`Export ${selectedIds.length > 0 ? `${selectedIds.length} selected` : 'all'} tutorials as CSV spreadsheet archive`}
            >
              <FileSpreadsheet size={14} className="text-emerald-400" />
              <span>CSV{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}</span>
            </button>
          </div>

          {/* Batch Imagen Thumbnail Generation */}
          <button
            onClick={handleBatchGenerateThumbnails}
            disabled={isGeneratingBatchThumbnails}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Generate Imagen thumbnails for projects"
          >
            {isGeneratingBatchThumbnails ? (
              <Loader2 size={13} className="animate-spin text-indigo-400" />
            ) : (
              <Sparkles size={13} className="text-indigo-400" />
            )}
            <span>Imagen Thumbnails{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}</span>
          </button>

          {selectedIds.length > 0 && (
            <>
              <button
                onClick={handleBatchExport}
                disabled={isExportingBatch}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <FileArchive size={14} />
                <span>{isExportingBatch ? 'Zipping...' : `Export ZIP (${selectedIds.length})`}</span>
              </button>
              <button
                onClick={handleBatchDelete}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete ({selectedIds.length})</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>New Video</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {thumbnailToast && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg">
          <CheckCircle2 size={15} />
          <span>{thumbnailToast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/80 border border-white/[0.08] p-4 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tutorials by title or model provider (e.g. ModelScope, HuggingFace, Qwen)..."
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Provider Select Dropdown & Select All */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-zinc-800/80 border border-white/10 rounded-xl px-2.5 py-1">
              <Filter size={13} className="text-zinc-400" />
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer py-1.5"
              >
                <option value="all">All Providers</option>
                <option value="modelscope">ModelScope</option>
                <option value="huggingface">HuggingFace</option>
                <option value="lmstudio">LM Studio</option>
                <option value="ollama">Ollama</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            {filteredProjects.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-semibold border border-white/10 transition-colors whitespace-nowrap cursor-pointer"
              >
                {selectedIds.length === filteredProjects.length ? (
                  <CheckSquare size={14} className="text-indigo-400" />
                ) : (
                  <Square size={14} />
                )}
                <span>{selectedIds.length === filteredProjects.length ? 'Deselect All' : 'Select All'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Chips & Result Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-500 font-medium mr-1">Quick Filters:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'modelscope', label: 'ModelScope' },
              { id: 'huggingface', label: 'HuggingFace' },
              { id: 'lmstudio', label: 'LM Studio' },
              { id: 'ollama', label: 'Ollama' },
              { id: 'gemini', label: 'Gemini' },
            ].map((chip) => {
              const isActive = providerFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setProviderFilter(chip.id)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08]'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-zinc-400 font-mono">
            Showing <strong className="text-zinc-200">{filteredProjects.length}</strong> of{' '}
            <span>{projects.length}</span> tutorials
            {(searchQuery || providerFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setProviderFilter('all');
                }}
                className="ml-2 text-indigo-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 border border-white/[0.06] rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <FolderKanban size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Matching Tutorials Found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery || providerFilter !== 'all'
                ? `No tutorials match "${searchQuery || providerFilter}". Try searching by another title or provider.`
                : 'Get started by creating your first AI tutorial video with the generator.'}
            </p>
          </div>
          {(searchQuery || providerFilter !== 'all') ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setProviderFilter('all');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
            >
              <span>Clear Search & Filters</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('generator')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Launch Generator</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => {
            const isSelected = selectedIds.includes(proj.id);

            return (
              <div
                key={proj.id}
                className={`bg-zinc-900/80 border rounded-2xl p-5 space-y-4 transition-all relative group ${
                  isSelected
                    ? 'border-indigo-500/70 ring-1 ring-indigo-500/30'
                    : 'border-white/[0.08] hover:border-white/[0.16]'
                }`}
              >
                {/* Header row with select & status */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleSelectProject(proj.id)}
                    className="text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-indigo-400" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingHistoryProject(proj)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] hover:bg-indigo-500/20 text-indigo-300 border border-white/10 hover:border-indigo-500/30 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                      title="View version history and restore past snapshots"
                    >
                      <History size={11} className="text-indigo-400" />
                      <span>v{proj.version || 1}</span>
                      {proj.history && proj.history.length > 0 && (
                        <span className="text-zinc-400 font-normal">({proj.history.length + 1})</span>
                      )}
                    </button>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono">
                      {proj.provider}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                      {proj.status}
                    </span>
                  </div>
                </div>

                {/* Visual Thumbnail (Imagen) */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/60 border border-white/[0.08] group/thumb">
                  {proj.thumbnailUrl ? (
                    <>
                      <img
                        src={proj.thumbnailUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-indigo-300 backdrop-blur-md border border-indigo-500/30 flex items-center gap-1 font-mono shadow-sm">
                          <Sparkles size={9} className="text-indigo-400" />
                          <span>IMAGEN</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-indigo-950/30 via-zinc-900 to-black">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-1">
                        <ImageIcon size={16} />
                      </div>
                      <span className="text-[10px] text-zinc-400">No Visual Thumbnail</span>
                    </div>
                  )}

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/65 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      onClick={() => setPlayingProject(proj)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-[11px] font-bold flex items-center gap-1 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      <Play size={11} className="fill-current" />
                      <span>Watch</span>
                    </button>
                    <button
                      onClick={() => handleGenerateThumbnail(proj.id)}
                      disabled={generatingThumbnailIds.includes(proj.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-lg transition-transform hover:scale-105 cursor-pointer disabled:opacity-50"
                      title="Generate or update unique thumbnail using Imagen"
                    >
                      {generatingThumbnailIds.includes(proj.id) ? (
                        <Loader2 size={11} className="animate-spin text-white" />
                      ) : (
                        <Sparkles size={11} />
                      )}
                      <span>
                        {generatingThumbnailIds.includes(proj.id)
                          ? 'Generating...'
                          : proj.thumbnailUrl
                          ? 'Regen Imagen'
                          : 'Create Imagen'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-1 leading-snug">{proj.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                {/* Metadata */}
                <div className="bg-black/40 border border-white/[0.04] rounded-xl p-2.5 text-[11px] text-zinc-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Model:</span>
                    <span className="text-zinc-200 truncate max-w-[150px]">{proj.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-zinc-200">{proj.duration} • {proj.steps?.length || 0} steps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avatar:</span>
                    <span className="text-zinc-200 truncate max-w-[150px]">{proj.avatar}</span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => setPlayingProject(proj)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/25 transition-colors cursor-pointer"
                  >
                    <Play size={12} className="fill-current" />
                    <span>Watch</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleGenerateThumbnail(proj.id)}
                      disabled={generatingThumbnailIds.includes(proj.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer disabled:opacity-50"
                      title={proj.thumbnailUrl ? 'Regenerate Imagen Thumbnail' : 'Generate Imagen Thumbnail'}
                    >
                      {generatingThumbnailIds.includes(proj.id) ? (
                        <Loader2 size={13} className="animate-spin text-indigo-400" />
                      ) : (
                        <ImageIcon size={13} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (onRerunProject) {
                          onRerunProject(proj);
                        } else {
                          setActiveTab('generator');
                        }
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                      title={`Re-run generation to create v${(proj.version || 1) + 1}`}
                    >
                      <RotateCw size={13} />
                    </button>
                    <button
                      onClick={() => exportProjectAsMarkdown(proj)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                      title="Export Markdown Document"
                    >
                      <Share2 size={13} />
                    </button>
                    <button
                      onClick={() => exportProjectAsJSON(proj)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                      title="Export JSON Metadata"
                    >
                      <FileJson size={13} />
                    </button>
                    <button
                      onClick={() => exportProjectsAsCSV([proj], proj.title.slice(0, 30))}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      title="Export CSV Metadata"
                    >
                      <FileSpreadsheet size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Player */}
      <VideoPlayerModal
        project={playingProject}
        isOpen={!!playingProject}
        onClose={() => setPlayingProject(null)}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        project={viewingHistoryProject}
        isOpen={!!viewingHistoryProject}
        onClose={() => setViewingHistoryProject(null)}
        onRestoreVersion={handleRestoreVersion}
        onRerunProject={onRerunProject}
      />
    </div>
  );
};
