import React, { useState } from 'react';
import { Users, Volume2, CheckCircle2, ShieldCheck, Play, Sparkles, Mic, Sliders } from 'lucide-react';

const AVATARS = [
  {
    id: 'Alex',
    name: 'Alex (Casual Tech UGC)',
    tag: 'Casual T-Shirt Developer',
    role: 'Software & Developer Tutorials',
    rating: '4.9/5',
    color: 'from-blue-600 to-indigo-800',
    bio: 'Casual black tee, conversational hand gestures, perfect for coding and tech screencasts.',
  },
  {
    id: 'Sarah',
    name: 'Sarah (Professional Lead)',
    tag: 'SaaS Growth & Product',
    role: 'SaaS Onboarding & Business Tutorials',
    rating: '4.95/5',
    color: 'from-purple-600 to-pink-800',
    bio: 'Polished presenter, crisp articulation, ideal for executive demos and customer onboarding.',
  },
  {
    id: 'Marcus',
    name: 'Marcus (AI Engineer)',
    tag: 'Technical Architect',
    role: 'Deep Technical Architecture Walkthroughs',
    rating: '4.88/5',
    color: 'from-emerald-600 to-teal-800',
    bio: 'Measured tone, deep technical credibility, great for cloud infrastructure and AI pipelines.',
  },
  {
    id: 'Elena',
    name: 'Elena (Product Educator)',
    tag: 'UI/UX & Education',
    role: 'Design, Feature Walkthroughs & Mobile Apps',
    rating: '4.92/5',
    color: 'from-amber-600 to-orange-800',
    bio: 'Engaging, warm cadence, highly effective for mobile app walkthroughs and creative tools.',
  },
];

const VOICES = [
  {
    id: 'Natural Warm Male',
    tone: 'Conversational & Engaging',
    desc: 'Auto-enhanced cadence with natural micro-pauses and warm baritone resonance.',
    sample: "Hey everyone! Today we're configuring our multi-model router in under 30 seconds.",
  },
  {
    id: 'Clear Professional Female',
    tone: 'Broadcast Clarity',
    desc: 'Neutral American accent, broadcast-grade clarity with zero breath artifacts.',
    sample: "Welcome back. In this step, we'll configure repository secrets and deployment hooks.",
  },
  {
    id: 'Energetic Tech Lead',
    tone: 'Fast-Paced Hook',
    desc: 'High engagement hook delivery designed to stop the social scroll in the first 3 seconds.',
    sample: "Stop building manual video pipelines! Here's how autonomous model routing works.",
  },
  {
    id: 'Calm Educational Voice',
    tone: 'Deep Documentation',
    desc: 'Slow, precise cadence tailored for complex coding tutorials and debugging steps.',
    sample: "Observe the response headers. Notice how the fallback provider takes over automatically.",
  },
];

