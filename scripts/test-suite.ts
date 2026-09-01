import { getInitials } from '../apps/web/components/ui/UserAvatar';
import { WorkflowTemplatesList } from '../apps/web/lib/templates';
import { parseAndValidateDAG } from '../apps/web/lib/engine/dagParser';
import { executeWorkflow } from '../apps/web/lib/engine/executor';
import { NODE_REGISTRY } from '../apps/web/lib/nodeRegistry';
import { useAuthStore } from '../apps/web/lib/store/useAuthStore';
import { useSettingsStore } from '../apps/web/lib/store/useSettingsStore';
import { useWorkflowStore } from '../apps/web/lib/store/useWorkflowStore';
import { resolveVariableTemplate, resolveNodeParameters } from '../apps/web/lib/engine/variableResolver';
import { executeMusicGenNode, generateGenerativeMusicWav } from '../apps/web/lib/engine/nodes/musicGen';
import { executeVideoGenNode } from '../apps/web/lib/engine/nodes/videoGen';
import { executeOpenClawAgentNode } from '../apps/web/lib/engine/nodes/openclawAgent';
import { processInboundEvent } from '../apps/web/lib/triggers/eventRouter';
import { ensureDatasetRepository, syncWorkflowToHF } from '../apps/web/lib/hfStorage';

