import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Model Defaults ─────────────────────────────────────────────────────────
export interface ModelDefaults {
  textModel: string;
  imageModel: string;
  videoModel: string;
  musicModel: string;
  speechModel: string;
}

// ── Engine Settings ────────────────────────────────────────────────────────
export interface EngineSettings {
  executionTimeoutMs: number;   // per-node timeout
  maxRetries: number;           // retry count on failure
  retryDelayMs: number;         // backoff between retries
  continuousPollIntervalMs: number; // live-run poll interval
  logVerbosity: 'minimal' | 'standard' | 'verbose';
  autoOpenDebugDrawer: boolean;
}

// ── Canvas / UI ────────────────────────────────────────────────────────────
export interface CanvasSettings {
  theme: 'dark-glass' | 'deep-slate' | 'neon-purple' | 'midnight-navy';
  showGrid: boolean;
  snapToGrid: boolean;
  animationSpeed: 'none' | 'subtle' | 'normal' | 'expressive';
  nodeCardDensity: 'compact' | 'comfortable' | 'spacious';
  miniMapVisible: boolean;
  autoLayout: boolean;
}

// ── Notifications ──────────────────────────────────────────────────────────
export interface NotificationSettings {
  onExecutionSuccess: boolean;
  onExecutionError: boolean;
  slackWebhookUrl: string;
  emailDigestEnabled: boolean;
  emailAddress: string;
}

// ── Security ───────────────────────────────────────────────────────────────
export interface SecuritySettings {
  dataRetentionDays: number;    // how long to keep execution logs locally
  autoRevokeTokenOnLogout: boolean;
}

// ── Credential Secrets ─────────────────────────────────────────────────────
export interface CredentialSettings {
  hfToken: string;
  telegramBotToken: string;
  whatsappPhoneId: string;
  whatsappAccessToken: string;
  whatsappVerifyToken: string;
}

// ── Storage ────────────────────────────────────────────────────────────────
export interface StorageSettings {
  hfDatasetName: string;
  autoSyncEnabled: boolean;
  syncFrequency: 'on-run' | 'every-5min' | 'every-30min' | 'manual';
}

// ── Full Settings State ────────────────────────────────────────────────────
export interface SettingsState {
  credentials: CredentialSettings;
  models: ModelDefaults;
  engine: EngineSettings;
  canvas: CanvasSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  storage: StorageSettings;

  // Mutations
  setCredentials: (c: Partial<CredentialSettings>) => void;
  setModels: (m: Partial<ModelDefaults>) => void;
  setEngine: (e: Partial<EngineSettings>) => void;
  setCanvas: (c: Partial<CanvasSettings>) => void;
  setNotifications: (n: Partial<NotificationSettings>) => void;
  setSecurity: (s: Partial<SecuritySettings>) => void;
  setStorage: (s: Partial<StorageSettings>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_CREDENTIALS: CredentialSettings = {
  hfToken: '',
  telegramBotToken: '',
  whatsappPhoneId: '',
  whatsappAccessToken: '',
  whatsappVerifyToken: 'hf_verify_secret_2024',
};

const DEFAULT_MODELS: ModelDefaults = {
  textModel: 'meta-llama/Llama-3.3-70B-Instruct',
  imageModel: 'black-forest-labs/FLUX.1-schnell',
  videoModel: 'damo-vilab/text-to-video-ms-1.7b',
  musicModel: 'facebook/musicgen-small',
  speechModel: 'openai/whisper-large-v3',
};

const DEFAULT_ENGINE: EngineSettings = {
  executionTimeoutMs: 30000,
  maxRetries: 2,
  retryDelayMs: 1500,
  continuousPollIntervalMs: 3500,
  logVerbosity: 'standard',
  autoOpenDebugDrawer: false,
};

const DEFAULT_CANVAS: CanvasSettings = {
  theme: 'dark-glass',
  showGrid: true,
  snapToGrid: false,
  animationSpeed: 'subtle',
  nodeCardDensity: 'comfortable',
  miniMapVisible: true,
  autoLayout: false,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  onExecutionSuccess: true,
  onExecutionError: true,
  slackWebhookUrl: '',
  emailDigestEnabled: false,
  emailAddress: '',
};

const DEFAULT_SECURITY: SecuritySettings = {
  dataRetentionDays: 30,
  autoRevokeTokenOnLogout: false,
};

const DEFAULT_STORAGE: StorageSettings = {
  hfDatasetName: 'hf-workflow-data',
  autoSyncEnabled: true,
  syncFrequency: 'on-run',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      credentials: DEFAULT_CREDENTIALS,
      models: DEFAULT_MODELS,
      engine: DEFAULT_ENGINE,
      canvas: DEFAULT_CANVAS,
      notifications: DEFAULT_NOTIFICATIONS,
      security: DEFAULT_SECURITY,
      storage: DEFAULT_STORAGE,

      setCredentials: (c) =>
        set((s) => ({ credentials: { ...s.credentials, ...c } })),
      setModels: (m) =>
        set((s) => ({ models: { ...s.models, ...m } })),
      setEngine: (e) =>
        set((s) => ({ engine: { ...s.engine, ...e } })),
      setCanvas: (c) =>
        set((s) => ({ canvas: { ...s.canvas, ...c } })),
      setNotifications: (n) =>
        set((s) => ({ notifications: { ...s.notifications, ...n } })),
      setSecurity: (sec) =>
        set((s) => ({ security: { ...s.security, ...sec } })),
      setStorage: (st) =>
        set((s) => ({ storage: { ...s.storage, ...st } })),
      resetToDefaults: () =>
        set({
          credentials: DEFAULT_CREDENTIALS,
          models: DEFAULT_MODELS,
          engine: DEFAULT_ENGINE,
          canvas: DEFAULT_CANVAS,
          notifications: DEFAULT_NOTIFICATIONS,
          security: DEFAULT_SECURITY,
          storage: DEFAULT_STORAGE,
        }),
    }),
    { name: 'hf-workflow-settings' }
  )
);
