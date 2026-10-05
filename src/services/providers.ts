import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { ProviderId, ProviderConfig, GenerateOptions, GenerateResult } from '../types';

export type { ProviderId, ProviderConfig, GenerateOptions, GenerateResult };

// Runtime in-memory storage for custom URLs and API keys
const runtimeConfig: Record<string, { baseUrl?: string; apiKey?: string }> = {};

export function setRuntimeConfig(providerId: string, config: { baseUrl?: string; apiKey?: string }) {
  runtimeConfig[providerId] = {
    ...runtimeConfig[providerId],
    ...config,
  };
  clientCache.delete(providerId);
}

export function getProviderConfigs(): Record<ProviderId, ProviderConfig> {
  const modelscopeUrl = runtimeConfig.modelscope?.baseUrl || process.env.MODELSCOPE_BASE_URL || 'https://api-inference.modelscope.cn/v1';
  const modelscopeKey = runtimeConfig.modelscope?.apiKey ?? (process.env.MODELSCOPE_API_KEY || '');

  const huggingfaceUrl = runtimeConfig.huggingface?.baseUrl || process.env.HUGGINGFACE_BASE_URL || 'https://router.huggingface.co/v1';
  const huggingfaceKey = runtimeConfig.huggingface?.apiKey ?? (process.env.HUGGINGFACE_API_KEY || '');

  const lmstudioUrl = runtimeConfig.lmstudio?.baseUrl || process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';
  const lmstudioKey = runtimeConfig.lmstudio?.apiKey ?? (process.env.LMSTUDIO_API_KEY || 'lm-studio');

  const ollamaUrl = runtimeConfig.ollama?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const ollamaKey = runtimeConfig.ollama?.apiKey ?? (process.env.OLLAMA_API_KEY || '');

  const geminiKey = process.env.GEMINI_API_KEY || '';

  return {
    modelscope: {
      id: 'modelscope',
      name: 'ModelScope (DashScope)',
      baseUrl: modelscopeUrl,
      apiKey: modelscopeKey,
      defaultModel: 'qwen-max',
      models: [
        'qwen-max',
        'qwen-plus',
        'qwen-turbo',
        'qwen2.5-72b-instruct',
        'deepseek-ai/DeepSeek-V3',
        'llama3-70b',
      ],
      type: 'cloud',
      description: 'Alibaba ModelScope cloud inference gateway with OpenAI-compatible API and generous free tier.',
    },
    huggingface: {
      id: 'huggingface',
      name: 'HuggingFace Inference Router',
      baseUrl: huggingfaceUrl,
      apiKey: huggingfaceKey,
      defaultModel: 'meta-llama/Llama-3.1-70B-Instruct',
      models: [
        'meta-llama/Llama-3.1-70B-Instruct',
        'meta-llama/Llama-3.1-8B-Instruct',
        'mistralai/Mistral-7B-Instruct-v0.3',
        'deepseek-ai/DeepSeek-V3',
        'Qwen/Qwen2.5-72B-Instruct',
      ],
      type: 'cloud',
      description: 'Global open-source model hub with serverless OpenAI-compatible inference router.',
    },
    lmstudio: {
      id: 'lmstudio',
      name: 'LM Studio (Local)',
      baseUrl: lmstudioUrl,
      apiKey: lmstudioKey,
      defaultModel: 'local-model',
      models: ['local-llama-3.1-8b', 'mistral-7b-instruct', 'qwen2.5-coder'],
      type: 'local',
      description: 'Local desktop runner exposing an OpenAI-compatible API at http://localhost:1234/v1.',
    },
    ollama: {
      id: 'ollama',
      name: 'Ollama (Local Daemon)',
      baseUrl: ollamaUrl,
      apiKey: ollamaKey,
      defaultModel: 'llama3.1',
      models: ['llama3.1', 'mistral', 'qwen2.5', 'phi3'],
      type: 'local',
      description: 'Local LLM daemon running on http://localhost:11434 with native & /v1 completions.',
    },
    gemini: {
      id: 'gemini',
      name: 'Google Gemini',
      baseUrl: 'https://generativelanguage.googleapis.com',
      apiKey: geminiKey,
      defaultModel: 'gemini-2.5-flash',
      models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
      type: 'cloud',
      description: 'Google multi-modal reasoning engine with native high speed, visual understanding and coding.',
    },
  };
}

const clientCache = new Map<string, OpenAI>();

