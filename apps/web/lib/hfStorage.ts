import { Workflow } from '../../../packages/shared-types';

export interface HFCommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  date: string;
  author: string;
}

export interface HFSyncResult {
  commitHash: string;
  shortHash: string;
  datasetPath: string;
  syncedAt: string;
  fileCount: number;
}

const DEFAULT_USERNAME = 'mahmoud-mohasseb';
const DEFAULT_DATASET = 'hf-workflow-data';

export async function ensureDatasetRepository(username = DEFAULT_USERNAME, hfToken?: string): Promise<{ created: boolean; datasetPath: string }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const datasetPath = `datasets/${username}/${DEFAULT_DATASET}`;
  return { created: true, datasetPath };
}

export async function syncWorkflowToHF(
  workflow: Workflow,
  username = DEFAULT_USERNAME,
  datasetName = DEFAULT_DATASET
): Promise<HFSyncResult> {
  // Simulate network delay to Hugging Face Hub dataset repository
  await new Promise((resolve) => setTimeout(resolve, 600));

  const randomHash = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  const shortHash = randomHash.substring(0, 7);
  const datasetPath = `datasets/${username}/${datasetName}`;

  // Store in local storage for web persistence if available
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('hf_synced_workflows') || '{}';
      const parsed = JSON.parse(stored);
      parsed[workflow.id] = {
        ...workflow,
        commitHash: shortHash,
        hfDatasetPath: datasetPath,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('hf_synced_workflows', JSON.stringify(parsed));
    } catch (e) {
      console.warn('LocalStorage save fallback:', e);
    }
  }

  return {
    commitHash: randomHash,
    shortHash,
    datasetPath,
    syncedAt: new Date().toISOString(),
    fileCount: 3,
  };
}

export const commitWorkflowToDataset = syncWorkflowToHF;

export async function getCommitHistory(datasetPath: string): Promise<HFCommitInfo[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return [
    {
      hash: '8f3a92b1049c812d',
      shortHash: '8f3a92b',
      message: 'chore: updated workflow node graph & HF router config',
      date: 'Just now',
      author: 'Mahmoud Mohasseb',
    },
    {
      hash: '4e712a0918b2c12a',
      shortHash: '4e712a0',
      message: 'feat: added WhatsApp trigger & FLUX.1 Gradio Space',
      date: '2 hours ago',
      author: 'Mahmoud Mohasseb',
    },
    {
      hash: '1a908b762c3104fe',
      shortHash: '1a908b7',
      message: 'init: created workflow dataset on Hugging Face Hub',
      date: '1 day ago',
      author: 'Mahmoud Mohasseb',
    },
  ];
}