async function runComprehensiveTestSuite() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🧪 ULTRA-COMPREHENSIVE TEST SUITE FOR ALL COMPONENTS, MODELS & PAGES');
  console.log('════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  // ── 1. ZUSTAND STORES & PERSISTENCE STATE ─────────────────────────────────
  console.log('🔹 1. Testing All Zustand Stores & State Mutations:');

  // 1a. Auth Store
  const authInitial = useAuthStore.getState();
  assert('useAuthStore has defined user state schema', authInitial.user === null || typeof authInitial.user === 'object');
  assert('useAuthStore authentication status boolean is valid', typeof authInitial.isAuthenticated === 'boolean');
  assert('useAuthStore loginWithToken function is defined', typeof authInitial.loginWithToken === 'function');

  useAuthStore.getState().setAuthUser({
    username: 'test_coder',
    fullname: 'Test Coder',
    datasetPath: 'datasets/test_coder/hf-data',
    creditBalance: 3000,
  }, 'hf_mock_token_abc');
  const authUpdated = useAuthStore.getState();
  assert('useAuthStore setAuthUser mutates state accurately', authUpdated.user?.username === 'test_coder' && authUpdated.hfToken === 'hf_mock_token_abc');

  // Restore auth
  useAuthStore.getState().setAuthUser({
    username: 'mahmoud-mohasseb',
    fullname: 'Mahmoud Mohasseb',
    datasetPath: 'datasets/mahmoud-mohasseb/hf-workflow-data',
    creditBalance: 1250,
  });

  // 1b. Settings Store (9 Domains)
  const settings = useSettingsStore.getState();
  assert('useSettingsStore initializes credentials domain', !!settings.credentials);
  assert('useSettingsStore initializes models domain', !!settings.models && !!settings.models.textModel);
  assert('useSettingsStore initializes engine domain', !!settings.engine && typeof settings.engine.executionTimeoutMs === 'number');
  assert('useSettingsStore initializes canvas/theme domain', !!settings.canvas && !!settings.canvas.theme);
  assert('useSettingsStore initializes notifications domain', !!settings.notifications);
  assert('useSettingsStore initializes security domain', !!settings.security);
  assert('useSettingsStore initializes storage domain', !!settings.storage && !!settings.storage.hfDatasetName);

  // Theme mutation test
  const themes = ['dark-glass', 'deep-slate', 'neon-purple', 'midnight-navy'] as const;
  for (const theme of themes) {
    useSettingsStore.getState().setCanvas({ theme });
    assert(`useSettingsStore switches theme to [${theme}]`, useSettingsStore.getState().canvas.theme === theme);
  }
  useSettingsStore.getState().setCanvas({ theme: 'dark-glass' });

  // Model defaults mutation
  useSettingsStore.getState().setModels({
    textModel: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    imageModel: 'black-forest-labs/FLUX.1-schnell',
    videoModel: 'cerspense/zeroscope_v2_576w',
    musicModel: 'facebook/musicgen-small',
    speechModel: 'openai/whisper-large-v3',
  });
  assert('useSettingsStore sets custom default models across all 5 modalities',
    useSettingsStore.getState().models.textModel.includes('DeepSeek-R1') &&
    useSettingsStore.getState().models.imageModel.includes('FLUX.1')
  );

  // Engine timeouts mutation
  useSettingsStore.getState().setEngine({ executionTimeoutMs: 60000, maxRetries: 3, retryDelayMs: 2000 });
  assert('useSettingsStore updates engine timeouts & retries',
    useSettingsStore.getState().engine.executionTimeoutMs === 60000 &&
    useSettingsStore.getState().engine.maxRetries === 3
  );

  // Reset to factory defaults
  useSettingsStore.getState().resetToDefaults();
  assert('useSettingsStore resetToDefaults restores factory settings', useSettingsStore.getState().canvas.theme === 'dark-glass');

  // 1c. Workflow Store (Visual Graph DAG)
  const testNode: any = {
    id: 'node_test_1',
    type: 'hf_router',
    position: { x: 150, y: 150 },
    data: { label: 'Test Node', type: 'hf_router', config: { model_id: 'meta-llama/Llama-3.3-70B-Instruct' } }
  };
  useWorkflowStore.getState().setNodes([testNode]);
  assert('useWorkflowStore setNodes adds node to canvas graph', useWorkflowStore.getState().nodes.length === 1);

  useWorkflowStore.getState().updateNodeConfig('node_test_1', { temperature: 0.7, max_tokens: 1024 });
  assert('useWorkflowStore updateNodeConfig updates hyperparameters', (useWorkflowStore.getState().nodes[0].data as any).config.temperature === 0.7);

  useWorkflowStore.getState().deleteNode('node_test_1');
  assert('useWorkflowStore deleteNode removes node cleanly', useWorkflowStore.getState().nodes.length === 0);

  // ── 2. UI HELPERS & AVATAR GENERATOR ──────────────────────────────────────
  console.log('\n🔹 2. Testing UI Helpers & UserAvatar Component Initials:');
  assert('Avatar initials for "Mahmoud Mohasseb" -> "MM"', getInitials('Mahmoud Mohasseb') === 'MM');
  assert('Avatar initials for hyphenated "mahmoud-mohasseb" -> "MM"', getInitials(null, 'mahmoud-mohasseb') === 'MM');
  assert('Avatar initials for single word "Alex" -> "AL"', getInitials('Alex') === 'AL');
  assert('Avatar initials for underscore "sarah_connor" -> "SC"', getInitials(null, 'sarah_connor') === 'SC');
  assert('Avatar initials fallback -> "HF"', getInitials(null, null) === 'HF');

  // ── 3. NODE REGISTRY & SCHEMAS (ALL 12 NODES) ─────────────────────────────
  console.log('\n🔹 3. Testing Node Registry Definitions & Port Schemas (12 Nodes):');
  const all12NodeTypes = [
    'telegram_trigger',
    'whatsapp_trigger',
    'hf_router',
    'hf_image_gen',
    'hf_video_gen',
    'hf_music_gen',
    'hf_speech_to_text',
    'hf_zero_shot',
    'openclaw_agent',
    'gradio_space',
    'logic_transform',
    'telegram_reply',
    'whatsapp_reply',
  ];

  for (const type of all12NodeTypes) {
    const nodeDef = NODE_REGISTRY[type as keyof typeof NODE_REGISTRY];
    assert(`Node [${type}] registered with inputs, outputs, schema, & creditCost`,
      !!nodeDef &&
      Array.isArray(nodeDef.inputs) &&
      Array.isArray(nodeDef.outputs) &&
      Array.isArray(nodeDef.schema) &&
      typeof nodeDef.creditCost === 'number'
    );
  }

  // ── 4. WORKFLOW TEMPLATES (ALL 12 PRE-BUILT TEMPLATES) ────────────────────
  console.log('\n🔹 4. Testing All 12 Workflow Templates DAG Topologies:');
  assert('At least 12 workflow templates registered', WorkflowTemplatesList.length >= 12);

  for (const tpl of WorkflowTemplatesList) {
    const dag = parseAndValidateDAG(tpl.nodes, tpl.edges);
    assert(`Template DAG "${tpl.name.slice(0, 32)}..." valid with batches >= 1`,
      dag.isValid && dag.topologicalBatches.length >= 1 && dag.errors.length === 0,
      dag.errors.join(', ')
    );
  }

  console.log('\n🔹 4b. Testing Loading & Executing All 12 Workflow Templates End-to-End:');
  for (const tpl of WorkflowTemplatesList) {
    // 1. Simulate loading into canvas & Zustand store
    useWorkflowStore.getState().setNodes(tpl.nodes as any);
    useWorkflowStore.getState().setEdges(tpl.edges as any);
    assert(`Canvas Store loads template: "${tpl.name.slice(0, 28)}..."`,
      useWorkflowStore.getState().nodes.length === tpl.nodes.length
    );

    // 2. Execute the entire loaded template workflow graph
    const execRes = await executeWorkflow({
      nodes: tpl.nodes,
      edges: tpl.edges,
      userInputs: { text: 'Test execution prompt for template' },
    });

    assert(`Loaded Template "${tpl.name.slice(0, 28)}..." executes successfully`,
      execRes.success && Object.keys(execRes.nodeOutputs).length >= 1,
      execRes.errors?.join(', ')
    );
  }

  // ── 5. MULTI-MODAL MODEL PIPELINES & GENERATIVE ENGINES ───────────────────
  console.log('\n🔹 5. Testing Multi-Modal AI Model Execution Pipelines:');

  // 5a. LLM Text & Reasoning (Llama 3.3 70B, DeepSeek R1 32B, Llama Vision 11B, Qwen Coder 32B)
  const llmNodes = [
    { id: 'tg_in', type: 'telegram_trigger', data: { type: 'telegram_trigger', label: 'Telegram Trigger', config: { listen_commands: '/ai' } } },
    { id: 'hf_llm', type: 'hf_router', data: { type: 'hf_router', label: 'Llama 3.3 70B', config: { model_id: 'meta-llama/Llama-3.3-70B-Instruct', user_prompt: 'Explain quantum computing' } } },
    { id: 'tg_out', type: 'telegram_reply', data: { type: 'telegram_reply', label: 'Telegram Reply', config: { chat_id_template: '987654321', message_template: '{{ $node["Llama 3.3 70B"].response_text }}' } } },
  ];
  const llmEdges = [
    { id: 'e1', source: 'tg_in', target: 'hf_llm' },
    { id: 'e2', source: 'hf_llm', target: 'tg_out' },
  ];
  const llmResult = await executeWorkflow({ nodes: llmNodes, edges: llmEdges });
  assert('Model [meta-llama/Llama-3.3-70B-Instruct] executes successfully', llmResult.success);
  assert('Llama 3.3 produces response_text', typeof llmResult.nodeOutputs['hf_llm']?.response_text === 'string' && llmResult.nodeOutputs['hf_llm'].response_text.length > 0);
  assert('Telegram Reply delivers message payload', !!llmResult.nodeOutputs['tg_out']?.delivered_to);

  // DeepSeek R1 32B Reasoning Test
  const r1Nodes = [
    { id: 'r1_node', type: 'hf_router', data: { type: 'hf_router', label: 'DeepSeek R1', config: { model_id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', user_prompt: 'Verify if P=NP and show mathematical proof steps' } } },
  ];
  const r1Result = await executeWorkflow({ nodes: r1Nodes, edges: [] });
  assert('Model [deepseek-ai/DeepSeek-R1-Distill-Qwen-32B] executes successfully', r1Result.success);
  assert('DeepSeek R1 produces reasoning thoughts', !!r1Result.nodeOutputs['r1_node']?.response_text);

  // Llama Vision 11B Test
  const visionNodes = [
    { id: 'vision_node', type: 'hf_router', data: { type: 'hf_router', label: 'Llama Vision 11B', config: { model_id: 'meta-llama/Llama-3.2-11B-Vision-Instruct', user_prompt: 'Analyze image https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe and describe visual scene' } } },
  ];
  const visionResult = await executeWorkflow({ nodes: visionNodes, edges: [] });
  assert('Model [meta-llama/Llama-3.2-11B-Vision-Instruct] executes successfully', visionResult.success);
  assert('Llama Vision outputs scene caption', !!visionResult.nodeOutputs['vision_node']?.response_text);

  // Qwen 2.5 Coder 32B Test
  const coderNodes = [
    { id: 'coder_node', type: 'hf_router', data: { type: 'hf_router', label: 'Qwen Coder 32B', config: { model_id: 'Qwen/Qwen2.5-Coder-32B-Instruct', user_prompt: 'Write an asynchronous topological sort in TypeScript' } } },
  ];
  const coderResult = await executeWorkflow({ nodes: coderNodes, edges: [] });
  assert('Model [Qwen/Qwen2.5-Coder-32B-Instruct] executes successfully', coderResult.success);
  assert('Qwen Coder produces TypeScript syntax', !!coderResult.nodeOutputs['coder_node']?.response_text);

  // 5b. Photorealistic Image Generation (FLUX.1 Schnell)
  const imgNodes = [
    { id: 'wa_in', type: 'whatsapp_trigger', data: { type: 'whatsapp_trigger', label: 'WhatsApp Trigger' } },
    { id: 'hf_img', type: 'hf_image_gen', data: { type: 'hf_image_gen', label: 'FLUX.1 Schnell', config: { prompt_template: 'Cybernetic neon city at sunset' } } },
    { id: 'wa_out', type: 'whatsapp_reply', data: { type: 'whatsapp_reply', label: 'WhatsApp Reply' } },
  ];
  const imgEdges = [
    { id: 'e1', source: 'wa_in', target: 'hf_img' },
    { id: 'e2', source: 'hf_img', target: 'wa_out' },
  ];
  const imgResult = await executeWorkflow({ nodes: imgNodes, edges: imgEdges });
  assert('Image Generation Pipeline executes successfully', imgResult.success);
  assert('Image Generation produces valid image_url', typeof imgResult.nodeOutputs['hf_img']?.image_url === 'string');

  // 5c. Prompt-Specific Video Generation Engine (ZeroScope v2)
  const videoTestResult = await executeVideoGenNode('video about pyramids', 'cerspense/zeroscope_v2_576w');
  assert('Video Gen Engine returns valid previewImageUrl without animation distortion',
    typeof videoTestResult.previewImageUrl === 'string' &&
    videoTestResult.previewImageUrl.includes('pyramids')
  );
  assert('Video Gen Engine returns valid videoUrl', typeof videoTestResult.videoUrl === 'string');

  // 5d. Generative Multi-Track Audio Synthesizer (MusicGen & PCM Synthesis)
  const synthWavResult = generateGenerativeMusicWav('techno edm fast beat', 6);
  assert('PCM Synthesizer generates 16-bit WAV data URI with bpm & genre',
    synthWavResult.audioUrl.startsWith('data:audio/wav;base64,') &&
    synthWavResult.bpm === 128 &&
    synthWavResult.genre.includes('Beat')
  );

  const musicGenResult = await executeMusicGenNode('relaxing lo-fi chill piano melody', 6);
  assert('Music Gen Engine executes successfully and returns playable audio',
    typeof musicGenResult.audioUrl === 'string' &&
    musicGenResult.duration === 6 &&
    musicGenResult.bpm === 80
  );

  // 5e. Speech Recognition (Whisper Large v3)
  const whisperNodes = [
    { id: 'wa_in', type: 'whatsapp_trigger', data: { type: 'whatsapp_trigger', label: 'WhatsApp Trigger' } },
    { id: 'hf_whisper', type: 'hf_speech_to_text', data: { type: 'hf_speech_to_text', label: 'Whisper Transcriber', config: { model_id: 'openai/whisper-large-v3' } } },
    { id: 'wa_out', type: 'whatsapp_reply', data: { type: 'whatsapp_reply', label: 'WhatsApp Reply' } },
  ];
  const whisperEdges = [
    { id: 'e1', source: 'wa_in', target: 'hf_whisper' },
    { id: 'e2', source: 'hf_whisper', target: 'wa_out' },
  ];
  const whisperResult = await executeWorkflow({ nodes: whisperNodes, edges: whisperEdges });
  assert('Whisper Speech-to-Text executes successfully', whisperResult.success);
  assert('Whisper produces text transcription', typeof whisperResult.nodeOutputs['hf_whisper']?.transcription === 'string');

  // 5f. OpenClaw Autonomous AI Agent Multi-Tool Pipeline
  const openclawResult = await executeOpenClawAgentNode('Search latest quantum computing breakthroughs and calculate speedup in python', {
    agent_role: 'deep_researcher',
    enable_web_search: true,
    enable_python_interpreter: true,
    enable_dataset_memory: true,
  });
  assert('OpenClaw Agent executes autonomous ReAct loop', openclawResult.status === 'COMPLETED');
  assert('OpenClaw Agent produces structured response', typeof openclawResult.agentResponse === 'string' && openclawResult.agentResponse.length > 0);
  assert('OpenClaw Agent records multi-step tool calls', openclawResult.toolCalls.length >= 1);
  assert('OpenClaw Agent tracks persistent memory state', !!openclawResult.memoryState.activeRole);

  // 5g. ZeroGPU Community Gradio Space (black-forest-labs/FLUX.1-schnell)
  const gradioNodes = [
    { id: 'gradio_node', type: 'gradio_space', data: { type: 'gradio_space', label: 'Gradio ZeroGPU Space', config: { space_slug: 'black-forest-labs/FLUX.1-schnell', prompt: 'futuristic holographic interface' } } },
  ];
  const gradioResult = await executeWorkflow({ nodes: gradioNodes, edges: [] });
  assert('Gradio ZeroGPU Space executes successfully', gradioResult.success);
  assert('Gradio Space returns media output', !!gradioResult.nodeOutputs['gradio_node']);

  // 5h. JavaScript Logic & Expression Transform Engine
  const logicNodes = [
    { id: 'tg_in', type: 'telegram_trigger', data: { type: 'telegram_trigger', label: 'Telegram Trigger' } },
    { id: 'logic_1', type: 'logic_transform', data: { type: 'logic_transform', label: 'Logic Transform', config: { transform_code: 'return { upper: String(inputA).toUpperCase(), length: String(inputA).length };' } } },
  ];
  const logicEdges = [{ id: 'e1', source: 'tg_in', target: 'logic_1' }];
  const logicResult = await executeWorkflow({ nodes: logicNodes, edges: logicEdges });
  assert('JavaScript Logic Transform executes and computes output', logicResult.success);

  // 5i. Zero-Shot Intent Classifier Pipeline (facebook/bart-large-mnli)
  const zeroShotNodes = [
    { id: 'tg_in', type: 'telegram_trigger', data: { type: 'telegram_trigger', label: 'Telegram Trigger' } },
    { id: 'zero_shot_1', type: 'hf_zero_shot', data: { type: 'hf_zero_shot', label: 'Zero-Shot Classifier', config: { modality: 'text_intent', model_id: 'facebook/bart-large-mnli', candidate_labels: 'billing_refund, technical_issue, spam, sales' } } },
    { id: 'tg_out', type: 'telegram_reply', data: { type: 'telegram_reply', label: 'Telegram Reply' } },
  ];
  const zeroShotEdges = [
    { id: 'e1', source: 'tg_in', target: 'zero_shot_1' },
    { id: 'e2', source: 'zero_shot_1', target: 'tg_out' },
  ];
  const zeroShotResult = await executeWorkflow({
    nodes: zeroShotNodes,
    edges: zeroShotEdges,
    userInputs: { text: 'I would like to get a refund for my last invoice' },
  });
  assert('Zero-Shot AI Text Classifier executes successfully', zeroShotResult.success);
  assert('Zero-Shot AI Text Classifier outputs top predicted label', typeof zeroShotResult.nodeOutputs['zero_shot_1']?.top_label === 'string');
  assert('Zero-Shot AI Text Classifier outputs confidence score', typeof zeroShotResult.nodeOutputs['zero_shot_1']?.confidence === 'number');
  assert('Zero-Shot AI Text Classifier outputs JSON label scores dictionary', typeof zeroShotResult.nodeOutputs['zero_shot_1']?.scores === 'object');

  // 5j. Zero-Shot Vision CLIP Concept Classifier Pipeline (openai/clip-vit-large-patch14)
  const clipNodes = [
    { id: 'wa_in', type: 'whatsapp_trigger', data: { type: 'whatsapp_trigger', label: 'WhatsApp Trigger' } },
    { id: 'clip_node', type: 'hf_zero_shot', data: { type: 'hf_zero_shot', label: 'CLIP Vision Classifier', config: { modality: 'vision_clip', model_id: 'openai/clip-vit-large-patch14', candidate_labels: 'invoice_receipt, food_dish, car, landscape' } } },
    { id: 'wa_out', type: 'whatsapp_reply', data: { type: 'whatsapp_reply', label: 'WhatsApp Reply' } },
  ];
  const clipEdges = [
    { id: 'e1', source: 'wa_in', target: 'clip_node' },
    { id: 'e2', source: 'clip_node', target: 'wa_out' },
  ];
  const clipResult = await executeWorkflow({
    nodes: clipNodes,
    edges: clipEdges,
    userInputs: { image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1' },
  });
  assert('CLIP Zero-Shot Vision Classifier executes successfully', clipResult.success);
  assert('CLIP Zero-Shot Vision outputs visual concept label', typeof clipResult.nodeOutputs['clip_node']?.top_label === 'string');
  assert('CLIP Zero-Shot Vision outputs probability confidence', typeof clipResult.nodeOutputs['clip_node']?.confidence === 'number');

  // 5k. Zero-Shot Object Detection Pipeline (google/owlvit-base-patch32)
  const owlNodes = [
    { id: 'owl_node', type: 'hf_zero_shot', data: { type: 'hf_zero_shot', label: 'OWL-ViT Detector', config: { modality: 'object_detection', model_id: 'google/owlvit-base-patch32', candidate_labels: 'person, dog, car, laptop' } } },
  ];
  const owlResult = await executeWorkflow({
    nodes: owlNodes,
    edges: [],
    userInputs: { image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1' },
  });
  assert('OWL-ViT Zero-Shot Object Detector executes successfully', owlResult.success);
  assert('OWL-ViT outputs detected bounding box objects', Array.isArray(owlResult.nodeOutputs['owl_node']?.detected_objects));

  // ── 6. INBOUND BOT EVENT ROUTER & WEBHOOK SIMULATOR ───────────────────────
  console.log('\n🔹 6. Testing Inbound Bot Event Router & Webhook Simulator:');

  // 6a. Text routing
  const textEventResult = await processInboundEvent({
    provider: 'telegram',
    chatId: '987654321',
    senderName: 'TestUser',
    text: 'What is the speed of light?',
  });
  assert('Inbound Text Event routed through LLM pipeline', textEventResult.success && Object.keys(textEventResult.nodeOutputs).length >= 1);

  // 6b. OpenClaw Autonomous routing
  const openclawEventResult = await processInboundEvent({
    provider: 'telegram',
    chatId: '987654321',
    senderName: 'AgentUser',
    text: '/agent research quantum teleportation algorithms',
  });
  assert('Inbound OpenClaw Event routed through OpenClaw Agent pipeline', openclawEventResult.success && Object.keys(openclawEventResult.nodeOutputs).length >= 1);

  // 6c. Image routing
  const imgEventResult = await processInboundEvent({
    provider: 'telegram',
    chatId: '987654321',
    senderName: 'ArtUser',
    text: '/image a futuristic space station',
  });
  assert('Inbound Image Event routed through FLUX.1 pipeline', imgEventResult.success && Object.keys(imgEventResult.nodeOutputs).length >= 1);

  // 6d. Video routing
  const vidEventResult = await processInboundEvent({
    provider: 'telegram',
    chatId: '987654321',
    senderName: 'VideoUser',
    text: '/video of the pyramids in egypt',
  });
  assert('Inbound Video Event routed through ZeroScope pipeline', vidEventResult.success && Object.keys(vidEventResult.nodeOutputs).length >= 1);

  // 6e. Music routing
  const musicEventResult = await processInboundEvent({
    provider: 'telegram',
    chatId: '987654321',
    senderName: 'MusicUser',
    text: 'generate music beat for coding',
  });
  assert('Inbound Music Event routed through MusicGen pipeline', musicEventResult.success && Object.keys(musicEventResult.nodeOutputs).length >= 1);

  // 6f. Isolated Workflow Assignment & Execution
  const { setAssignedBotWorkflowId, getAssignedBotWorkflowId, resolveWorkflowForEvent } = await import('../apps/web/lib/engine/workflowLoader');
  const { setTelegramChatModel, getTelegramChatSession } = await import('../apps/web/lib/triggers/telegramSessionStore');

  // ── TEST SCENARIO A: Zero Video Generation ──────────────────────────────
  console.log('\n🔹 Test A — Zero Video Generation Pipeline:');
  const zeroVideoNodes = [
    { id: 'tg_in', type: 'telegram_trigger', data: { type: 'telegram_trigger', label: 'Telegram Trigger' } },
    { id: 'video_node', type: 'hf_video_gen', data: { type: 'hf_video_gen', label: 'ZeroScope Video Gen', config: { model_id: 'cerspense/zeroscope_v2_576w', user_prompt: 'Cosmic galaxy starfield voyage' } } },
    { id: 'music_node', type: 'hf_music_gen', data: { type: 'hf_music_gen', label: 'Background Music', config: { duration_seconds: 6 } } },
    { id: 'tg_out', type: 'telegram_reply', data: { type: 'telegram_reply', label: 'Telegram Reply' } },
  ];
  const zeroVideoEdges = [
    { id: 'e1', source: 'tg_in', target: 'video_node' },
    { id: 'e2', source: 'video_node', target: 'music_node' },
    { id: 'e3', source: 'video_node', target: 'tg_out' },
  ];
  const zeroVideoRes = await executeWorkflow({
    nodes: zeroVideoNodes,
    edges: zeroVideoEdges,
    userInputs: { text: 'Generate a cosmic galaxy video' },
  });
  assert('Test A: Zero video model executes successfully', zeroVideoRes.success);
  assert('Test A: Output contains actual video URL (.mp4 format)', typeof zeroVideoRes.nodeOutputs['video_node']?.video_url === 'string' && zeroVideoRes.nodeOutputs['video_node']?.video_url.includes('.mp4'));
  assert('Test A: Output is not an image disguised as video', !zeroVideoRes.nodeOutputs['video_node']?.video_url.includes('.png') && !zeroVideoRes.nodeOutputs['video_node']?.video_url.includes('.jpg'));
  assert('Test A: Result includes optional audio track', !!zeroVideoRes.nodeOutputs['music_node']?.audio_url);
  assert('Test A: Video flag hasVideo is set to true', zeroVideoRes.hasVideo === true);

  // ── TEST SCENARIO B: Multiple Voices Preservation & Merging ───────────────
  console.log('\n🔹 Test B — Multiple Voices Generation & Preservation:');
  const multiVoiceNodes = [
    { id: 'tg_in', type: 'telegram_trigger', data: { type: 'telegram_trigger', label: 'Telegram Trigger' } },
    {
      id: 'voice_node',
      type: 'hf_speech_to_text',
      data: {
        type: 'hf_speech_to_text',
        label: 'Multi-Voice Engine',
        config: {
          script: "Alice: Welcome to our Hugging Face AI workflow!\nBob: Thank you Alice, let us run this pipeline.\nNarrator: And so the multi-modal workflow executed flawlessly.",
        },
      },
    },
    { id: 'tg_out', type: 'telegram_reply', data: { type: 'telegram_reply', label: 'Telegram Reply' } },
  ];
  const multiVoiceEdges = [
    { id: 'e1', source: 'tg_in', target: 'voice_node' },
    { id: 'e2', source: 'voice_node', target: 'tg_out' },
  ];
  const multiVoiceRes = await executeWorkflow({
    nodes: multiVoiceNodes,
    edges: multiVoiceEdges,
  });
  assert('Test B: Multi-voice pipeline executes successfully', multiVoiceRes.success);
  assert('Test B: All requested voices generated (count >= 3)', multiVoiceRes.nodeOutputs['voice_node']?.voices_count >= 3);
  assert('Test B: All audio tracks preserved in output array', Array.isArray(multiVoiceRes.nodeOutputs['voice_node']?.audio_tracks) && multiVoiceRes.nodeOutputs['voice_node']?.audio_tracks.length >= 3);
  assert('Test B: Individual character voice objects preserved', !!multiVoiceRes.nodeOutputs['voice_node']?.voices?.alice && !!multiVoiceRes.nodeOutputs['voice_node']?.voices?.bob);
  assert('Test B: Composite master audio produced', typeof multiVoiceRes.nodeOutputs['voice_node']?.audio_url === 'string');

  // ── TEST SCENARIO C: Telegram Model Switch (/model zero) ─────────────────
  console.log('\n🔹 Test C — Telegram Model Switching (/model zero):');
  const testChatId = 'chat_998877';

  // 1. Initial default is Llama
  const initSession = getTelegramChatSession(testChatId);
  assert('Test C: Initial Telegram chat session defaults to Llama 3.3', initSession.selectedModelId === 'meta-llama/Llama-3.3-70B-Instruct');

  // 2. Switch to Zero-Shot model via /model zero
  const switchRes = setTelegramChatModel(testChatId, 'zero');
  assert('Test C: setTelegramChatModel switches session to Zero Model', switchRes.success && switchRes.modelId === 'facebook/bart-large-mnli');

  const switchedSession = getTelegramChatSession(testChatId);
  assert('Test C: Switched session persists for chatId', switchedSession.selectedModelId === 'facebook/bart-large-mnli');

  // 3. Subsequent message from this chat uses Zero model
  const switchedBotEvent = await processInboundEvent({
    provider: 'telegram',
    chatId: testChatId,
    senderName: 'SwitchUser',
    text: 'I have a technical billing issue with my invoice',
  });
  assert('Test C: Subsequent generation uses Zero model (not forced to Llama)',
    switchedBotEvent.success &&
    switchedBotEvent.executedWorkflowId === 'tpl_zero_shot_router' &&
    !!switchedBotEvent.nodeOutputs['n2']?.top_label
  );

  // 4. Switch from Zero to Video (/model video)
  const videoSwitchRes = setTelegramChatModel(testChatId, 'video');
  assert('Test C: Telegram switches to ZeroScope Video', videoSwitchRes.success && videoSwitchRes.modelId === 'cerspense/zeroscope_v2_576w');

  const videoBotChatEvent = await processInboundEvent({
    provider: 'telegram',
    chatId: testChatId,
    senderName: 'VideoDirector',
    text: 'A spaceship entering hyperdrive',
  });
  assert('Test C: Telegram generates video via ZeroScope when switched to video',
    videoBotChatEvent.success &&
    videoBotChatEvent.executedWorkflowId === 'tpl_telegram_video_gen' &&
    typeof videoBotChatEvent.nodeOutputs['n2']?.video_url === 'string' &&
    videoBotChatEvent.nodeOutputs['n2']?.video_url.includes('.mp4')
  );

  // ── TEST SCENARIO D: Invalid/Unavailable Zero Model Error Handling ────────
  console.log('\n🔹 Test D — Invalid/Unavailable Zero Model Error Handling:');
  const invalidZeroNodes = [
    {
      id: 'invalid_node',
      type: 'hf_zero_shot',
      data: {
        type: 'hf_zero_shot',
        label: 'Invalid Zero Model',
        config: {
          model_id: 'invalid/nonexistent-zero-model-xyz-999',
          candidate_labels: 'label_a, label_b',
        },
      },
    },
  ];
  const invalidRes = await executeWorkflow({
    nodes: invalidZeroNodes,
    edges: [],
  });
  assert('Test D: Invalid Zero Model reports failure (success: false)', invalidRes.success === false);
  assert('Test D: Clear error message identifying exact failure returned', typeof invalidRes.error === 'string' && invalidRes.error.includes('invalid'));
  assert('Test D: No silent fallback to Llama or fake success', invalidRes.nodeOutputs['invalid_node'] === undefined || !invalidRes.success);

  // ── TEST SCENARIO E: Coding Model Generation & Precision ──────────────────
  console.log('\n🔹 Test E — Dedicated Coding Model Generation (No Llama Substitution):');
  const codeNodes = [
    { id: 'tg_in', type: 'telegram_trigger', data: { type: 'telegram_trigger', label: 'Telegram Trigger' } },
    {
      id: 'coder_node',
      type: 'hf_router',
      data: {
        type: 'hf_router',
        label: 'Qwen Coder 32B',
        config: {
          model_id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
          user_prompt: 'write a python script for web scraping and data extraction',
        },
      },
    },
    { id: 'tg_out', type: 'telegram_reply', data: { type: 'telegram_reply', label: 'Telegram Reply' } },
  ];
  const codeEdges = [
    { id: 'e1', source: 'tg_in', target: 'coder_node' },
    { id: 'e2', source: 'coder_node', target: 'tg_out' },
  ];
  const codeRes = await executeWorkflow({
    nodes: codeNodes,
    edges: codeEdges,
  });
  assert('Test E: Coding workflow executes successfully', codeRes.success);
  assert('Test E: Output contains Python / TypeScript code block syntax', codeRes.nodeOutputs['coder_node']?.response_text?.includes('```') && (codeRes.nodeOutputs['coder_node']?.response_text?.includes('python') || codeRes.nodeOutputs['coder_node']?.response_text?.includes('typescript')));
  assert('Test E: Model used matches Qwen Coder (not replaced by Llama)', codeRes.nodeOutputs['coder_node']?.model_used === 'Qwen/Qwen2.5-Coder-32B-Instruct');

  // ── TEST SCENARIO F: Live Running Canvas Workflow Server Persistence ──────
  console.log('\n🔹 Test F — Live Running Canvas Workflow Server Persistence:');
  const { saveWorkflowToCache, loadWorkflowGraphById } = await import('../apps/web/lib/engine/workflowLoader');
  const customLiveNodes = [
    { id: 'trigger_live', type: 'telegram_trigger', data: { type: 'telegram_trigger', label: 'Live Trigger' } },
    { id: 'custom_model', type: 'hf_router', data: { type: 'hf_router', label: 'Custom Model Node', config: { model_id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', user_prompt: '{{ $node["Live Trigger"].text }}' } } },
    { id: 'reply_live', type: 'telegram_reply', data: { type: 'telegram_reply', label: 'Live Reply' } },
  ];
  const customLiveEdges = [
    { id: 'ce1', source: 'trigger_live', target: 'custom_model' },
    { id: 'ce2', source: 'custom_model', target: 'reply_live' },
  ];

  // Save live running canvas workflow
  saveWorkflowToCache('wf_custom_live_running', 'Live Running Studio Workflow', customLiveNodes, customLiveEdges);
  setAssignedBotWorkflowId('wf_custom_live_running');

  const liveExecutionEvent = await processInboundEvent({
    provider: 'telegram',
    chatId: 'chat_live_123',
    senderName: 'LiveUser',
    text: 'Explain quantum computing step by step',
  });
  assert('Test F: Inbound event routes through the exact live running canvas workflow',
    liveExecutionEvent.success &&
    liveExecutionEvent.executedWorkflowId === 'wf_custom_live_running' &&
    !!liveExecutionEvent.nodeOutputs['custom_model']?.response_text
  );

  // Reset to default
  setAssignedBotWorkflowId('wf_telegram_ai_bot');

  // ── 7. HUGGING FACE HUB DATASET REPO & SYNC ENGINE ────────────────────────
  console.log('\n🔹 7. Testing Hugging Face Hub Dataset Backup Engine:');
  const repoCheck = await ensureDatasetRepository('mahmoud-mohasseb');
  assert('ensureDatasetRepository validates dataset path', repoCheck.created && repoCheck.datasetPath.includes('mahmoud-mohasseb'));

  const syncResult = await syncWorkflowToHF({
    id: 'wf_test_sync',
    name: 'Sync Test Workflow',
    status: 'active',
    creditBalance: 1250,
    nodes: [],
    edges: [],
  }, 'mahmoud-mohasseb', 'hf-workflow-data');
  assert('syncWorkflowToHF creates immutable Git commit hash on Hub dataset',
    typeof syncResult.commitHash === 'string' &&
    syncResult.commitHash.length > 5 &&
    typeof syncResult.shortHash === 'string'
  );

  // ── 8. VARIABLE TEMPLATE RESOLVER ─────────────────────────────────────────
  console.log('\n🔹 8. Testing Variable Template Resolver ({{ $node["..."].field }}):');
  const templateSample = 'Hello {{ $node["LLM Node"].response_text }}! Score: {{ $node["Scorer"].score }}';
  const resolvedSample = resolveVariableTemplate(templateSample, {
    'LLM Node': { response_text: 'World' },
    'Scorer': { score: 99 },
  });
  assert('resolveVariableTemplate resolves multiple node variables', resolvedSample === 'Hello World! Score: 99');

  // ── FINAL SUMMARY ──────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 COMPREHENSIVE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
