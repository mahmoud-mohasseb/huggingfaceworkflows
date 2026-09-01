export type NodeCategory = 'triggers' | 'models' | 'logic' | 'actions';

export type NodeType =
  | 'telegram_trigger'
  | 'whatsapp_trigger'
  | 'gradio_space'
  | 'hf_router'
  | 'hf_image_gen'
  | 'hf_music_gen'
  | 'hf_speech_to_text'
  | 'hf_video_gen'
  | 'hf_zero_shot'
  | 'openclaw_agent'
  | 'logic_transform'
  | 'telegram_reply'
  | 'whatsapp_reply';

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'failed';

export type WorkflowStatus = 'active' | 'draft';

export type PortDataType = 'string' | 'number' | 'object' | 'image' | 'audio' | 'boolean' | 'any';

export interface PortDefinition {
  id: string;
  label: string;
  type: PortDataType;
  color?: string;
}

export interface NodeParamSchema {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'slider' | 'secret' | 'boolean' | 'code';
  defaultValue?: any;
  options?: { label: string; value: string }[];
  presets?: { label: string; value: string; description?: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
}

export interface NodeDefinition {
  type: NodeType;
  title: string;
  category: NodeCategory;
  categoryLabel: string;
  description: string;
  iconName: string;
  accentColor: string;
  badge: 'Free' | 'Credits';
  creditCost: number;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  schema: NodeParamSchema[];
  defaultConfig: Record<string, any>;
  defaultSubtitle?: string;
  promptPresets?: { label: string; field: string; value: string; category?: string }[];
}

export interface NodeData {
  label: string;
  category: NodeCategory;
  type: NodeType;
  status: NodeExecutionStatus;
  disabled?: boolean;
  config: Record<string, any>;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  lastOutput?: Record<string, any>;
  lastMetric?: ExecutionStepMetric;
  error?: string;
  executionTimeMs?: number;
  subtitle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  updatedAt: string;
  hfDatasetPath: string;
  commitHash: string;
  creditBalance: number;
  nodes: any[];
  edges: any[];
  username?: string;
  lastSyncCommit?: string;
  lastSyncTimestamp?: string;
}

export interface RunLog {
  id: string;
  timestamp: string;
  nodeId?: string;
  nodeTitle?: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  payload?: any;
}

export interface ExecutionStepMetric {
  nodeId: string;
  nodeTitle: string;
  category: NodeCategory;
  startTimeMs: number;
  durationMs: number;
  status: NodeExecutionStatus;
  tokensUsed?: number;
  creditsConsumed?: number;
}

export interface ExecutionResult {
  success: boolean;
  logs: RunLog[];
  waterfall: ExecutionStepMetric[];
  totalLatencyMs: number;
  totalCredits: number;
  nodeOutputs: Record<string, any>;
  error?: string;
  audioTracks?: string[];
  hasVideo?: boolean;
}

export interface VariableRef {
  raw: string;
  nodeId?: string;
  nodeTitle?: string;
  fieldPath: string;
}

export interface HFSpaceInfo {
  id: string;
  author: string;
  name: string;
  title: string;
  sdk: 'gradio' | 'streamlit' | 'docker' | 'static';
  hardware: 'ZeroGPU' | 'CPU-Basic' | 'T4-Small' | 'A10G-Large' | 'A100-Large';
  likes: number;
  private: boolean;
  url: string;
  embedUrl: string;
  category: 'image' | 'audio' | 'text' | 'vision' | 'utility';
  description: string;
  endpoints?: {
    name: string;
    description: string;
    inputs: { name: string; type: string }[];
    outputs: { name: string; type: string }[];
  }[];
}

export interface UserSettings {
  hfToken: string;
  hfUsername: string;
  datasetPath: string;
  telegramBotToken: string;
  whatsappPhoneId: string;
  whatsappToken: string;
  autoSaveEnabled: boolean;
}

