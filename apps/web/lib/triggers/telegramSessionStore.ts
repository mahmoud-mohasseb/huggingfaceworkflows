/**
 * Telegram Chat Conversation Session Store
 * Persists dynamic model selection per Telegram conversation/chat.
 */

export interface TelegramChatSession {
  chatId: string;
  selectedModelId: string;
  workflowType: 'zero' | 'video' | 'vision' | 'image' | 'text' | 'music' | 'voice' | 'agent' | 'custom';
  workflowId: string;
  updatedAt: number;
}

// In-memory runtime session store for active Telegram chats
const TELEGRAM_SESSIONS: Map<string, TelegramChatSession> = new Map();

export const MODEL_ALIASES: Record<string, { modelId: string; workflowType: TelegramChatSession['workflowType']; workflowId: string; label: string }> = {
  zero: {
    modelId: 'facebook/bart-large-mnli',
    workflowType: 'zero',
    workflowId: 'tpl_zero_shot_router',
    label: 'Zero-Shot Intent Classifier (BART MNLI)',
  },
  bart: {
    modelId: 'facebook/bart-large-mnli',
    workflowType: 'zero',
    workflowId: 'tpl_zero_shot_router',
    label: 'Zero-Shot Intent Classifier (BART MNLI)',
  },
  video: {
    modelId: 'cerspense/zeroscope_v2_576w',
    workflowType: 'video',
    workflowId: 'tpl_telegram_video_gen',
    label: 'ZeroScope AI Video Generator (576w MP4)',
  },
  zeroscope: {
    modelId: 'cerspense/zeroscope_v2_576w',
    workflowType: 'video',
    workflowId: 'tpl_telegram_video_gen',
    label: 'ZeroScope AI Video Generator (576w MP4)',
  },
  clip: {
    modelId: 'openai/clip-vit-large-patch14',
    workflowType: 'vision',
    workflowId: 'tpl_zero_shot_vision_clip',
    label: 'OpenAI CLIP Zero-Shot Vision Concept Classifier',
  },
  vision: {
    modelId: 'openai/clip-vit-large-patch14',
    workflowType: 'vision',
    workflowId: 'tpl_zero_shot_vision_clip',
    label: 'OpenAI CLIP Zero-Shot Vision Concept Classifier',
  },
  owl: {
    modelId: 'google/owlvit-base-patch32',
    workflowType: 'vision',
    workflowId: 'tpl_zero_shot_vision_clip',
    label: 'Google OWL-ViT Zero-Shot Object Detector',
  },
  deepseek: {
    modelId: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    workflowType: 'text',
    workflowId: 'tpl_deepseek_reasoning_pipeline',
    label: 'DeepSeek-R1 Distill Reasoning LLM (32B)',
  },
  llama: {
    modelId: 'meta-llama/Llama-3.3-70B-Instruct',
    workflowType: 'text',
    workflowId: 'tpl_telegram_support_bot',
    label: 'Meta Llama 3.3 70B Instruct LLM',
  },
  flux: {
    modelId: 'black-forest-labs/FLUX.1-schnell',
    workflowType: 'image',
    workflowId: 'tpl_whatsapp_flux_pipeline',
    label: 'Black Forest Labs FLUX.1 Schnell Image Generator',
  },
  image: {
    modelId: 'black-forest-labs/FLUX.1-schnell',
    workflowType: 'image',
    workflowId: 'tpl_whatsapp_flux_pipeline',
    label: 'Black Forest Labs FLUX.1 Schnell Image Generator',
  },
  music: {
    modelId: 'facebook/musicgen-stereo',
    workflowType: 'music',
    workflowId: 'tpl_hf_free_all_ai',
    label: 'Meta MusicGen Stereo Music Composer',
  },
  whisper: {
    modelId: 'openai/whisper-large-v3',
    workflowType: 'voice',
    workflowId: 'tpl_whisper_voice_pipeline',
    label: 'OpenAI Whisper Large v3 Speech-to-Text',
  },
  agent: {
    modelId: 'openclaw/openclaw',
    workflowType: 'agent',
    workflowId: 'tpl_openclaw_telegram',
    label: 'OpenClaw Autonomous ReAct Multi-Tool Agent',
  },
};

/**
 * Gets or initializes the active session for a Telegram chat
 */
