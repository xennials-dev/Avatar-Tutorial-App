import React, { useState, useRef } from 'react';
import { TutorialProject, TutorialStep } from '../types';
import {
  Play,
  Film,
  Loader2,
  Mic,
  Square,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface VideoPreviewProps {
  project: TutorialProject;
  step?: TutorialStep;
  stepIndex?: number;
  onUpdateScript?: (stepIndex: number, newScript: string) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  project,
  step,
  stepIndex = 0,
  onUpdateScript,
}) => {
  const currentStep = step || project.steps[stepIndex] || project.steps[0];
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        setRecordingStatus('Transcribing audio narration via Gemini...');
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const res = await fetch('/api/audio/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType: 'audio/webm',
              }),
            });
            const data = await res.json();
            if (data.success && data.transcript) {
              if (onUpdateScript) {
                onUpdateScript(stepIndex, data.transcript);
              }
              setRecordingStatus('Voice recorded & script updated!');
            } else {
              setRecordingStatus(data.error || 'Audio recorded successfully');
            }
            setTimeout(() => setRecordingStatus(''), 4000);
          };
        } catch (err: any) {
          console.error(err);
          setRecordingStatus('Recording complete.');
          setTimeout(() => setRecordingStatus(''), 3000);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingStatus('Recording voice... speak clearly into mic.');
    } catch (err: any) {
      console.error(err);
      alert('Microphone permission needed: ' + (err.message || 'Check browser permissions.'));
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGenerateStepVideo = async () => {
    setIsGenerating(true);
    setStatusMessage('Generating Veo preview for this step...');

    try {
      const res = await fetch('/api/veo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Tutorial step: ${currentStep.visual}. Spoken: ${currentStep.script}`,
          aspectRatio: '16:9',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Video task submitted to Veo pipeline.');
      } else {
        setStatusMessage(`Veo Note: ${data.error || 'Check GEMINI_API_KEY for Veo'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Render note: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-black/50 border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
      {/* Video / Visual Screen */}
      <div className="relative aspect-video bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>{currentStep.time}</span>
          <span className="text-indigo-400 font-bold">{project.provider} / {project.model}</span>
        </div>

        <div className="text-center my-auto space-y-2">
          <Film size={36} className="text-indigo-400/40 mx-auto" />
          <h4 className="text-sm font-bold text-white max-w-md mx-auto">{currentStep.visual}</h4>
        </div>

        <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <p className="text-xs text-zinc-200 text-center font-medium leading-relaxed">
            "{currentStep.script}"
          </p>
        </div>
      </div>

      {/* Controls & Recording */}
      <div className="p-4 bg-zinc-900/60 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateStepVideo}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            <span>Render Veo Step</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isRecording ? (
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold animate-pulse cursor-pointer"
            >
              <Square size={12} />
              <span>Stop Recording</span>
            </button>
          ) : (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Mic size={12} />
              <span>Record Narration</span>
            </button>
          )}
        </div>
      </div>

      {(statusMessage || recordingStatus) && (
        <div className="px-4 py-2 bg-black/60 border-t border-white/[0.04] text-[11px] text-indigo-300 font-mono flex items-center gap-2">
          <CheckCircle2 size={12} className="text-emerald-400" />
          <span>{recordingStatus || statusMessage}</span>
        </div>
      )}
    </div>
  );
};
