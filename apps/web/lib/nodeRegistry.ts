import { NodeDefinition, NodeType } from '../../../packages/shared-types';

export const NODE_REGISTRY: Record<NodeType, NodeDefinition> = {
  telegram_trigger: {
    type: 'telegram_trigger',
    title: 'Telegram Trigger',
    category: 'triggers',
    categoryLabel: 'Triggers & Webhooks',
    description: 'Fires when a Telegram user sends a message or command to your bot.',
    iconName: 'Send',
    accentColor: '#38bdf8', // Sky 400
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'Webhook: /api/webhooks/telegram',
    inputs: [],
    outputs: [
      { id: 'chat_id', label: 'Chat ID', type: 'string', color: '#38bdf8' },
      { id: 'sender_name', label: 'Sender Name', type: 'string', color: '#38bdf8' },
      { id: 'text', label: 'Message Text', type: 'string', color: '#38bdf8' },
      { id: 'raw_event', label: 'Raw Event', type: 'object', color: '#a855f7' },
    ],
    schema: [
      {
        id: 'bot_token',
        label: 'Bot API Token',
        type: 'secret',
        placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
        description: 'Obtain from @BotFather on Telegram',
      },
      {
        id: 'webhook_url',
        label: 'Webhook Path',
        type: 'text',
        defaultValue: 'https://hfworkflow.app/api/webhooks/telegram',
        description: 'Automatically registered endpoint for Telegram updates',
      },
      {
        id: 'listen_commands',
        label: 'Listen to Commands',
        type: 'text',
        defaultValue: '/start, /help, /ai',
        placeholder: '/start, /ask',
        description: 'Comma separated command filters',
      },
    ],
    defaultConfig: {
      bot_token: '7910482910:AAH-x94aK_demo_token',
      webhook_url: 'https://hfworkflow.app/api/webhooks/telegram',
      listen_commands: '/start, /help, /ai',
    },
  },

  whatsapp_trigger: {
    type: 'whatsapp_trigger',
    title: 'WhatsApp Trigger',
    category: 'triggers',
    categoryLabel: 'Triggers & Webhooks',
    description: 'Listen to inbound WhatsApp Cloud API messages and media attachments.',
    iconName: 'MessageSquare',
    accentColor: '#4ade80', // Green 400
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'WhatsApp Cloud API Webhook',
    inputs: [],
    outputs: [
      { id: 'phone_number', label: 'Phone Number', type: 'string', color: '#4ade80' },
      { id: 'sender_name', label: 'Sender Name', type: 'string', color: '#4ade80' },
      { id: 'message_body', label: 'Message Body', type: 'string', color: '#4ade80' },
      { id: 'media_url', label: 'Media URL', type: 'image', color: '#f43f5e' },
    ],
    schema: [
      {
        id: 'phone_number_id',
        label: 'Phone Number ID',
        type: 'text',
        placeholder: '10928374650',
      },
      {
        id: 'access_token',
        label: 'Meta Permanent Token',
        type: 'secret',
        placeholder: 'EAAG...',
      },
      {
        id: 'event_filter',
        label: 'Event Filter',
        type: 'select',
        defaultValue: 'messages_and_media',
        options: [
          { label: 'All Inbound Messages & Media', value: 'messages_and_media' },
          { label: 'Text Messages Only', value: 'text_only' },
          { label: 'Media Attachments Only', value: 'media_only' },
        ],
      },
    ],
    defaultConfig: {
      phone_number_id: '1088492019482',
      access_token: 'EAAG_demo_whatsapp_meta_token',
      event_filter: 'messages_and_media',
    },
  },

  gradio_space: {
    type: 'gradio_space',
    title: 'Gradio Space',
    category: 'models',
    categoryLabel: 'Hugging Face Models',
    description: 'Invoke any Hugging Face Gradio Space (e.g. FLUX.1, SDXL, Whisper).',
    iconName: 'Sparkles',
    accentColor: '#f59e0b', // Amber 500
    badge: 'Credits',
    creditCost: 15,
    defaultSubtitle: 'black-forest-labs/FLUX.1-schnell',
    inputs: [
      { id: 'prompt', label: 'Prompt Text', type: 'string', color: '#38bdf8' },
      { id: 'negative_prompt', label: 'Negative Prompt', type: 'string', color: '#94a3b8' },
      { id: 'image_input', label: 'Input Image', type: 'image', color: '#f43f5e' },
    ],
    outputs: [
      { id: 'image_url', label: 'Output Image', type: 'image', color: '#f43f5e' },
      { id: 'audio_url', label: 'Output Audio', type: 'audio', color: '#a855f7' },
      { id: 'status', label: 'Execution Status', type: 'string', color: '#4ade80' },
    ],
    schema: [
      {
        id: 'space_slug',
        label: 'Gradio Space Repository',
        type: 'select',
        defaultValue: 'black-forest-labs/FLUX.1-schnell',
        options: [
          { label: 'FLUX.1 Schnell (Fast Text-to-Image)', value: 'black-forest-labs/FLUX.1-schnell' },
          { label: 'Stable Diffusion XL (Base 1.0)', value: 'stabilityai/stable-diffusion-xl-base-1.0' },
          { label: 'Whisper Large v3 (Audio Speech-to-Text)', value: 'openai/whisper-large-v3' },
          { label: 'MusicGen Stereo (Text-to-Music)', value: 'facebook/musicgen-stereo' },
        ],
      },
      {
        id: 'guidance_scale',
        label: 'Guidance Scale (CFG)',
        type: 'slider',
        min: 1,
        max: 20,
        step: 0.5,
        defaultValue: 7.5,
      },
      {
        id: 'num_inference_steps',
        label: 'Inference Steps',
        type: 'slider',
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 4,
      },
      {
        id: 'seed',
        label: 'Random Seed',
        type: 'text',
        defaultValue: '42',
        placeholder: '42 or random',
      },
    ],
    defaultConfig: {
      space_slug: 'black-forest-labs/FLUX.1-schnell',
      guidance_scale: 7.5,
      num_inference_steps: 4,
      seed: '42',
    },
  },

  hf_router: {
    type: 'hf_router',
    title: 'HuggingFace Router',
    category: 'models',
    categoryLabel: 'Hugging Face Models',
    description: 'Serverless API routing to top-tier LLMs hosted on Hugging Face Hub.',
    iconName: 'Cpu',
    accentColor: '#a855f7', // Purple 500
    badge: 'Credits',
    creditCost: 5,
    defaultSubtitle: 'meta-llama/Llama-3.3-70B-Instruct',
    inputs: [
      { id: 'system_prompt', label: 'System Instructions', type: 'string', color: '#94a3b8' },
      { id: 'user_prompt', label: 'User Prompt', type: 'string', color: '#38bdf8' },
      { id: 'context', label: 'Additional Context', type: 'object', color: '#a855f7' },
    ],
    outputs: [
      { id: 'response_text', label: 'Response Text', type: 'string', color: '#38bdf8' },
      { id: 'token_count', label: 'Tokens Used', type: 'number', color: '#f59e0b' },
      { id: 'model_id', label: 'Model ID', type: 'string', color: '#a855f7' },
    ],
    schema: [
      {
        id: 'model_id',
        label: 'Target HuggingFace Model',
        type: 'select',
        defaultValue: 'meta-llama/Llama-3.3-70B-Instruct',
        options: [
          { label: 'Llama 3.3 70B Instruct (Meta)', value: 'meta-llama/Llama-3.3-70B-Instruct' },
          { label: 'Qwen 2.5 72B Instruct (Alibaba)', value: 'Qwen/Qwen2.5-72B-Instruct' },
          { label: 'Mixtral 8x7B Instruct (Mistral AI)', value: 'mistralai/Mixtral-8x7B-Instruct-v0.1' },
          { label: 'DeepSeek R1 Distill Qwen 32B', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B' },
        ],
      },
      {
        id: 'temperature',
        label: 'Temperature',
        type: 'slider',
        min: 0,
        max: 1.5,
        step: 0.1,
        defaultValue: 0.7,
      },
      {
        id: 'max_new_tokens',
        label: 'Max New Tokens',
        type: 'slider',
        min: 128,
        max: 4096,
        step: 128,
        defaultValue: 1024,
      },
      {
        id: 'hf_token',
        label: '🤗 HuggingFace Token (hf_...)',
        type: 'secret',
        placeholder: 'hf_...',
        description: 'Optional override. Defaults to session token from /login.',
      },
      {
        id: 'system_template',
        label: 'System Prompt Template',
        type: 'textarea',
        defaultValue: 'You are a helpful, professional customer support AI assistant powered by Hugging Face.',
      },
    ],
    defaultConfig: {
      hf_token: '',
      model_id: 'meta-llama/Llama-3.3-70B-Instruct',
      temperature: 0.7,
      max_new_tokens: 1024,
      system_template: 'You are a helpful, professional customer support AI assistant powered by Hugging Face.',
    },
  },

  hf_image_gen: {
    type: 'hf_image_gen',
    title: 'HF Free Image Gen',
    category: 'models',
    categoryLabel: 'Hugging Face Models',
    description: 'Generate high-resolution AI art and images using free Hugging Face models (FLUX.1, SDXL).',
    iconName: 'Sparkles',
    accentColor: '#f43f5e', // Rose 500
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'black-forest-labs/FLUX.1-schnell',
    inputs: [
      { id: 'prompt', label: 'Prompt Text', type: 'string', color: '#38bdf8' },
      { id: 'negative_prompt', label: 'Negative Prompt', type: 'string', color: '#94a3b8' },
    ],
    outputs: [
      { id: 'image_url', label: 'Output Image URL', type: 'image', color: '#f43f5e' },
      { id: 'status', label: 'Status', type: 'string', color: '#4ade80' },
    ],
    schema: [
      {
        id: 'model_id',
        label: 'Target Image Model',
        type: 'select',
        defaultValue: 'black-forest-labs/FLUX.1-schnell',
        options: [
          { label: 'FLUX.1 Schnell (Black Forest Labs Free)', value: 'black-forest-labs/FLUX.1-schnell' },
          { label: 'SDXL 1.0 Base (Stability AI Free)', value: 'stabilityai/stable-diffusion-xl-base-1.0' },
          { label: 'Stable Diffusion 1.5 (RunwayML Free)', value: 'runwayml/stable-diffusion-v1-5' },
          { label: 'SDXL Lightning (ByteDance 4-Step)', value: 'bytedance/sdxl-lightning-4step' },
          { label: 'Stable Diffusion 3.5 Large (Stability AI)', value: 'stabilityai/stable-diffusion-3.5-large' },
        ],
      },
      {
        id: 'prompt_template',
        label: 'Prompt Template',
        type: 'textarea',
        defaultValue: '{{ $node["Telegram Trigger"].text }}',
      },
    ],
    defaultConfig: {
      model_id: 'black-forest-labs/FLUX.1-schnell',
      prompt_template: '{{ $node["Telegram Trigger"].text }}',
    },
  },

  hf_music_gen: {
    type: 'hf_music_gen',
    title: 'HF Free Music & Audio',
    category: 'models',
    categoryLabel: 'Hugging Face Models',
    description: 'Generate original background music, sound tracks, and audio clips using MusicGen.',
    iconName: 'Cpu',
    accentColor: '#06b6d4', // Cyan 500
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'facebook/musicgen-small',
    inputs: [
      { id: 'prompt', label: 'Music Description', type: 'string', color: '#38bdf8' },
    ],
    outputs: [
      { id: 'audio_url', label: 'Audio File URL', type: 'audio', color: '#06b6d4' },
      { id: 'duration', label: 'Duration (s)', type: 'number', color: '#f59e0b' },
    ],
    schema: [
      {
        id: 'model_id',
        label: 'Target Audio Model',
        type: 'select',
        defaultValue: 'facebook/musicgen-small',
        options: [
          { label: 'MusicGen Small (100% Free HF Text-to-Music)', value: 'facebook/musicgen-small' },
          { label: 'Bark Small (100% Free HF Audio & Speech)', value: 'suno/bark-small' },
        ],
      },
      {
        id: 'hf_token',
        label: '🤗 HuggingFace Token (hf_...)',
        type: 'secret',
        placeholder: 'hf_...',
        description: 'Optional override. Defaults to session token from /login.',
      },
      {
        id: 'duration_seconds',
        label: 'Audio Duration (Seconds)',
        type: 'slider',
        min: 5,
        max: 30,
        step: 5,
        defaultValue: 10,
      },
      {
        id: 'prompt_template',
        label: 'Music Prompt Template',
        type: 'textarea',
        defaultValue: 'An upbeat synthwave electronic music track with punchy drums and retro 80s arpeggiated basslines',
      },
    ],
    defaultConfig: {
      model_id: 'facebook/musicgen-small',
      duration_seconds: 10,
      prompt_template: 'An upbeat synthwave electronic music track with punchy drums and retro 80s arpeggiated basslines',
    },
  },

  hf_speech_to_text: {
    type: 'hf_speech_to_text',
    title: 'HF Whisper Speech-to-Text',
    category: 'models',
    categoryLabel: 'Hugging Face Models',
    description: 'Transcribe voice messages, audio clips, and spoken speech into structured text using Whisper Large v3.',
    iconName: 'Sparkles',
    accentColor: '#3b82f6', // Blue 500
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'openai/whisper-large-v3',
    inputs: [
      { id: 'audio_url', label: 'Input Audio / Voice', type: 'audio', color: '#06b6d4' },
    ],
    outputs: [
      { id: 'transcription', label: 'Transcribed Text', type: 'string', color: '#38bdf8' },
      { id: 'language', label: 'Detected Language', type: 'string', color: '#a855f7' },
    ],
    schema: [
      {
        id: 'model_id',
        label: 'Target Speech Model',
        type: 'select',
        defaultValue: 'openai/whisper-large-v3',
        options: [
          { label: 'Whisper Large v3 (OpenAI Speech-to-Text)', value: 'openai/whisper-large-v3' },
          { label: 'Whisper Small (Fast Voice Transcribe)', value: 'openai/whisper-small' },
        ],
      },
      {
        id: 'hf_token',
        label: '🤗 HuggingFace Token (hf_...)',
        type: 'secret',
        placeholder: 'hf_...',
        description: 'Optional override. Defaults to session token from /login.',
      },
    ],
    defaultConfig: {
      model_id: 'openai/whisper-large-v3',
      hf_token: '',
    },
  },

  hf_video_gen: {
    type: 'hf_video_gen',
    title: 'HF Free Video Gen',
    category: 'models',
    categoryLabel: 'Hugging Face Models',
    description: 'Generate MP4 video clips using Hugging Face Text-to-Video models (ZeroScope, Damo-Vilab).',
    iconName: 'Video',
    accentColor: '#8b5cf6', // Violet 500
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'ZeroScope v2 (HF Free Video)',
    inputs: [
      { id: 'user_prompt', label: 'Video Prompt', type: 'string', color: '#38bdf8' },
    ],
    outputs: [
      { id: 'video_url', label: 'Video MP4 URL', type: 'string', color: '#a855f7' },
      { id: 'status', label: 'Status', type: 'string', color: '#22c55e' },
    ],
    schema: [
      {
        id: 'model_id',
        label: 'Target Video Model',
        type: 'select',
        defaultValue: 'zeroscope_v2_576w',
        options: [
          { label: 'ZeroScope v2 576w (100% Free HF Text-to-Video)', value: 'zeroscope_v2_576w' },
          { label: 'Damo Vilab 1.7B (100% Free HF Text-to-Video)', value: 'damo-vilab/text-to-video-ms-1.7b' },
          { label: 'AnimateDiff Lightning (100% Free HF Motion Video)', value: 'guoyww/animatediff-motion-adapter-v1-5-2' },
        ],
      },
      {
        id: 'user_prompt',
        label: 'Video Motion Prompt',
        type: 'textarea',
        defaultValue: '{{ $node["Telegram Trigger"].text }}',
      },
      {
        id: 'hf_token',
        label: '🤗 HuggingFace Token (hf_...)',
        type: 'secret',
        placeholder: 'hf_...',
        description: 'Optional override. Defaults to session token from /login.',
      },
    ],
    defaultConfig: {
      model_id: 'zeroscope_v2_576w',
      user_prompt: '{{ $node["Telegram Trigger"].text }}',
      hf_token: '',
    },
  },

  hf_zero_shot: {
    type: 'hf_zero_shot',
    title: 'Zero-Shot AI Classifier',
    category: 'models',
    categoryLabel: 'Zero Models & Routing',
    description: 'Classify text, images, objects, or audio into dynamic arbitrary labels without any dataset training.',
    iconName: 'Zap',
    accentColor: '#10b981', // Emerald 500
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'facebook/bart-large-mnli (Zero-Shot)',
    inputs: [
      { id: 'text', label: 'Input Text / Query', type: 'string', color: '#38bdf8' },
      { id: 'image_url', label: 'Input Image (Vision/Detection)', type: 'image', color: '#f43f5e' },
      { id: 'audio_url', label: 'Input Audio (CLAP Sound)', type: 'audio', color: '#a855f7' },
    ],
    outputs: [
      { id: 'top_label', label: 'Top Predicted Label', type: 'string', color: '#10b981' },
      { id: 'confidence', label: 'Confidence Score (0-1)', type: 'number', color: '#f59e0b' },
      { id: 'scores', label: 'All Label Scores (JSON)', type: 'object', color: '#a855f7' },
      { id: 'detected_objects', label: 'Detected Objects & Boxes', type: 'object', color: '#38bdf8' },
      { id: 'is_high_confidence', label: 'Is High Confidence (>0.7)', type: 'boolean', color: '#3b82f6' },
    ],
    schema: [
      {
        id: 'modality',
        label: 'Zero-Shot Modality',
        type: 'select',
        defaultValue: 'text_intent',
        options: [
          { label: '⚡ Natural Language Intent (Text NLI)', value: 'text_intent' },
          { label: '👁️ Zero-Shot Vision & Image Concepts (CLIP)', value: 'vision_clip' },
          { label: '🎯 Zero-Shot Object Detection (OWL-ViT)', value: 'object_detection' },
          { label: '🎙️ Zero-Shot Audio & Sound Classification (CLAP)', value: 'audio_clap' },
        ],
      },
      {
        id: 'model_id',
        label: 'Target Zero Model',
        type: 'select',
        defaultValue: 'facebook/bart-large-mnli',
        options: [
          { label: 'BART Large MNLI (Top Zero-Shot Text Classifier)', value: 'facebook/bart-large-mnli' },
          { label: 'DistilBERT MNLI (Fast Low-Latency Text NLI)', value: 'typeform/distilbert-base-uncased-mnli' },
          { label: 'DeBERTa v3 Large NLI (High Precision Text)', value: 'MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli' },
          { label: 'CLIP ViT Large Patch 14 (Zero-Shot Vision Classifier)', value: 'openai/clip-vit-large-patch14' },
          { label: 'OWL-ViT Base Patch 32 (Zero-Shot Object Detection)', value: 'google/owlvit-base-patch32' },
          { label: 'LAION CLAP General Audio (Zero-Shot Sound Classifier)', value: 'laion/larger_clap_general' },
        ],
      },
      {
        id: 'candidate_labels',
        label: 'Candidate Labels (Comma separated)',
        type: 'textarea',
        defaultValue: 'customer_support, sales_inquiry, billing_question, technical_issue, spam, image_generation_request',
        description: 'Define any custom category labels, visual concepts, or object classes to evaluate.',
      },
      {
        id: 'multi_label',
        label: 'Allow Multiple Labels',
        type: 'boolean',
        defaultValue: false,
        description: 'Whether multiple candidate labels can be predicted simultaneously.',
      },
      {
        id: 'hypothesis_template',
        label: 'Hypothesis Template (For Text NLI)',
        type: 'text',
        defaultValue: 'This message is about {}.',
        description: 'Template used by Natural Language Inference to test candidate hypotheses.',
      },
      {
        id: 'hf_token',
        label: '🤗 HuggingFace Token (hf_...)',
        type: 'secret',
        placeholder: 'hf_...',
        description: 'Optional override. Defaults to session token from /login.',
      },
    ],
    defaultConfig: {
      modality: 'text_intent',
      model_id: 'facebook/bart-large-mnli',
      candidate_labels: 'customer_support, sales_inquiry, billing_question, technical_issue, spam, image_generation_request',
      multi_label: false,
      hypothesis_template: 'This message is about {}.',
      hf_token: '',
    },
  },

  openclaw_agent: {
    type: 'openclaw_agent',
    title: 'OpenClaw Autonomous AI Agent',
    category: 'models',
    categoryLabel: 'Autonomous AI Agents',
    description: 'Autonomous multi-tool personal AI agent hosted on Hugging Face Spaces (2 vCPU + 16GB RAM) with live Web Search, Python Sandbox, and Dataset Memory.',
    iconName: 'Bot',
    accentColor: '#f97316', // Orange 500
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'openclaw/openclaw (Free HF Space)',
    inputs: [
      { id: 'task_prompt', label: 'User Task / Query', type: 'string', color: '#38bdf8' },
      { id: 'context_data', label: 'Context / Memory Payload', type: 'any', color: '#a855f7' },
    ],
    outputs: [
      { id: 'agent_response', label: 'Agent Response', type: 'string', color: '#4ade80' },
      { id: 'thought_process', label: 'ReAct Thought Trace', type: 'string', color: '#f59e0b' },
      { id: 'tool_calls', label: 'Executed Tool Calls', type: 'object', color: '#38bdf8' },
      { id: 'memory_state', label: 'Dataset Memory State', type: 'object', color: '#ec4899' },
    ],
    schema: [
      {
        id: 'agent_role',
        label: 'Agent Persona & Specialization',
        type: 'select',
        defaultValue: 'general_assistant',
        options: [
          { label: '🤖 General Personal Assistant (Web + Memory)', value: 'general_assistant' },
          { label: '💻 Senior Python & Code Developer', value: 'coding_developer' },
          { label: '🔍 Autonomous Web Researcher & Fact-Checker', value: 'deep_researcher' },
          { label: '🤝 Telegram / WhatsApp Support Representative', value: 'customer_support' },
        ],
      },
      {
        id: 'system_prompt',
        label: 'System Prompt & Guidelines',
        type: 'textarea',
        defaultValue: 'You are OpenClaw, a helpful, autonomous AI agent hosted on Hugging Face Spaces. You solve complex user tasks step-by-step using your tools.',
      },
      {
        id: 'enable_web_search',
        label: 'Enable Live Web Search Tool',
        type: 'boolean',
        defaultValue: true,
      },
      {
        id: 'enable_python_interpreter',
        label: 'Enable Python REPL Sandbox Tool',
        type: 'boolean',
        defaultValue: true,
      },
      {
        id: 'enable_dataset_memory',
        label: 'Sync Memory to HF Hub Dataset',
        type: 'boolean',
        defaultValue: true,
      },
      {
        id: 'hf_space_url',
        label: 'OpenClaw Space Endpoint (Free)',
        type: 'text',
        defaultValue: 'openclaw/openclaw',
        placeholder: 'openclaw/openclaw or your duplicated Space URL',
      },
    ],
    defaultConfig: {
      agent_role: 'general_assistant',
      system_prompt: 'You are OpenClaw, an autonomous AI assistant powered by Hugging Face Spaces.',
      enable_web_search: true,
      enable_python_interpreter: true,
      enable_dataset_memory: true,
      hf_space_url: 'openclaw/openclaw',
    },
  },

  logic_transform: {
    type: 'logic_transform',
    title: 'Logic & Code Transform',
    category: 'logic',
    categoryLabel: 'Data & Control Flow',
    description: 'Transform, format, or extract data using custom JS expression or template solver.',
    iconName: 'Code2',
    accentColor: '#ec4899', // Pink 500
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'JSON / Text Transformer',
    inputs: [
      { id: 'payload_a', label: 'Payload Input A', type: 'any', color: '#ec4899' },
      { id: 'payload_b', label: 'Payload Input B', type: 'any', color: '#94a3b8' },
    ],
    outputs: [
      { id: 'result', label: 'Transformed Output', type: 'object', color: '#ec4899' },
      { id: 'text_out', label: 'Formatted Text', type: 'string', color: '#38bdf8' },
    ],
    schema: [
      {
        id: 'transform_code',
        label: 'JavaScript Expression / Transformer',
        type: 'code',
        defaultValue: `// Accessible: inputA, inputB, $node
return {
  greeting: "Hello " + (inputA?.sender_name || "Valued Customer") + "!",
  summary: (inputB?.response_text || "").trim(),
  timestamp: new Date().toISOString()
};`,
        description: 'Return a JSON object or string output.',
      },
      {
        id: 'output_format',
        label: 'Output Format',
        type: 'select',
        defaultValue: 'json_object',
        options: [
          { label: 'JSON Object', value: 'json_object' },
          { label: 'Plain Text String', value: 'plain_text' },
          { label: 'Markdown Document', value: 'markdown' },
        ],
      },
    ],
    defaultConfig: {
      transform_code: `// Accessible: inputA, inputB, $node
return {
  greeting: "Hello " + (inputA?.sender_name || "Valued Customer") + "!",
  summary: (inputB?.response_text || "").trim(),
  timestamp: new Date().toISOString()
};`,
      output_format: 'json_object',
    },
  },

  telegram_reply: {
    type: 'telegram_reply',
    title: 'Telegram Reply',
    category: 'actions',
    categoryLabel: 'Action Endpoints',
    description: 'Send a response message or attachment back to a Telegram Chat ID.',
    iconName: 'MessageCircle',
    accentColor: '#38bdf8', // Sky 400
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'Send Telegram Message',
    inputs: [
      { id: 'chat_id', label: 'Chat ID', type: 'string', color: '#38bdf8' },
      { id: 'text', label: 'Message Text', type: 'string', color: '#38bdf8' },
      { id: 'media_url', label: 'Media URL (Opt)', type: 'image', color: '#f43f5e' },
    ],
    outputs: [
      { id: 'sent_status', label: 'Sent Success', type: 'boolean', color: '#4ade80' },
      { id: 'message_id', label: 'Message ID', type: 'number', color: '#f59e0b' },
    ],
    schema: [
      {
        id: 'chat_id_template',
        label: 'Chat ID Template',
        type: 'text',
        defaultValue: '{{ $node["Telegram Trigger"].chat_id }}',
        description: 'Target Telegram chat identifier or pill interpolation',
      },
      {
        id: 'message_template',
        label: 'Response Text Template',
        type: 'textarea',
        defaultValue: '🤖 **AI Bot Response**:\n\n{{ $node["HuggingFace Router"].response_text }}',
        description: 'Supports markdown and dynamic variable pills',
      },
    ],
    defaultConfig: {
      chat_id_template: '{{ $node["Telegram Trigger"].chat_id }}',
      message_template: '🤖 **AI Bot Response**:\n\n{{ $node["HuggingFace Router"].response_text }}',
    },
  },

  whatsapp_reply: {
    type: 'whatsapp_reply',
    title: 'WhatsApp Reply',
    category: 'actions',
    categoryLabel: 'Action Endpoints',
    description: 'Send an outgoing WhatsApp message or media payload via Meta API.',
    iconName: 'SendHorizontal',
    accentColor: '#4ade80', // Green 400
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'Send WhatsApp Message',
    inputs: [
      { id: 'phone_number', label: 'Phone Number', type: 'string', color: '#4ade80' },
      { id: 'message_body', label: 'Message Body', type: 'string', color: '#4ade80' },
      { id: 'media_url', label: 'Media Attachment', type: 'image', color: '#f43f5e' },
    ],
    outputs: [
      { id: 'delivery_status', label: 'Delivered', type: 'boolean', color: '#4ade80' },
      { id: 'wa_id', label: 'Meta Message ID', type: 'string', color: '#38bdf8' },
    ],
    schema: [
      {
        id: 'recipient_template',
        label: 'Recipient Phone Template',
        type: 'text',
        defaultValue: '{{ $node["WhatsApp Trigger"].phone_number }}',
      },
      {
        id: 'message_template',
        label: 'Message Body Template',
        type: 'textarea',
        defaultValue: '✨ Generated Image from FLUX.1:\n{{ $node["Gradio Space"].image_url }}',
      },
    ],
    defaultConfig: {
      recipient_template: '{{ $node["WhatsApp Trigger"].phone_number }}',
      message_template: '✨ Generated Image from FLUX.1:\n{{ $node["Gradio Space"].image_url }}',
    },
  },
};

export const NODE_CATEGORIES = [
  { id: 'all', label: 'All Components', count: 7 },
  { id: 'triggers', label: 'Triggers & Webhooks', accent: '#38bdf8', count: 2 },
  { id: 'models', label: 'AI Models (HF Hub)', accent: '#a855f7', count: 2 },
  { id: 'logic', label: 'Logic & Data Flow', accent: '#ec4899', count: 1 },
  { id: 'actions', label: 'Action Endpoints', accent: '#4ade80', count: 2 },
];
