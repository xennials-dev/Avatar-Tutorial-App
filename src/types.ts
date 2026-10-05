export interface TutorialStep {
  time: string;
  visual: string;
  script: string;
}

export interface ProjectVersion {
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
}

export interface TutorialProject {
  id: string;
  title: string;
  description: string;
  duration: string;
  avatar: string;
  voice: string;
  status: 'Ready' | 'Rendering' | 'Draft' | 'Failed';
  provider: string;
  model: string;
  createdAt: string;
  thumbnailUrl?: string;
  steps: TutorialStep[];
  version?: number;
  prompt?: string;
  history?: ProjectVersion[];
}

export interface ModelProvider {
  id: string;
  name: string;
  status: 'connected' | 'standby' | 'error';
  latency: string;
  models: string[];
  description: string;
  type?: 'cloud' | 'local';
  error?: string;
  baseUrl?: string;
  hasKey?: boolean;
}

export type ActiveTab =
  | 'dashboard'
  | 'generator'
  | 'models'
  | 'avatars'
  | 'projects'
  | 'automation';

export interface BatchQueueItem {
  id: string;
  prompt: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  error?: string;
}

export type ProviderId = 'modelscope' | 'huggingface' | 'lmstudio' | 'ollama' | 'gemini';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  baseUrl: string;
  apiKey: string;
  models: string[];
  type: 'cloud' | 'local';
  description: string;
  defaultModel: string;
}

export interface GenerateOptions {
  provider: ProviderId;
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResult {
  text: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
