import { HFSpaceInfo } from '../../../packages/shared-types';

export const FEATURED_SPACES: HFSpaceInfo[] = [
  {
    id: 'black-forest-labs/FLUX.1-schnell',
    author: 'black-forest-labs',
    name: 'FLUX.1-schnell',
    title: 'FLUX.1 Schnell Image Generator',
    sdk: 'gradio',
    hardware: 'ZeroGPU',
    likes: 14200,
    private: false,
    url: 'https://huggingface.co/spaces/black-forest-labs/FLUX.1-schnell',
    embedUrl: 'https://black-forest-labs-flux-1-schnell.hf.space',
    category: 'image',
    description: 'Ultra-fast state-of-the-art text-to-image generation model running on ZeroGPU.',
    endpoints: [
      {
        name: '/infer',
        description: 'Generate 1024x1024 photorealistic images from text prompts.',
        inputs: [
          { name: 'prompt', type: 'string' },
          { name: 'seed', type: 'number' },
          { name: 'num_inference_steps', type: 'number' },
        ],
        outputs: [{ name: 'result_image', type: 'image' }],
      },
    ],
  },
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    author: 'stabilityai',
    name: 'stable-diffusion-xl-base-1.0',
    title: 'Stable Diffusion XL Base 1.0',
    sdk: 'gradio',
    hardware: 'A10G-Large',
    likes: 28900,
    private: false,
    url: 'https://huggingface.co/spaces/stabilityai/stable-diffusion-xl-base-1.0',
    embedUrl: 'https://stabilityai-stable-diffusion-xl-base-1-0.hf.space',
    category: 'image',
    description: 'High resolution 1024x1024 diffusion model with negative prompts and CFG controls.',
    endpoints: [
      {
        name: '/predict',
        description: 'Text-to-image diffusion inference pipeline.',
        inputs: [
          { name: 'prompt', type: 'string' },
          { name: 'negative_prompt', type: 'string' },
          { name: 'guidance_scale', type: 'number' },
        ],
        outputs: [{ name: 'output_image', type: 'image' }],
      },
    ],
  },
  {
    id: 'openai/whisper-large-v3',
    author: 'openai',
    name: 'whisper-large-v3',
    title: 'Whisper Large v3 Speech Recognizer',
    sdk: 'gradio',
    hardware: 'ZeroGPU',
    likes: 19400,
    private: false,
    url: 'https://huggingface.co/spaces/openai/whisper-large-v3',
    embedUrl: 'https://openai-whisper-large-v3.hf.space',
    category: 'audio',
    description: 'Multilingual automatic speech recognition and audio transcription pipeline.',
    endpoints: [
      {
        name: '/transcribe',
        description: 'Transcribe raw audio file into plain text with timestamps.',
        inputs: [{ name: 'audio_file', type: 'audio' }],
        outputs: [
          { name: 'transcription_text', type: 'string' },
          { name: 'detected_language', type: 'string' },
        ],
      },
    ],
  },
  {
    id: 'facebook/musicgen-stereo',
    author: 'facebook',
    name: 'musicgen-stereo',
    title: 'MusicGen Stereo Audio Composer',
    sdk: 'gradio',
    hardware: 'T4-Small',
    likes: 11200,
    private: false,
    url: 'https://huggingface.co/spaces/facebook/musicgen-stereo',
    embedUrl: 'https://facebook-musicgen-stereo.hf.space',
    category: 'audio',
    description: 'Controllable text-to-music generation model producing 32kHz stereo audio streams.',
    endpoints: [
      {
        name: '/generate_music',
        description: 'Generate high-fidelity background tracks from descriptive text.',
        inputs: [
          { name: 'text_prompt', type: 'string' },
          { name: 'duration_seconds', type: 'number' },
        ],
        outputs: [{ name: 'audio_output', type: 'audio' }],
      },
    ],
  },
];

export async function getUserHFAssets(token?: string) {
  if (!token || token.includes('demo')) {
    return { username: null, spaces: [], models: [], datasets: [] };
  }

  try {
    const headers = { Authorization: `Bearer ${token}` };

    // Step 1: Whoami
    const whoRes = await fetch('https://huggingface.co/api/whoami-v2', { headers });
    if (!whoRes.ok) return { username: null, spaces: [], models: [], datasets: [] };
    const whoData = await whoRes.json();
    const username = whoData.name || whoData.preferred_username;

    if (!username) return { username: null, spaces: [], models: [], datasets: [] };

    // Step 2: Fetch Spaces, Models, and Datasets in parallel
    const [spacesRes, modelsRes, datasetsRes] = await Promise.all([
      fetch(`https://huggingface.co/api/spaces?author=${username}&limit=20`, { headers }).catch(() => null),
      fetch(`https://huggingface.co/api/models?author=${username}&limit=20`, { headers }).catch(() => null),
      fetch(`https://huggingface.co/api/datasets?author=${username}&limit=20`, { headers }).catch(() => null),
    ]);

    const userSpaces = spacesRes?.ok ? await spacesRes.json() : [];
    const userModels = modelsRes?.ok ? await modelsRes.json() : [];
    const userDatasets = datasetsRes?.ok ? await datasetsRes.json() : [];

    return {
      username,
      spaces: userSpaces,
      models: userModels,
      datasets: userDatasets,
    };
  } catch (err) {
    return { username: null, spaces: [], models: [], datasets: [] };
  }
}

export async function getSpacesList(category?: string, search?: string, token?: string): Promise<HFSpaceInfo[]> {
  let result = [...FEATURED_SPACES];

  if (token && !token.includes('demo')) {
    const userAssets = await getUserHFAssets(token);
    if (userAssets.spaces?.length > 0) {
      const customSpaces: HFSpaceInfo[] = userAssets.spaces.map((s: any) => ({
        id: s.id,
        author: s.author || userAssets.username,
        name: s.id.split('/')[1] || s.id,
        title: `${s.id} (My Account Space)`,
        sdk: s.sdk || 'gradio',
        hardware: s.hardware || 'CPU-Basic',
        likes: s.likes || 0,
        private: s.private || false,
        url: `https://huggingface.co/spaces/${s.id}`,
        embedUrl: `https://${s.id.replace('/', '-')}.hf.space`,
        category: 'other',
        description: `Personal Hugging Face Space repository owned by @${userAssets.username}.`,
        endpoints: [],
      }));
      result = [...customSpaces, ...result];
    }
  }

  if (category && category !== 'all') {
    result = result.filter((s) => s.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }

  return result;
}
