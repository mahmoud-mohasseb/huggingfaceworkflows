'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Bot, Database, Rocket, HardDrive, Bookmark, Users,
  Cpu, Key, CreditCard, Bell, Shield, ArrowRight, ExternalLink,
  CheckCircle2, Copy, Check, Info, Code, Play, Layers, ChevronRight,
  Terminal, Globe, Zap, FileText, Settings, HelpCircle, ArrowLeft
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  menuItem: string;
  icon: any;
  color: string;
  badge: string;
  summary: string;
  hfExplanation: string;
  hfSteps: string[];
  integrationExplanation: string;
  integrationSteps: string[];
  codeSnippet?: {
    lang: string;
    code: string;
    caption: string;
  };
  tips: string[];
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'models',
    title: 'New Model Hosting & Router Integration',
    menuItem: '+ New Model',
    icon: Bot,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    badge: 'Inference & LLMs',
    summary: 'Host custom weights (LoRA adapters, SafeTensors, GGUF) and connect any open-weights model to your visual workflows.',
    hfExplanation: 'Hugging Face Models repository is Git-based cloud storage for neural network weights, tokenizers, and model configuration files. It supports PyTorch, SafeTensors, Transformers, Diffusers, ONNX, and GGUF formats.',
    hfSteps: [
      'Click your profile picture in the top-right and select "+ New Model".',
      'Choose an Owner (Personal account or Organization) and enter a Model Name (e.g. "my-llama3-support-agent").',
      'Select License (e.g. Apache 2.0 or MIT) and Visibility (Public or Private).',
      'Upload weights via Web UI, Git CLI (`git clone https://huggingface.co/username/my-model`), or Python `huggingface_hub`.',
      'In the Model Card (`README.md`), specify the pipeline tag (e.g., `text-generation`, `image-to-text`, `text-to-image`).'
    ],
    integrationExplanation: 'Once hosted on Hugging Face, your model can be invoked immediately inside your workflows using the Serverless Inference API without managing any cloud servers.',
    integrationSteps: [
      'In this platform, open Canvas Studio and add a "Hugging Face Model Router" or "FLUX.1 Image Gen" node.',
      'In the Model ID field, enter your full repository ID: `your-username/my-model`.',
      'The platform will automatically authenticate using your Hugging Face Access Token.',
      'Connect the node to Telegram / WhatsApp triggers to reply automatically with your custom model!'
    ],
    codeSnippet: {
      lang: 'typescript',
      caption: 'Direct Node.js / API Invocation:',
      code: `// Calling your Hugging Face Model via Serverless Router
const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.HF_TOKEN}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'your-username/my-llama3-support-agent',
    messages: [{ role: 'user', content: 'Customer inquiry message...' }],
    temperature: 0.7,
    max_tokens: 512,
  }),
});
const result = await response.json();`
    },
    tips: [
      'Use SafeTensors format for 3x faster cold-start initialization.',
      'Ensure your model has Serverless Inference enabled in its Settings tab on Hugging Face.'
    ]
  },

  {
    id: 'datasets',
    title: 'New Dataset & Automatic Hub Backup Engine',
    menuItem: '+ New Dataset',
    icon: Database,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    badge: 'Data & Storage',
    summary: 'Cloud repositories for conversation transcripts, workflow state graphs, training samples, and persistent versioned storage.',
    hfExplanation: 'Hugging Face Datasets are version-controlled data repositories supporting Parquet, CSV, JSONL, and binary formats. Every dataset comes with a built-in Dataset Viewer and Git commit history.',
    hfSteps: [
      'Click your profile picture in the top-right and select "+ New Dataset".',
      'Enter a Dataset Name (e.g. "hf-workflow-data" or "telegram-bot-conversations").',
      'Set Visibility to "Private" if storing confidential customer chats or credentials.',
      'Click "Create Dataset". You can push files via Git, Web UI, or the Hugging Face REST API.'
    ],
    integrationExplanation: 'This platform includes a built-in Hugging Face Hub Storage Provider. Every time you save a workflow or receive inbound bot messages, the platform can commit the state directly to your HF Dataset!',
    integrationSteps: [
      'Go to Settings > Storage Provider in this platform.',
      'Enter your Dataset ID: `your-username/hf-workflow-data`.',
      'Click "Test Hub Connection". The platform will verify read/write access via your HF Write Token.',
      'Your visual workflows, node positions, and execution logs will automatically sync with full Git history on Hugging Face.'
    ],
    codeSnippet: {
      lang: 'typescript',
      caption: 'Hub Dataset Sync Logic (from lib/storage/huggingface.ts):',
      code: `// Committing workflow graphs directly to Hugging Face Dataset
import { HfInference } from '@huggingface/inference';

async function backupWorkflowToHub(datasetId: string, workflowJson: object, token: string) {
  const commitUrl = \`https://huggingface.co/api/datasets/\${datasetId}/commit/main\`;
  const fileContent = Buffer.from(JSON.stringify(workflowJson, null, 2)).toString('base64');
  
  await fetch(commitUrl, {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${token}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operations: [{
        operation: 'add',
        path: 'workflows/backup.json',
        content: fileContent,
      }],
      commit_message: 'Sync workflow state graph from HFworkflow Platform',
    }),
  });
}`
    },
    tips: [
      'Use Private Datasets to ensure proprietary prompt templates and customer conversations remain secure.',
      'Datasets provide free unlimited public storage and 100 GB private storage.'
    ]
  },

  {
    id: 'spaces',
    title: 'New Space & ZeroGPU Cloud Execution',
    menuItem: '+ New Space',
    icon: Rocket,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    badge: 'Hardware & Apps',
    summary: 'Deploy interactive AI web applications, Python APIs, and Gradio microservices powered by free Nvidia A100/H100 ZeroGPUs.',
    hfExplanation: 'Hugging Face Spaces allows you to host web applications using Gradio, Streamlit, Static HTML, or Docker. With ZeroGPU, you get free on-demand dynamic access to high-end Nvidia A100 (80GB) GPUs.',
    hfSteps: [
      'Click your profile menu and select "+ New Space".',
      'Enter a Space Name (e.g. "flux-photo-generator" or "custom-whisper-service").',
      'Select the Space SDK: Choose **Gradio** (recommended for AI APIs) or **Docker**.',
      'Choose Space Hardware: Select **ZeroGPU (Nvidia A100 80GB - Free)**.',
      'Create `app.py` with your AI logic and decorate GPU functions with `@spaces.GPU`.'
    ],
    integrationExplanation: 'You can directly connect any public or private Hugging Face Space into your workflow canvas using the "Gradio ZeroGPU Space" node to offload heavy neural compute.',
    integrationSteps: [
      'In Canvas Studio, drag the "Gradio ZeroGPU Space" node onto the visual board.',
      'Enter the Space ID (e.g. `black-forest-labs/FLUX.1-schnell` or `your-username/my-space`).',
      'Specify the API endpoint (default is `/predict`).',
      'Connect the incoming prompt from Telegram/WhatsApp and pipe the output to media reply nodes!'
    ],
    codeSnippet: {
      lang: 'python',
      caption: 'Gradio ZeroGPU app.py Template:',
      code: `import gradio as gr
import spaces
import torch
from diffusers import FluxPipeline

# Load model weights onto CPU first
pipe = FluxPipeline.from_pretrained("black-forest-labs/FLUX.1-schnell", torch_dtype=torch.bfloat16)

# ZeroGPU decorator grants dynamic Nvidia A100 hardware on execution
@spaces.GPU
def generate(prompt):
    pipe.to("cuda")
    image = pipe(prompt, num_inference_steps=4, guidance_scale=0.0).images[0]
    return image

demo = gr.Interface(fn=generate, inputs="text", outputs="image")
demo.launch()`
    },
    tips: [
      'ZeroGPU spaces are free and give you 5 minutes of bursting GPU compute per session.',
      'Gradio automatically exposes a REST API via `/api/predict` that our canvas calls seamlessly.'
    ]
  },

  {
    id: 'buckets',
    title: 'New Bucket (Object Storage / Cloudflare R2 / S3)',
    menuItem: '+ New Bucket',
    icon: HardDrive,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    badge: 'Media Storage',
    summary: 'S3-compatible high-speed cloud object storage with zero egress bandwidth charges for FLUX.1 4K images, ZeroScope MP4 videos, and audio tracks.',
    hfExplanation: 'Buckets provide high-throughput, low-latency object storage for binary assets, media files, datasets, and model checkpoints. Paired with Cloudflare R2, it has $0 egress fees worldwide.',
    hfSteps: [
      'Click "+ New Bucket" on Hugging Face (or create an R2 Bucket in Cloudflare Dashboard).',
      'Name your bucket: `hf-workflow-media`.',
      'Generate S3-compatible Access Keys (Access Key ID & Secret Access Key).',
      'Enable Public Access or configure a custom subdomain (e.g. `https://pub-your-id.r2.dev`).'
    ],
    integrationExplanation: 'Media generated by FLUX.1, ZeroScope, and MusicGen nodes is automatically uploaded to your Bucket, returning permanent public URLs for instant delivery across Telegram and WhatsApp.',
    integrationSteps: [
      'Open your project `.env.local` or Settings > Storage Configuration.',
      'Add `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`.',
      'Set `R2_PUBLIC_URL` to your bucket CDN domain.',
      'All visual media generated in your workflows will automatically be saved and delivered via CDN.'
    ],
    codeSnippet: {
      lang: 'typescript',
      caption: 'Cloudflare R2 / S3 Upload Script:',
      code: `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: \`https://\${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com\`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadMedia(filename: string, buffer: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  }));
  return \`\${process.env.R2_PUBLIC_URL}/\${filename}\`;
}`
    },
    tips: [
      'Cloudflare R2 gives you 10 GB free storage, 10 Million read requests, and 1 Million write requests per month for free.',
      'Never pay bandwidth egress fees when sending generated videos to Telegram or WhatsApp!'
    ]
  },

  {
    id: 'collections',
    title: 'New Collection & Workflow Bundles',
    menuItem: '+ New Collection',
    icon: Bookmark,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    badge: 'Organization',
    summary: 'Curate, organize, and showcase bundles of models, datasets, spaces, and workflow templates into shareable playlists.',
    hfExplanation: 'Collections allow you to group related Hugging Face assets (models, papers, datasets, spaces) into a single showcase page that can be shared with the open-source community.',
    hfSteps: [
      'Click your profile menu and select "+ New Collection".',
      'Enter a Title (e.g. "Omnichannel AI Customer Support Stack").',
      'Write a description outlining the pipeline architecture.',
      'Browse any Model, Space, or Dataset on Hugging Face and click the bookmark button to add it to your collection.'
    ],
    integrationExplanation: 'You can organize all the models and spaces used in your visual workflows into a single collection so your team can deploy full multi-modal stacks with 1 click.',
    integrationSteps: [
      'Group your foundational LLM (Llama 3.3), Vision model (Llama 3.2 Vision), and Image model (FLUX.1) in one collection.',
      'Link the collection URL in your workflow documentation or README.',
      'Team members can clone the entire stack directly onto their canvas.'
    ],
    tips: [
      'Pin your collections to the top of your Hugging Face profile for community visibility.',
      'Use collections to maintain versioned staging vs production model stacks.'
    ]
  },

  {
    id: 'organization',
    title: 'Create Organization for Team Collaboration',
    menuItem: 'Create organization',
    icon: Users,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    badge: 'Enterprise & Teams',
    summary: 'Team workspaces with shared GPU quotas, collaborative datasets, organization access tokens, and centralized billing.',
    hfExplanation: 'Hugging Face Organizations provide centralized access control and shared billing for companies, research labs, and developer teams.',
    hfSteps: [
      'Click your profile menu and select "Create organization".',
      'Enter an Organization Name (e.g. "acme-ai-workflows") and display name.',
      'Invite team members via email or Hugging Face username with role-based permissions (Admin, Write, Read).',
      'Configure organization-level billing and dedicated Inference Endpoints.'
    ],
    integrationExplanation: 'By setting an Organization Access Token in this platform, all team members can build and execute workflows against shared private models and enterprise datasets.',
    integrationSteps: [
      'Generate an Access Token under your Organization settings.',
      'Enter the token in this platform during login or in Settings.',
      'All created workflows and dataset backups will belong to your organization account.'
    ],
    tips: [
      'Organization tokens ensure workflows don’t break if an individual team member departs.',
      'Organizations can pool ZeroGPU and serverless inference quotas.'
    ]
  },

  {
    id: 'quotas',
    title: 'Usage Quota, Storage & Hardware Explained',
    menuItem: 'Usage Quota (Private, Public, ZeroGPU, Inference)',
    icon: Cpu,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    badge: 'Hardware & Limits',
    summary: 'Understanding storage limits, ZeroGPU compute bursts, and serverless inference credits on the free vs PRO tiers.',
    hfExplanation: 'Hugging Face provides generous free tiers across all resources, with optional PRO upgrades for heavy production workloads.',
    hfSteps: [
      '**Private Storage (100 GB Free)**: Free Git LFS storage for private models and datasets. Easily expandable with PRO.',
      '**Public Storage (Unlimited)**: Host open-source models and datasets with no storage caps.',
      '**ZeroGPU (5 min free bursting)**: Dynamic allocations of Nvidia A100 GPUs that renew automatically.',
      '**Inference Usage ($0.10 free / mo)**: Free serverless inference API quota that handles thousands of daily text queries.'
    ],
    integrationExplanation: 'Our workflow engine automatically monitors quota consumption, calculates step-by-step credit costs, and includes intelligent retries to prevent cold-start timeouts.',
    integrationSteps: [
      'Track real-time credit metrics in the Canvas Studio top-bar.',
      'If you hit rate limits, the executor automatically falls back to lightweight quantized models.',
      'For production traffic (10,000+ daily requests), upgrade to Hugging Face PRO ($9/mo) for 8x higher concurrency.'
    ],
    tips: [
      'Free tier is 100% sufficient for developing, prototyping, and testing all 12 visual templates!',
      'ZeroGPU resets every few minutes, making it ideal for on-demand image and video rendering.'
    ]
  },

  {
    id: 'tokens',
    title: 'Access Tokens, Settings & Secure Login',
    menuItem: 'Access Tokens & Settings',
    icon: Key,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    badge: 'Authentication & Security',
    summary: 'Generate fine-grained Write tokens with proper permissions to unlock full automation and 1-click cloud sync.',
    hfExplanation: 'Hugging Face User Access Tokens authenticate your API calls, CLI sessions, and third-party integrations with granular permission scopes.',
    hfSteps: [
      'Go to https://huggingface.co/settings/tokens.',
      'Click "+ New token" (or "Create new token").',
      'Select Token Type: Choose **Write** (or Fine-grained with `repo.write` and `inference.serverless` permissions).',
      'Name your token: `hf-workflows-app`.',
      'Click "Generate a token" and copy the `hf_...` string.'
    ],
    integrationExplanation: 'Paste your Write Token into the Login Page or Settings in this application to immediately unlock full visual workflow execution and dataset backups.',
    integrationSteps: [
      'Navigate to `/login` or `/settings` in this platform.',
      'Paste your `hf_...` Write Token into the input field.',
      'Click "Sign In with Hugging Face Token".',
      'The platform validates your token, loads your personal models & spaces, and unlocks the visual canvas!'
    ],
    codeSnippet: {
      lang: 'bash',
      caption: 'Testing Token via cURL:',
      code: `# Verify your Hugging Face Access Token
curl -X GET https://huggingface.co/api/whoami-v2 \\
  -H "Authorization: Bearer hf_yourTokenHere"`
    },
    tips: [
      'Always use a Write Token so the application can back up your workflow DAGs to Hub datasets.',
      'Your token is stored securely in encrypted local browser storage and is never sent to third parties.'
    ]
  }
];