export const AvatarStudio: React.FC = () => {
  const [selectedAvatar, setSelectedAvatar] = useState('Alex');
  const [selectedVoice, setSelectedVoice] = useState('Natural Warm Male');
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [previewSampleText, setPreviewSampleText] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const activeVoiceObj = VOICES.find((v) => v.id === selectedVoice) || VOICES[0];

  const handleTestVoice = (sampleText: string) => {
    setPreviewSampleText(sampleText);
    setIsPlayingPreview(true);
    // Use speech synthesis if available in browser
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sampleText);
      utterance.rate = audioSpeed;
      utterance.pitch = 1 + pitch * 0.1;
      utterance.onend = () => setIsPlayingPreview(false);
      utterance.onerror = () => setIsPlayingPreview(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingPreview(false), 2500);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Users size={14} />
          <span>Xennials Presenter & Voice Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Avatar Spokesperson & Voice Studio
        </h1>
        <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
          Choose approachable UGC presenters in casual clothing to stop the scroll and build trust
          without uncanny valley corporate avatars. Customize voice cadence, pitch, and filler word elimination.
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
            <ShieldCheck size={14} />
            100% Watermark-Free Clean Timeline
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium">
            <Sparkles size={14} />
            Filler-Word Removal & Micro-Pauses
          </span>
        </div>
      </div>

      {/* UGC Avatars Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">UGC Avatar Presenters</h2>
          <span className="text-xs text-zinc-400">Selected: <strong className="text-indigo-300">{selectedAvatar}</strong></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AVATARS.map((av) => {
            const isSelected = selectedAvatar === av.id;

            return (
              <div
                key={av.id}
                onClick={() => setSelectedAvatar(av.id)}
                className={`bg-zinc-900/80 border rounded-2xl p-5 space-y-4 cursor-pointer transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/10'
                    : 'border-white/[0.08] hover:border-white/[0.18]'
                }`}
              >
                {/* Visual Avatar Portrait Placeholder */}
                <div
                  className={`w-full aspect-square rounded-xl bg-gradient-to-tr ${av.color} p-[1px] flex items-center justify-center relative overflow-hidden shadow-inner`}
                >
                  <div className="w-full h-full bg-black/60 rounded-[11px] flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white text-2xl font-black mb-2 shadow-lg">
                      {av.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-white">{av.tag}</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">{av.role}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{av.name}</h3>
                    <span className="text-xs text-amber-400 font-bold">★ {av.rating}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{av.bio}</p>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 font-mono">UGC Style</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAvatar(av.id);
                      handleTestVoice(activeVoiceObj.sample);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    <Play size={11} className="fill-indigo-400" />
                    <span>Test Presentation</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice Lab & Modulation */}
      <div className="bg-zinc-900/80 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Volume2 size={14} />
              <span>Neural Voice Synthesis</span>
            </div>
            <h2 className="text-xl font-bold text-white">Voice Lab & Audio Cadence</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select speaker inflection and fine-tune speech speed and pitch for your audience.
            </p>
          </div>

          <button
            onClick={() => handleTestVoice(activeVoiceObj.sample)}
            disabled={isPlayingPreview}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play size={13} className="fill-white" />
            <span>{isPlayingPreview ? 'Speaking Preview...' : 'Audition Voice'}</span>
          </button>
        </div>

        {/* Voice Cards */}
        <div className="grid sm:grid-cols-2 gap-3">
          {VOICES.map((v) => {
            const isSelected = selectedVoice === v.id;

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVoice(v.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-black/40 border-white/[0.06] text-zinc-300 hover:border-white/[0.14]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{v.id}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-indigo-300">
                      {v.tone}
                    </span>
                  </div>
                  {isSelected && <Volume2 size={16} className="text-indigo-400" />}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-3">{v.desc}</p>

                <div className="bg-black/60 border border-white/[0.06] rounded-xl p-2.5 text-xs text-zinc-300 italic font-sans flex items-center justify-between">
                  <span className="truncate pr-2">"{v.sample}"</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVoice(v.id);
                      handleTestVoice(v.sample);
                    }}
                    className="shrink-0 p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                  >
                    <Play size={11} className="fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fine-Tuning Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/[0.06]">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sliders size={13} className="text-indigo-400" />
                Pacing & Playback Speed
              </span>
              <span className="font-mono text-indigo-300 font-bold">{audioSpeed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.05"
              value={audioSpeed}
              onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>0.70x (Deliberate)</span>
              <span>1.0x (Normal)</span>
              <span>1.40x (Snappy)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Mic size={13} className="text-indigo-400" />
                Vocal Pitch Inflection
              </span>
              <span className="font-mono text-indigo-300 font-bold">
                {pitch > 0 ? `+${pitch}` : pitch}
              </span>
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="1"
              value={pitch}
              onChange={(e) => setPitch(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>-2 (Deep Resonant)</span>
              <span>0 (Natural)</span>
              <span>+2 (Bright Crisp)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
