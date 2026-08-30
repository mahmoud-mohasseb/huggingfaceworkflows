import { executeWorkflow } from '../engine/executor';

export interface MessageEventPayload {
  provider: 'telegram' | 'whatsapp' | 'webhook';
  chatId: string;
  senderName: string;
  text: string;
  botToken?: string;
  hfToken?: string;
}

export async function processInboundEvent(event: MessageEventPayload) {
  const t = event.text.toLowerCase();

  const isVideoReq = t.includes('video') || t.includes('clip') || t.includes('movie') || t.includes('animate');
  const isImageReq = t.includes('image') || t.includes('draw') || t.includes('photo') || t.includes('picture') || t.includes('art') || t.includes('paint');
  const isMusicReq = t.includes('music') || t.includes('song') || t.includes('audio') || t.includes('track');
  const isSpeechReq = t.includes('transcribe') || t.includes('voice') || t.includes('speech');
  const isDeepSeekReq = t.includes('deepseek') || t.includes('reason');
  const isOpenClawReq = t.includes('openclaw') || t.includes('agent') || t.includes('research') || t.includes('investigate') || t.includes('solve');

  let modelNodeType = 'hf_router';
  let modelId = 'meta-llama/Llama-3.3-70B-Instruct';
  let outputField = 'response_text';
  let templateMessage = '🤖 **[HF AI Model]**:\n\n{{ $node["AI Model"].response_text }}';

  if (isOpenClawReq) {
    modelNodeType = 'openclaw_agent';
    modelId = 'openclaw/openclaw';
    outputField = 'agent_response';
    templateMessage = '{{ $node["AI Model"].agent_response }}';
  } else if (isVideoReq) {
    modelNodeType = 'hf_video_gen';
    modelId = 'zeroscope_v2_576w';
    outputField = 'preview_image_url';
    templateMessage = '🎥 **[ZeroScope v2 Video Generator]**:\n\nGenerated Video Scene for prompt: "' + event.text + '"!\n\n🖼️ View Image: {{ $node["AI Model"].preview_image_url }}';
  } else if (isImageReq) {
    modelNodeType = 'hf_image_gen';
    modelId = 'black-forest-labs/FLUX.1-schnell';
    outputField = 'image_url';
    templateMessage = '🎨 **[FLUX.1 Photorealistic Image Generator]**:\n\nGenerated Image for prompt: "' + event.text + '"!\n\n🖼️ View Image: {{ $node["AI Model"].image_url }}';
  } else if (isMusicReq) {
    modelNodeType = 'hf_music_gen';
    modelId = 'facebook/musicgen-small';
    outputField = 'audio_url';
    templateMessage = '🎵 **[MusicGen Stereo Audio Composer]**:\n\nGenerated 10s audio track for prompt: "' + event.text + '"!\n\n🎶 Listen Audio: {{ $node["AI Model"].audio_url }}';
  } else if (isSpeechReq) {
    modelNodeType = 'hf_speech_to_text';
    modelId = 'openai/whisper-large-v3';
    outputField = 'transcription';
    templateMessage = '🎤 **[Whisper Speech-to-Text Transcribe]**:\n\nTranscribed Voice: {{ $node["AI Model"].transcription }}';
  } else if (isDeepSeekReq) {
    modelNodeType = 'hf_router';
    modelId = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B';
    outputField = 'response_text';
    templateMessage = '🧠 **[DeepSeek R1 Reasoning Model]**:\n\n{{ $node["AI Model"].response_text }}';
  }

  const nodes = [
    {
      id: 'trigger_node',
      type: `${event.provider}_trigger`,
      data: {
        label: `${event.provider.toUpperCase()} Trigger`,
        type: `${event.provider}_trigger`,
        category: 'triggers',
        config: { bot_token: event.botToken, chat_id: event.chatId },
        lastOutput: { chat_id: event.chatId, text: event.text, sender_name: event.senderName },
      },
    },
    {
      id: 'model_node',
      type: modelNodeType,
      data: {
        label: 'AI Model',
        type: modelNodeType,
        category: 'models',
        config: {
          model_id: modelId,
          user_prompt: event.text,
          prompt_template: event.text,
          hf_token: event.hfToken,
        },
      },
    },
    {
      id: 'reply_node',
      type: `${event.provider}_reply`,
      data: {
        label: `${event.provider.toUpperCase()} Reply`,
        type: `${event.provider}_reply`,
        category: 'actions',
        config: {
          bot_token: event.botToken,
          chat_id_template: event.chatId,
          message_template: templateMessage,
        },
      },
    },
  ];

  const edges = [
    { id: 'e1', source: 'trigger_node', sourceHandle: 'text', target: 'model_node', targetHandle: 'user_prompt' },
    { id: 'e2', source: 'model_node', sourceHandle: outputField, target: 'reply_node', targetHandle: 'text' },
  ];

  return await executeWorkflow({
    nodes,
    edges,
    hfToken: event.hfToken,
    userInputs: {
      chat_id: event.chatId,
      text: event.text,
      sender_name: event.senderName,
      bot_token: event.botToken,
    },
  });
}
