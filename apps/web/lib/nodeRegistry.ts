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
      { id: 'media_url', label: 'Media URL', type: 'image', color: '#f43f5e' },
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
        defaultValue: '/start, /help, /ai, /model, /video, /code, /image, /zero',
        placeholder: '/start, /ask, /model',
        description: 'Comma separated command filters',
      },
    ],
    defaultConfig: {
      bot_token: '7910482910:AAH-x94aK_demo_token',
      webhook_url: 'https://hfworkflow.app/api/webhooks/telegram',
      listen_commands: '/start, /help, /ai, /model, /video, /code, /image, /zero',
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
        id: 'prompt_template',
        label: 'Prompt Template',
        type: 'textarea',
        defaultValue: '{{ $node["Telegram Trigger"].text }}',
        presets: [
          { label: 'Telegram Text', value: '{{ $node["Telegram Trigger"].text }}', description: 'Direct inbound message' },
          { label: 'Photorealistic Art', value: 'A masterpiece 8k photograph of {{ $node["Telegram Trigger"].text }}, sharp focus, octane render', description: 'Photo enhancement' },
          { label: 'Cyberpunk Scene', value: 'Cyberpunk futuristic neon city with {{ $node["Telegram Trigger"].text }}, volumetric light', description: 'Sci-fi visual' },
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
      prompt_template: '{{ $node["Telegram Trigger"].text }}',
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
    description: 'Serverless API routing to top-tier LLMs and Coder models hosted on Hugging Face Hub.',
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
          { label: 'Qwen 2.5 Coder 32B (Top Coding Model)', value: 'Qwen/Qwen2.5-Coder-32B-Instruct' },
          { label: 'DeepSeek R1 Distill Qwen 32B (Reasoning)', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B' },
          { label: 'Llama 3.2 11B Vision Instruct (Multimodal)', value: 'meta-llama/Llama-3.2-11B-Vision-Instruct' },
          { label: 'Qwen 2.5 72B Instruct (Alibaba)', value: 'Qwen/Qwen2.5-72B-Instruct' },
          { label: 'Mistral 7B Instruct v0.3 (Fast)', value: 'mistralai/Mistral-7B-Instruct-v0.3' },
        ],
      },
      {
        id: 'user_prompt',
        label: 'User Prompt Template',
        type: 'textarea',
        defaultValue: '{{ $node["Telegram Trigger"].text }}',
        presets: [
          { label: 'Telegram Direct Message', value: '{{ $node["Telegram Trigger"].text }}', description: 'Direct user message' },
          { label: 'Python / Code Solver', value: 'You are an expert software developer. Write clean, complete, runnable code to solve: {{ $node["Telegram Trigger"].text }}', description: 'Coding instructions' },
          { label: 'Support Ticket Assistant', value: 'User "{{ $node["Telegram Trigger"].sender_name }}" asked: "{{ $node["Telegram Trigger"].text }}". Provide a helpful, professional support response.', description: 'Support agent' },
          { label: 'DeepSeek Step-by-Step Reasoner', value: 'Analyze step-by-step with deep reasoning and solve: {{ $node["Telegram Trigger"].text }}', description: 'Reasoning chain' },
          { label: 'Vision Scene Analyzer', value: 'Analyze this image and describe details for user prompt: {{ $node["Telegram Trigger"].text }}', description: 'Multimodal vision' },
        ],
      },
      {
        id: 'system_template',
        label: 'System Prompt Template',
        type: 'textarea',
        defaultValue: 'You are an intelligent, helpful AI assistant built with Hugging Face models for Telegram automations.',
        presets: [
          { label: 'Telegram AI Assistant', value: 'You are a helpful, concise Telegram AI assistant powered by Hugging Face.', description: 'Concise bot' },
          { label: 'Senior Software Engineer', value: 'You are a Senior Polyglot Software Engineer. You write production-grade, bug-free, fully commented code.', description: 'Coding specialist' },
          { label: 'Customer Support Bot', value: 'You are a friendly, knowledgeable customer support representative. You resolve customer issues efficiently.', description: 'Customer service' },
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
    ],
    defaultConfig: {
      hf_token: '',
      model_id: 'meta-llama/Llama-3.3-70B-Instruct',
      user_prompt: '{{ $node["Telegram Trigger"].text }}',
      temperature: 0.7,
      max_new_tokens: 1024,
      system_template: 'You are an intelligent, helpful AI assistant built with Hugging Face models for Telegram automations.',
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
        presets: [
          { label: 'Telegram Direct Message', value: '{{ $node["Telegram Trigger"].text }}', description: 'User input as prompt' },
          { label: 'FLUX.1 Photorealistic 8K', value: 'A stunning 8k photorealistic image of {{ $node["Telegram Trigger"].text }}, highly detailed, professional cinematic studio lighting, shot on 35mm lens', description: 'Photorealistic render' },
          { label: 'Cyberpunk Concept Art', value: 'Cyberpunk futuristic neon-lit concept art of {{ $node["Telegram Trigger"].text }}, volumetric smoke, high contrast, trending on ArtStation', description: 'Cyberpunk aesthetic' },
          { label: 'Digital Anime Masterpiece', value: 'Masterpiece anime illustration of {{ $node["Telegram Trigger"].text }}, vibrant colors, Makoto Shinkai style, glowing lighting', description: 'Anime style' },
        ],
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
          { label: 'MusicGen Medium (Higher Quality Music)', value: 'facebook/musicgen-medium' },
          { label: 'MusicGen Stereo (Spatial Audio)', value: 'facebook/musicgen-stereo' },
          { label: 'Bark Small (100% Free HF Audio & Speech)', value: 'suno/bark-small' },
        ],
      },
      {
        id: 'prompt_template',
        label: 'Music Prompt Template',
        type: 'textarea',
        defaultValue: 'An upbeat synthwave electronic music track with punchy drums and retro 80s arpeggiated basslines for {{ $node["Telegram Trigger"].text }}',
        presets: [
          { label: 'Telegram Prompt Beat', value: 'An energetic music beat inspired by: {{ $node["Telegram Trigger"].text }} with driving bass and drums', description: 'Telegram dynamic beat' },
          { label: 'Synthwave 80s', value: 'An upbeat synthwave electronic music track with punchy drums and retro 80s arpeggiated basslines', description: 'Retro synthwave' },
          { label: 'Lo-Fi Chill Hop', value: 'Calm relaxing lo-fi chillhop beats with soft piano chords and warm vinyl crackle', description: 'Lo-fi chill' },
          { label: 'Cinematic Orchestral', value: 'Epic cinematic orchestral soundtrack with dramatic strings, brass, and timpani rolls', description: 'Movie score' },
        ],
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
        id: 'hf_token',
        label: '🤗 HuggingFace Token (hf_...)',
        type: 'secret',
        placeholder: 'hf_...',
        description: 'Optional override. Defaults to session token from /login.',
      },
    ],
    defaultConfig: {
      model_id: 'facebook/musicgen-small',
      duration_seconds: 10,
      prompt_template: 'An upbeat synthwave electronic music track with punchy drums and retro 80s arpeggiated basslines for {{ $node["Telegram Trigger"].text }}',
    },
  },

  hf_speech_to_text: {
    type: 'hf_speech_to_text',
    title: 'HF Whisper Speech & Multi-Voice',
    category: 'models',
    categoryLabel: 'Hugging Face Models',
    description: 'Transcribe voice messages or synthesize multi-character speech dialogues using Whisper and neural TTS.',
    iconName: 'Sparkles',
    accentColor: '#3b82f6', // Blue 500
    badge: 'Free',
    creditCost: 0,
    defaultSubtitle: 'openai/whisper-large-v3',
    inputs: [
      { id: 'audio_url', label: 'Input Audio / Voice', type: 'audio', color: '#06b6d4' },
      { id: 'script', label: 'Voice Dialogue Script', type: 'string', color: '#38bdf8' },
    ],
    outputs: [
      { id: 'transcription', label: 'Transcribed Text', type: 'string', color: '#38bdf8' },
      { id: 'audio_url', label: 'Generated Master Audio', type: 'audio', color: '#06b6d4' },
      { id: 'audio_tracks', label: 'All Vocal Tracks (Array)', type: 'object', color: '#a855f7' },
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
        id: 'script',
        label: 'Multi-Voice Dialogue Script Template',
        type: 'textarea',
        defaultValue: 'Alice: Welcome {{ $node["Telegram Trigger"].sender_name }} to our AI workflow!\nBob: I will process your request right now.\nNarrator: Workflow completed successfully.',
        presets: [
          {
            label: 'Telegram Multi-Character Greeting',
            value: 'Alice: Welcome {{ $node["Telegram Trigger"].sender_name }} to our AI workflow!\nBob: I will process your request right now.\nNarrator: Workflow completed successfully.',
            description: 'Multi-voice greeting',
          },
          {
            label: 'Customer Support Dialogue',
            value: 'Agent: Hello {{ $node["Telegram Trigger"].sender_name }}, how may I assist you with your account today?\nClient: {{ $node["Telegram Trigger"].text }}\nAgent: I understand, let me resolve that for you immediately.',
            description: 'Customer dialogue',
          },
          {
            label: 'Sci-Fi Space Mission Dialogue',
            value: 'Commander: Launching neural processing sequence.\nAI: Systems nominal, calculating trajectory.\nNarrator: Entering hyperspace.',
            description: 'Sci-Fi narration',
          },
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
      script: 'Alice: Welcome {{ $node["Telegram Trigger"].sender_name }} to our AI workflow!\nBob: I will process your request right now.\nNarrator: Workflow completed successfully.',
      hf_token: '',
    },
  },

  hf_video_gen: {
    type: 'hf_video_gen',
    title: 'HF Free Video Gen',
    category: 'models',
    categoryLabel: 'Hugging Face Models',
    description: 'Generate real MP4 video clips using Hugging Face ZeroScope Text-to-Video models.',
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
      { id: 'preview_image_url', label: 'Preview Poster URL', type: 'image', color: '#f43f5e' },
      { id: 'duration', label: 'Duration (s)', type: 'number', color: '#f59e0b' },
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
          { label: 'AnimateDiff Lightning (100% Free HF Motion Video)', value: 'ByteDance/AnimateDiff-Lightning' },
          { label: 'CogVideoX 2B (THUDM High Definition Video)', value: 'THUDM/CogVideoX-2b' },
        ],
      },
      {
        id: 'user_prompt',
        label: 'Video Motion Prompt Template',
        type: 'textarea',
        defaultValue: 'Cinematic high quality video of {{ $node["Telegram Trigger"].text }}, 4k photorealistic motion, smooth frame rate',
        presets: [
          {
            label: 'Telegram Inbound Prompt',
            value: 'Cinematic high quality video of {{ $node["Telegram Trigger"].text }}, 4k photorealistic motion, smooth frame rate',
            description: 'Direct video motion',
          },
          {
            label: 'Cyberpunk Sci-Fi Voyage',
            value: 'Cyberpunk futuristic neon space voyage with {{ $node["Telegram Trigger"].text }}, dynamic sweeping camera motion, 60fps ultra-detailed',
            description: 'Futuristic sci-fi',
          },
          {
            label: 'Epic Nature Drone Footage',
            value: 'Breathtaking 4k drone footage of {{ $node["Telegram Trigger"].text }}, golden hour volumetric lighting, majestic landscape view',
            description: 'Scenic landscape',
          },
          {
            label: 'Slow-Motion Cinematic',
            value: 'Cinematic slow-motion close-up of {{ $node["Telegram Trigger"].text }}, shallow depth of field, 120fps motion blur, masterpiece',
            description: 'Slow motion',
          },
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
      model_id: 'zeroscope_v2_576w',
      user_prompt: 'Cinematic high quality video of {{ $node["Telegram Trigger"].text }}, 4k photorealistic motion, smooth frame rate',
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
        defaultValue: 'customer_support, sales_inquiry, billing_question, technical_issue, bug_report, spam, video_generation, code_generation, image_art',
        presets: [
          {
            label: 'Customer Support Router',
            value: 'customer_support, sales_inquiry, billing_question, technical_issue, bug_report, spam',
            description: 'Support intents',
          },
          {
            label: 'Multi-Modal Media Intent',
            value: 'video_generation, code_generation, image_art, text_question, music_creation, general_chat',
            description: 'Media dispatch',
          },
          {
            label: 'Sentiment Analysis',
            value: 'very_positive, positive, neutral, negative, extremely_urgent',
            description: 'Sentiment',
          },
          {
            label: 'Vision CLIP Concepts',
            value: 'receipt_invoice, error_screenshot, code_snippet, photo_portrait, nature_landscape, product_item',
            description: 'Image concepts',
          },
          {
            label: 'OWL-ViT Object Detector',
            value: 'person, face, computer, phone, document, vehicle, text_box',
            description: 'Objects in image',
          },
        ],
        description: 'Define any custom category labels, visual concepts, or object classes to evaluate.',
      },
      {
        id: 'text',
        label: 'Input Text Template',
        type: 'textarea',
        defaultValue: '{{ $node["Telegram Trigger"].text }}',
        presets: [
          { label: 'Telegram Inbound Message', value: '{{ $node["Telegram Trigger"].text }}', description: 'Direct Telegram message' },
          { label: 'WhatsApp Message Body', value: '{{ $node["WhatsApp Trigger"].message_body }}', description: 'Direct WhatsApp message' },
        ],
      },
      {
        id: 'hypothesis_template',
        label: 'Hypothesis Template (For Text NLI)',
        type: 'text',
        defaultValue: 'This Telegram user message is asking about {}.',
        presets: [
          { label: 'Telegram User Intent', value: 'This Telegram user message is asking about {}.', description: 'Telegram intent' },
          { label: 'General Message Topic', value: 'This message is about {}.', description: 'General topic' },
          { label: 'Customer Sentiment', value: 'The customer tone is {}.', description: 'Sentiment' },
          { label: 'Image Vision Description', value: 'A photo showing a {}.', description: 'Vision hypothesis' },
        ],
        description: 'Template used by Natural Language Inference to test candidate hypotheses.',
      },
      {
        id: 'multi_label',
        label: 'Allow Multiple Labels',
        type: 'boolean',
        defaultValue: false,
        description: 'Whether multiple candidate labels can be predicted simultaneously.',
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
      candidate_labels: 'customer_support, sales_inquiry, billing_question, technical_issue, bug_report, spam, video_generation, code_generation, image_art',
      text: '{{ $node["Telegram Trigger"].text }}',
      multi_label: false,
      hypothesis_template: 'This Telegram user message is asking about {}.',
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
        id: 'task_prompt',
        label: 'Task Prompt Template',
        type: 'textarea',
        defaultValue: '{{ $node["Telegram Trigger"].text }}',
        presets: [
          { label: 'Telegram Direct Message', value: '{{ $node["Telegram Trigger"].text }}', description: 'Direct user task' },
          { label: 'Web Research & Summary', value: 'Research the latest information on: {{ $node["Telegram Trigger"].text }} and summarize findings.', description: 'Online search' },
          { label: 'Code Execution in Sandbox', value: 'Write and test Python code to solve: {{ $node["Telegram Trigger"].text }} in your sandbox.', description: 'Python execution' },
        ],
      },
      {
        id: 'system_prompt',
        label: 'System Prompt & Guidelines',
        type: 'textarea',
        defaultValue: 'You are OpenClaw, an autonomous AI agent hosted on Hugging Face Spaces. You solve complex user tasks step-by-step using your tools.',
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
      task_prompt: '{{ $node["Telegram Trigger"].text }}',
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
        presets: [
          {
            label: 'AI LLM Response',
            value: '🤖 **[AI Assistant]**:\n\n{{ $node["HuggingFace Router"].response_text }}',
            description: 'Standard text reply',
          },
          {
            label: 'Zero Model Classification',
            value: '🎯 **[Zero Model Result]**:\n• **Classification**: `{{ $node["Zero-Shot AI Classifier"].top_label }}`\n• **Confidence**: {{ $node["Zero-Shot AI Classifier"].confidence }}\n• **Status**: Active',
            description: 'Zero model pill',
          },
          {
            label: 'Generated Video MP4',
            value: '🎥 **Generated Video** for "*{{ $node["Telegram Trigger"].text }}*":\n{{ $node["HF Free Video Gen"].video_url }}',
            description: 'Video attachment',
          },
          {
            label: 'Code Solution',
            value: '💻 **Code Solution**:\n\n{{ $node["HuggingFace Router"].response_text }}',
            description: 'Code snippet',
          },
          {
            label: 'Generated Image / Art',
            value: '🎨 **Generated Art** for "*{{ $node["Telegram Trigger"].text }}*":\n{{ $node["HF Free Image Gen"].image_url }}',
            description: 'Image art',
          },
          {
            label: 'Speech & Audio Track',
            value: '🎙️ **Generated Audio**:\n{{ $node["HF Whisper Speech & Multi-Voice"].audio_url }}',
            description: 'Audio output',
          },
        ],
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
        defaultValue: '✨ AI Response:\n{{ $node["HuggingFace Router"].response_text }}',
        presets: [
          {
            label: 'WhatsApp Text Response',
            value: '✨ AI Response:\n{{ $node["HuggingFace Router"].response_text }}',
            description: 'Text answer',
          },
          {
            label: 'WhatsApp Image Delivery',
            value: '🎨 Generated Image:\n{{ $node["HF Free Image Gen"].image_url }}',
            description: 'Image deliver',
          },
        ],
      },
    ],
    defaultConfig: {
      recipient_template: '{{ $node["WhatsApp Trigger"].phone_number }}',
      message_template: '✨ AI Response:\n{{ $node["HuggingFace Router"].response_text }}',
    },
  },
};

export const NODE_CATEGORIES = [
  { id: 'all', label: 'All Components', count: 8 },
  { id: 'triggers', label: 'Triggers & Webhooks', accent: '#38bdf8', count: 2 },
  { id: 'models', label: 'AI Models (HF Hub)', accent: '#a855f7', count: 4 },
  { id: 'logic', label: 'Logic & Data Flow', accent: '#ec4899', count: 1 },
  { id: 'actions', label: 'Action Endpoints', accent: '#4ade80', count: 2 },
];
