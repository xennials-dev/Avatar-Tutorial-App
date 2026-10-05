import React, { useState, useEffect } from 'react';
import { TutorialProject, TutorialStep } from '../types';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Monitor,
  RotateCcw,
  Video,
  Loader2,
  Code,
  Download,
  Share2,
} from 'lucide-react';
import { exportProjectAsJSON, exportProjectAsMarkdown } from '../utils/exportUtils';

interface VideoPlayerModalProps {
  project: TutorialProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [viewMode, setViewMode] = useState<'interactive' | 'veo'>('interactive');
  const [isGeneratingVeo, setIsGeneratingVeo] = useState(false);
  const [veoStatusMessage, setVeoStatusMessage] = useState('');
  const [veoVideoUrl, setVeoVideoUrl] = useState<string | null>(null);

  const steps = project?.steps || [];
  const currentStep: TutorialStep | undefined = steps[currentStepIndex];

  // Browser-safe timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && steps.length > 0 && viewMode === 'interactive') {
      const stepDurationMs = 5000 / playbackSpeed;
      const intervalMs = 50;
      const increment = (intervalMs / stepDurationMs) * 100;

      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (currentStepIndex < steps.length - 1) {
              setCurrentStepIndex((idx) => idx + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + increment;
        });
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentStepIndex, steps.length, playbackSpeed, viewMode]);

  if (!isOpen || !project) return null;

  const handlePlayPause = () => {
    if (progress >= 100 && currentStepIndex === steps.length - 1) {
      setCurrentStepIndex(0);
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setProgress(0);
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((idx) => idx + 1);
      setProgress(0);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((idx) => idx - 1);
      setProgress(0);
    }
  };

  const handleGenerateVeoVideo = async () => {
    setIsGeneratingVeo(true);
    setViewMode('veo');
    setVeoStatusMessage('Initiating Google Veo cinematic render...');

    try {
      const promptText = `Software tutorial screencast: ${project.title}. Visual details: ${steps
        .map((s) => s.visual)
        .join('. ')}`;

      const res = await fetch('/api/veo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, aspectRatio: '16:9' }),
      });
      const data = await res.json();

      if (!data.success || !data.operationName) {
        throw new Error(data.error || 'Veo generation could not start');
      }

      const operationName = data.operationName;
      setVeoStatusMessage('Google Veo is synthesizing video frames (checking operation status)...');

      // Poll up to 15 times
      let attempts = 0;
      while (attempts < 15) {
        await new Promise((r) => setTimeout(r, 4000));
        attempts++;

        const statusRes = await fetch('/api/veo/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });
        const statusData = await statusRes.json();

        if (statusData.done) {
          setVeoStatusMessage('Render complete! Streaming video payload...');
          const downloadRes = await fetch('/api/veo/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });

          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            setVeoVideoUrl(URL.createObjectURL(blob));
            setVeoStatusMessage('Video ready!');
          }
          break;
        }
      }
    } catch (err: any) {
      console.warn('Veo generation note:', err);
      setVeoStatusMessage(`Veo Note: ${err.message}. Showing interactive multi-track canvas.`);
    } finally {
      setIsGeneratingVeo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Video size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-1">
                {project.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span className="text-indigo-400 font-semibold">{project.provider}</span>
                <span>•</span>
                <span>{project.avatar}</span>
                <span>•</span>
                <span>{project.duration}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/50 p-1 rounded-xl border border-white/10 flex items-center">
              <button
                onClick={() => setViewMode('interactive')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'interactive'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Interactive
              </button>
              <button
                onClick={() => setViewMode('veo')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'veo'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Veo AI Render
              </button>
            </div>

            <button
              onClick={() => exportProjectAsMarkdown(project)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Export Markdown"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={() => exportProjectAsJSON(project)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Export JSON"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video / Interactive Stage */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {viewMode === 'interactive' ? (
            <div className="space-y-4">
              {/* Virtual Screencast Display */}
              <div className="relative aspect-video w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between p-6">
                {/* Simulated UI Topbar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="text-[11px] text-zinc-400 font-mono ml-2">
                      xennials-automation // {project.provider}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {currentStep?.time || '0:00'}
                  </div>
                </div>

                {/* Center Visual Mock */}
                <div className="flex flex-col items-center justify-center text-center my-auto py-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-600/10">
                    <Monitor size={32} />
                  </div>
                  <div className="max-w-md">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                      Step {currentStepIndex + 1} of {steps.length}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white mt-1">
                      {currentStep?.visual || 'Interactive Tutorial Screencast'}
                    </h4>
                  </div>
                </div>

                {/* Subtitle / Teleprompter Overlay */}
                <div className="bg-black/85 backdrop-blur-md border border-white/10 rounded-xl p-3.5 shadow-2xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                      {project.avatar.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-0.5">
                        <span className="font-semibold text-zinc-300">{project.avatar}</span>
                        <span>{project.voice}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-100 font-medium leading-relaxed">
                        "{currentStep?.script || 'Narrator audio for this step...'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top timeline progress indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/[0.08]">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Timeline Steps Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {steps.map((st, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentStepIndex(i);
                      setProgress(0);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      currentStepIndex === i
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="font-bold">Step {i + 1}</span>
                      <span className="text-zinc-400">{st.time}</span>
                    </div>
                    <p className="text-[11px] truncate font-medium">{st.visual}</p>
                  </button>
                ))}
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between bg-black/40 border border-white/[0.08] rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <SkipBack size={16} />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={currentStepIndex === steps.length - 1}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <SkipForward size={16} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
                    title="Reset to beginning"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>

                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-200"
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                  </select>

                  <span className="text-xs font-mono text-zinc-400">
                    {currentStepIndex + 1}/{steps.length}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Veo Video Mode */
            <div className="space-y-4">
              <div className="aspect-video w-full bg-black rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center">
                {veoVideoUrl ? (
                  <video src={veoVideoUrl} controls autoPlay className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-6 space-y-4 max-w-md">
                    {isGeneratingVeo ? (
                      <>
                        <Loader2 size={40} className="animate-spin text-indigo-400 mx-auto" />
                        <div>
                          <h4 className="text-base font-bold text-white">Rendering with Google Veo</h4>
                          <p className="text-xs text-zinc-400 mt-1">{veoStatusMessage}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                          <Sparkles size={28} />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">Synthesize Cinematic Veo Video</h4>
                          <p className="text-xs text-zinc-400 mt-1">
                            Uses Google Veo 3.1 fast preview to generate an authentic 16:9 tutorial video.
                          </p>
                        </div>
                        <button
                          onClick={handleGenerateVeoVideo}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                        >
                          Generate Veo Video
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