export default function PlatformMasterGuidePage() {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('models');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const selectedSection = GUIDE_SECTIONS.find(s => s.id === selectedSectionId) || GUIDE_SECTIONS[0];

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-7xl mx-auto space-y-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400">
            <Link href="/workflows" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Workflows
            </Link>
            <span>/</span>
            <span className="text-slate-400">Hugging Face Ecosystem Master Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <span>🤗 Hugging Face Ecosystem & Integration Guide</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
            Step-by-step master walkthrough explaining every option in the Hugging Face profile menu and how to integrate Models, Datasets, Spaces, Buckets, and Tokens into this workflow platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/canvas/wf_telegram_ai_bot"
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> Open Canvas Studio
          </Link>
          <a
            href="https://huggingface.co/settings/tokens"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all"
          >
            <span>HF Tokens</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Menu Explorer (Interactive Replica of the Hugging Face Profile Menu) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-amber-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  🤗
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Hugging Face Profile Menu</div>
                  <div className="text-[10px] font-mono text-slate-400">Click any item to view instructions</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Guide
              </span>
            </div>

            {/* Menu Items List */}
            <div className="space-y-1.5 pt-1">
              {GUIDE_SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isSelected = selectedSectionId === sec.id;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-violet-600/20 border border-violet-500/50 shadow-md shadow-violet-950/40 text-white'
                        : 'bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${sec.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono group-hover:text-violet-300 transition-colors">
                          {sec.menuItem}
                        </div>
                        <div className="text-[10px] text-slate-400">{sec.badge}</div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-violet-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Quick Helper Alert */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <span>
                Select any item above to see exact steps for creating it on Hugging Face and integrating it into this platform.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Step-by-Step Walkthrough Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Header Badge & Title */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${selectedSection.color}`}>
                  {React.createElement(selectedSection.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold">
                    {selectedSection.menuItem}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                    {selectedSection.title}
                  </h2>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30">
                {selectedSection.badge}
              </span>
            </div>

            {/* Overview Summary */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                📖 Overview & Purpose
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedSection.hfExplanation}
              </p>
            </div>

            {/* Part 1: How to create on Hugging Face */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span>How to Create on Hugging Face:</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {selectedSection.hfSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/70 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Part 2: How to integrate into this Website */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span>How to Integrate into This Website:</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                {selectedSection.integrationExplanation}
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {selectedSection.integrationSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/70 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Part 3: Code Snippet (if available) */}
            {selectedSection.codeSnippet && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-violet-400" />
                    <span>{selectedSection.codeSnippet.caption}</span>
                  </span>
                  <button
                    onClick={() => handleCopy(selectedSection.codeSnippet!.code, selectedSection.id)}
                    className="flex items-center gap-1 text-[11px] font-mono text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {copiedCode === selectedSection.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === selectedSection.id ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed shadow-inner">
                  {selectedSection.codeSnippet.code}
                </pre>
              </div>
            )}

            {/* Part 4: Pro Tips & Best Practices */}
            {selectedSection.tips.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-2 text-xs text-amber-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>💡 Pro Tips & Best Practices:</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-amber-200/90 leading-relaxed">
                  {selectedSection.tips.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <Link
                href="/canvas/wf_telegram_ai_bot"
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all"
              >
                <span>Test this in Canvas Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://huggingface.co"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono transition-colors"
              >
                <span>Go to Hugging Face</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