export function getTelegramChatSession(chatId: string): TelegramChatSession {
  if (TELEGRAM_SESSIONS.has(chatId)) {
    return TELEGRAM_SESSIONS.get(chatId)!;
  }

  // Default initial session: Meta Llama 3.3 70B
  const defaultSession: TelegramChatSession = {
    chatId,
    selectedModelId: 'meta-llama/Llama-3.3-70B-Instruct',
    workflowType: 'text',
    workflowId: 'tpl_telegram_support_bot',
    updatedAt: Date.now(),
  };

  TELEGRAM_SESSIONS.set(chatId, defaultSession);
  return defaultSession;
}

/**
 * Switches the active model for a Telegram chat
 */
export function setTelegramChatModel(chatId: string, modelAliasOrId: string): {
  success: boolean;
  modelId: string;
  workflowType: TelegramChatSession['workflowType'];
  workflowId: string;
  message: string;
} {
  const cleanInput = (modelAliasOrId || '').trim().toLowerCase().replace(/^\/model\s*/, '');

  // 1. Check known aliases
  const alias = MODEL_ALIASES[cleanInput];
  if (alias) {
    const session: TelegramChatSession = {
      chatId,
      selectedModelId: alias.modelId,
      workflowType: alias.workflowType,
      workflowId: alias.workflowId,
      updatedAt: Date.now(),
    };
    TELEGRAM_SESSIONS.set(chatId, session);

    return {
      success: true,
      modelId: alias.modelId,
      workflowType: alias.workflowType,
      workflowId: alias.workflowId,
      message: `✅ **Model Switched Successfully!**\n\n🎯 **Active Model**: \`${alias.label}\`\n🧩 **Model ID**: \`${alias.modelId}\`\n⚡ **Modality**: \`${alias.workflowType.toUpperCase()}\`\n\n*All subsequent messages in this chat will now execute using ${alias.modelId}. Send any prompt to try it!*`,
    };
  }

  // 2. Custom Hugging Face repository ID (e.g. "meta-llama/Llama-3.2-11B-Vision-Instruct" or "ByteDance/AnimateDiff-Lightning")
  if (modelAliasOrId.includes('/')) {
    const rawModelId = modelAliasOrId.trim();
    let wfType: TelegramChatSession['workflowType'] = 'custom';
    let wfId = 'tpl_hf_free_all_ai';

    const lower = rawModelId.toLowerCase();
    if (lower.includes('video') || lower.includes('animatediff') || lower.includes('zeroscope')) {
      wfType = 'video';
      wfId = 'tpl_telegram_video_gen';
    } else if (lower.includes('clip') || lower.includes('owlvit') || lower.includes('mnli')) {
      wfType = 'zero';
      wfId = 'tpl_zero_shot_router';
    } else if (lower.includes('flux') || lower.includes('diffusion') || lower.includes('sdxl')) {
      wfType = 'image';
      wfId = 'tpl_whatsapp_flux_pipeline';
    }

    const session: TelegramChatSession = {
      chatId,
      selectedModelId: rawModelId,
      workflowType: wfType,
      workflowId: wfId,
      updatedAt: Date.now(),
    };
    TELEGRAM_SESSIONS.set(chatId, session);

    return {
      success: true,
      modelId: rawModelId,
      workflowType: wfType,
      workflowId: wfId,
      message: `✅ **Custom Model Selected!**\n\n🎯 **Active Model**: \`${rawModelId}\`\n⚡ **Modality**: \`${wfType.toUpperCase()}\`\n\n*All subsequent messages in this chat will now execute using ${rawModelId}.*`,
    };
  }

  // 3. Unknown alias — return helpful list of options
  return {
    success: false,
    modelId: '',
    workflowType: 'text',
    workflowId: '',
    message: `❓ **Unknown model alias**: "${cleanInput}"\n\n**Available Model Options:**\n- \`/model zero\` — Zero-Shot Intent Classifier (BART MNLI)\n- \`/model video\` — ZeroScope Zero Video Generator (MP4)\n- \`/model vision\` — OpenAI CLIP Zero-Shot Vision Classifier\n- \`/model deepseek\` — DeepSeek R1 Reasoning LLM\n- \`/model llama\` — Meta Llama 3.3 70B Instruct\n- \`/model flux\` — FLUX.1 Schnell Image Generator\n- \`/model music\` — MusicGen Stereo Composer\n- \`/model whisper\` — Whisper Large v3 Audio Transcriber\n- \`/model <org/model-id>\` — Custom Hugging Face Hub Model ID`,
  };
}
