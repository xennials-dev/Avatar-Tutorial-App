import React, { useState } from 'react';
import { Sparkles, X, Code, Zap, Smartphone, ShoppingCart, BookOpen } from 'lucide-react';

interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  icon: string;
}

interface PromptTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (prompt: string) => void;
}

const templates: PromptTemplate[] = [
  {
    id: 'saas-onboarding',
    title: 'SaaS Onboarding Flow & API Key Generation',
    category: 'SaaS',
    description: 'Step-by-step product walkthrough designed to onboard new software signups in under 45 seconds.',
    prompt: 'Create a comprehensive SaaS onboarding tutorial showing how a new developer sets up their account, navigates to API keys, generates an environment secret, and tests their first endpoint.',
    icon: 'zap',
  },
  {
    id: 'cicd-pipeline',
    title: 'GitHub Actions CI/CD Automated Deployment',
    category: 'Developer',
    description: 'Technical walkthrough of configuring YAML deployment workflows for cloud hosting with linting & test suites.',
    prompt: 'Build a developer tutorial explaining how to configure a GitHub Actions workflow file to automatically build, lint, and deploy a full-stack React and Express app to Cloud Run.',
    icon: 'code',
  },
  {
    id: 'ai-workflow',
    title: 'AI Multi-Model Router & Fallback Blueprint',
    category: 'AI / LLM',
    description: 'Demonstrating intelligent model routing across ModelScope Qwen, HuggingFace Llama, and local LLMs.',
    prompt: 'Create an AI tutorial showing how to route inference requests between ModelScope and HuggingFace models with fallback error handling, streaming tokens, and automated script generation.',
    icon: 'sparkles',
  },
  {
    id: 'mobile-gestures',
    title: 'Mobile App Gesture Controls & Settings',
    category: 'Mobile',
    description: 'Engaging UGC casual walkthrough highlighting intuitive mobile app controls, gestures, and dark mode toggles.',
    prompt: 'Design a mobile-first tutorial walkthrough demonstrating how users can interact with swipe gestures, push notification permissions, offline caching, and dark mode toggles.',
    icon: 'smartphone',
  },
  {
    id: 'ecommerce-cart',
    title: 'E-Commerce Cart & Instant Stripe Checkout',
    category: 'E-Commerce',
    description: 'Conversion-focused tutorial showcasing cart management, discount codes, and secure payment processing.',
    prompt: 'Create an e-commerce checkout tutorial highlighting secure Stripe payment integration, cart state persistence, and instant discount code application.',
    icon: 'cart',
  },
  {
    id: 'api-rate-limiting',
    title: 'Redis Token Bucket Rate Limiting Setup',
    category: 'Developer',
    description: 'Engineering how-to on protecting API endpoints with Redis sliding window rate limits.',
    prompt: 'Explain how to implement high-throughput API rate limiting in Node.js using Redis token buckets and returning 429 status codes with Retry-After headers.',
    icon: 'code',
  },
];

const categories = ['All', 'SaaS', 'Developer', 'AI / LLM', 'Mobile', 'E-Commerce'];

const iconMap: Record<string, React.ReactNode> = {
  zap: <Zap size={18} />,
  code: <Code size={18} />,
  sparkles: <Sparkles size={18} />,
  smartphone: <Smartphone size={18} />,
  cart: <ShoppingCart size={18} />,
};

export const PromptTemplatesModal: React.FC<PromptTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen) return null;

  const filtered = selectedCategory === 'All'
    ? templates
    : templates.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tutorial Prompt Template Library</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pre-engineered blueprint prompts designed for maximum AI model fidelity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-6 py-3 border-b border-white/[0.04] bg-black/30 flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates list */}
        <div className="p-6 overflow-y-auto space-y-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTemplate(item.prompt);
                onClose();
              }}
              className="w-full text-left bg-black/40 hover:bg-indigo-950/20 border border-white/[0.06] hover:border-indigo-500/40 rounded-2xl p-4.5 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                  {iconMap[item.icon] || <Sparkles size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                  <p className="text-[11px] text-zinc-400 font-mono mt-2 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04] line-clamp-2">
                    "{item.prompt}"
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