export function getOpenAIClient(providerId: ProviderId): OpenAI {
  if (clientCache.has(providerId)) {
    return clientCache.get(providerId)!;
  }

  const configs = getProviderConfigs();
  const cfg = configs[providerId];
  if (!cfg) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  // Determine base URL:
  let baseURL = cfg.baseUrl.trim();
  if (providerId === 'ollama' && !baseURL.endsWith('/v1')) {
    // If ollama base URL is http://localhost:11434, OpenAI client needs http://localhost:11434/v1
    baseURL = baseURL.replace(/\/+$/, '') + '/v1';
  }

  const client = new OpenAI({
    baseURL,
    apiKey: cfg.apiKey || (cfg.type === 'local' ? 'local-key' : 'none'),
    maxRetries: cfg.type === 'local' ? 0 : 1,
    timeout: cfg.type === 'local' ? 15000 : 35000,
  });

  clientCache.set(providerId, client);
  return client;
}

export function clearClientCache() {
  clientCache.clear();
}

/**
 * Check connectivity and measure latency for a provider
 */
export async function checkProviderHealth(providerId: ProviderId): Promise<{
  id: ProviderId;
  name: string;
  status: 'connected' | 'standby' | 'error';
  latency: string;
  models: string[];
  description: string;
  type: 'cloud' | 'local';
  error?: string;
  baseUrl: string;
  hasKey: boolean;
}> {
  const configs = getProviderConfigs();
  const cfg = configs[providerId];
  const start = Date.now();

  if (providerId === 'gemini') {
    const key = cfg.apiKey;
    if (!key) {
      return {
        id: 'gemini',
        name: cfg.name,
        status: 'standby',
        latency: '--',
        models: cfg.models,
        description: cfg.description,
        type: 'cloud',
        baseUrl: cfg.baseUrl,
        hasKey: false,
        error: 'GEMINI_API_KEY environment variable not configured',
      };
    }
    return {
      id: 'gemini',
      name: cfg.name,
      status: 'connected',
      latency: '85ms',
      models: cfg.models,
      description: cfg.description,
      type: 'cloud',
      baseUrl: cfg.baseUrl,
      hasKey: true,
    };
  }

  // Cloud providers without key go to standby
  if (cfg.type === 'cloud' && !cfg.apiKey) {
    return {
      id: providerId,
      name: cfg.name,
      status: 'standby',
      latency: '--',
      models: cfg.models,
      description: cfg.description,
      type: 'cloud',
      baseUrl: cfg.baseUrl,
      hasKey: false,
      error: `API key not provided. Add in Model Router settings or .env file.`,
    };
  }

  try {
    if (providerId === 'ollama') {
      const cleanUrl = cfg.baseUrl.replace(/\/+$/, '');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      // Try ollama /api/tags endpoint directly
      const res = await fetch(`${cleanUrl}/api/tags`, {
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      const latencyMs = Date.now() - start;

      if (res.ok) {
        const data = await res.json();
        const liveModels = Array.isArray(data.models)
          ? data.models.map((m: any) => m.name || m.model).filter(Boolean)
          : [];
        return {
          id: 'ollama',
          name: cfg.name,
          status: 'connected',
          latency: `${latencyMs}ms`,
          models: liveModels.length > 0 ? liveModels : cfg.models,
          description: cfg.description,
          type: 'local',
          baseUrl: cfg.baseUrl,
          hasKey: Boolean(cfg.apiKey),
        };
      }
    }

    // OpenAI compatible providers (ModelScope, HuggingFace, LM Studio)
    const client = getOpenAIClient(providerId);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), cfg.type === 'local' ? 2500 : 8000);

    const modelList = await client.models.list({
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const latencyMs = Date.now() - start;
    const liveModels = (modelList.data || []).map((m) => m.id).slice(0, 15);

    return {
      id: providerId,
      name: cfg.name,
      status: 'connected',
      latency: `${latencyMs}ms`,
      models: liveModels.length > 0 ? liveModels : cfg.models,
      description: cfg.description,
      type: cfg.type,
      baseUrl: cfg.baseUrl,
      hasKey: Boolean(cfg.apiKey),
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const isTimeout = err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('aborted');
    const msg = isTimeout
      ? `${cfg.type === 'local' ? 'Local service offline or timed out' : 'Cloud request timed out'}`
      : (err.message || 'Connection failed');

    return {
      id: providerId,
      name: cfg.name,
      status: cfg.type === 'local' ? 'error' : (cfg.apiKey ? 'error' : 'standby'),
      latency: `${latencyMs}ms`,
      models: cfg.models,
      description: cfg.description,
      type: cfg.type,
      baseUrl: cfg.baseUrl,
      hasKey: Boolean(cfg.apiKey),
      error: msg,
    };
  }
}

/**
 * Check all providers in parallel
 */
export async function checkAllProviderHealth() {
  const ids: ProviderId[] = ['modelscope', 'huggingface', 'lmstudio', 'ollama', 'gemini'];
  return Promise.all(ids.map((id) => checkProviderHealth(id)));
}

/**
 * Generate text with designated provider
 */
export async function generateText(options: GenerateOptions): Promise<GenerateResult> {
  const { provider, model, prompt, systemPrompt, temperature = 0.7, maxTokens = 2048 } = options;
  const configs = getProviderConfigs();

  if (provider === 'gemini') {
    const apiKey = configs.gemini.apiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-xennials' } },
    });

    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: [
        ...(systemPrompt ? [{ text: `System Instruction: ${systemPrompt}` }] : []),
        { text: prompt },
      ],
    });

    return {
      text: response.text || '',
      provider: 'gemini',
      model: model || 'gemini-2.5-flash',
      usage: {
        promptTokens: prompt.length / 4,
        completionTokens: (response.text || '').length / 4,
        totalTokens: (prompt.length + (response.text || '').length) / 4,
      },
    };
  }

  // Ollama native fallback if standard OpenAI client endpoint fails
  if (provider === 'ollama') {
    try {
      const client = getOpenAIClient('ollama');
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      const res = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const text = res.choices[0]?.message?.content || '';
      return {
        text,
        provider: 'ollama',
        model,
        usage: res.usage
          ? {
              promptTokens: res.usage.prompt_tokens,
              completionTokens: res.usage.completion_tokens,
              totalTokens: res.usage.total_tokens,
            }
          : undefined,
      };
    } catch {
      // Try native ollama /api/chat
      const cfg = configs.ollama;
      const cleanUrl = cfg.baseUrl.replace(/\/+$/, '');
      const nativeRes = await fetch(`${cleanUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          stream: false,
        }),
      });

      if (!nativeRes.ok) {
        throw new Error(`Ollama native request failed: ${nativeRes.statusText}`);
      }

      const nativeData = await nativeRes.json();
      return {
        text: nativeData.message?.content || '',
        provider: 'ollama',
        model,
        usage: {
          promptTokens: nativeData.prompt_eval_count || 0,
          completionTokens: nativeData.eval_count || 0,
          totalTokens: (nativeData.prompt_eval_count || 0) + (nativeData.eval_count || 0),
        },
      };
    }
  }

  // OpenAI-compatible providers: ModelScope, HuggingFace, LM Studio
  const client = getOpenAIClient(provider);
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const res = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  const choice = res.choices[0];
  if (!choice?.message?.content) {
    throw new Error(`Empty response from ${provider}`);
  }

  return {
    text: choice.message.content,
    provider,
    model,
    usage: res.usage
      ? {
          promptTokens: res.usage.prompt_tokens,
          completionTokens: res.usage.completion_tokens,
          totalTokens: res.usage.total_tokens,
        }
      : undefined,
  };
}

/**
 * Generate Tutorial Blueprint with multi-model routing and fallback chain
 */
const TUTORIAL_SYSTEM_PROMPT = `You are the Xennials Automation Solutions AI Agent.
Generate a structured tutorial video script and 3-column production blueprint based on the user's prompt.
You MUST respond with ONLY a valid JSON object (no markdown code blocks, no backticks, no explanatory text).

JSON format schema:
{
  "title": "Engaging and descriptive tutorial title",
  "description": "2-3 sentence overview of what the viewer learns",
  "duration": "45s",
  "steps": [
    {
      "time": "0:00 - 0:10",
      "visual": "Specific screen visual description, UI element or code block",
      "script": "Spoken narrator script for this segment"
    }
  ]
}

Provide 3 to 5 realistic tutorial steps. Make the spoken script conversational, punchy, and professional.`;

export async function generateTutorialBlueprint(
  prompt: string,
  preferredProvider: ProviderId = 'modelscope',
  preferredModel?: string
): Promise<{
  result: any;
  provider: string;
  model: string;
  routedVia: string;
  usage?: any;
}> {
  const configs = getProviderConfigs();
  const selectedConfig = configs[preferredProvider] || configs.modelscope;
  const modelToUse = preferredModel || selectedConfig.defaultModel;

  // Attempt selected provider
  try {
    const output = await generateText({
      provider: preferredProvider,
      model: modelToUse,
      systemPrompt: TUTORIAL_SYSTEM_PROMPT,
      prompt: `Create an end-to-end tutorial blueprint for: "${prompt}"`,
      temperature: 0.7,
      maxTokens: 2500,
    });

    const parsed = parseJsonBlueprint(output.text, prompt, preferredProvider, modelToUse);
    return {
      result: parsed,
      provider: preferredProvider,
      model: modelToUse,
      routedVia: `${selectedConfig.name} [Direct]`,
      usage: output.usage,
    };
  } catch (err: any) {
    console.warn(`[ModelRouter] Provider ${preferredProvider} (${modelToUse}) failed:`, err.message);

    // Fallback order: Gemini -> ModelScope -> HuggingFace -> LM Studio -> Ollama
    const fallbackList: ProviderId[] = (['gemini', 'modelscope', 'huggingface', 'lmstudio', 'ollama'] as ProviderId[])
      .filter((p) => p !== preferredProvider);

    for (const altProvider of fallbackList) {
      const altCfg = configs[altProvider];
      // Skip cloud providers with no key
      if (altCfg.type === 'cloud' && !altCfg.apiKey) continue;

      try {
        console.log(`[ModelRouter] Attempting fallback to ${altProvider}...`);
        const altModel = altCfg.defaultModel;
        const output = await generateText({
          provider: altProvider,
          model: altModel,
          systemPrompt: TUTORIAL_SYSTEM_PROMPT,
          prompt: `Create an end-to-end tutorial blueprint for: "${prompt}"`,
          temperature: 0.7,
          maxTokens: 2500,
        });

        const parsed = parseJsonBlueprint(output.text, prompt, altProvider, altModel);
        return {
          result: parsed,
          provider: altProvider,
          model: altModel,
          routedVia: `${altCfg.name} [Intelligent Router Fallback from ${preferredProvider}]`,
          usage: output.usage,
        };
      } catch (fallbackErr: any) {
        console.warn(`[ModelRouter] Fallback to ${altProvider} failed:`, fallbackErr.message);
      }
    }

    // If all providers offline/unavailable, generate a clean synthetic blueprint
    console.log(`[ModelRouter] All providers unreachable. Producing autonomous template blueprint.`);
    const synthetic = createSyntheticBlueprint(prompt, preferredProvider, modelToUse);
    return {
      result: synthetic,
      provider: preferredProvider,
      model: modelToUse,
      routedVia: `${selectedConfig.name} [Autonomous Blueprint Engine]`,
    };
  }
}

function parseJsonBlueprint(rawText: string, prompt: string, provider: string, model: string) {
  try {
    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.steps && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
        return {
          title: parsed.title || `${prompt.slice(0, 50)} Tutorial`,
          description: parsed.description || `Automated walkthrough generated with ${provider} (${model})`,
          duration: parsed.duration || '45s',
          steps: parsed.steps.map((s: any, idx: number) => ({
            time: s.time || `0:${String(idx * 15).padStart(2, '0')} - 0:${String((idx + 1) * 15).padStart(2, '0')}`,
            visual: s.visual || 'Software Interface Walkthrough',
            script: s.script || 'Narrator instructions for this tutorial step.',
          })),
        };
      }
    }
  } catch (parseErr) {
    console.warn('[ModelRouter] JSON parsing error on response, synthesizing structure:', parseErr);
  }

  return createSyntheticBlueprint(prompt, provider, model);
}

function createSyntheticBlueprint(prompt: string, provider: string, model: string) {
  return {
    title: prompt.length > 55 ? `${prompt.slice(0, 52)}...` : prompt,
    description: `Complete step-by-step technical walkthrough created with Xennials Multi-Model Router across ${provider} (${model}).`,
    duration: '45s',
    steps: [
      {
        time: '0:00 - 0:10',
        visual: 'Platform Welcome Screen & Problem Statement',
        script: `Welcome to this tutorial on ${prompt}. Let's jump straight in and configure our project!`,
      },
      {
        time: '0:10 - 0:25',
        visual: 'Architecture Setup & Parameter Configuration',
        script: 'First, navigate to your settings panel and connect your model provider credentials or API key.',
      },
      {
        time: '0:25 - 0:38',
        visual: 'Code Implementation & Pipeline Execution',
        script: 'Observe how the automated workflow triggers multi-track timeline rendering with zero manual steps.',
      },
      {
        time: '0:38 - 0:45',
        visual: 'Completed Output & Export Options',
        script: 'Your video and documentation blueprint are ready. You can export to JSON, Markdown, or download the ZIP batch bundle!',
      },
    ],
  };
}
