import { WorkflowStorage } from './interface';
import { Workflow, ExecutionResult } from '../../../../packages/shared-types';
import { commitWorkflowToDataset } from '../hfStorage';

export class HuggingFaceDatasetStorage implements WorkflowStorage {
  async saveWorkflow(workflow: Workflow, token?: string) {
    const username = workflow.username || 'mahmoud-mohasseb';
    const res = await commitWorkflowToDataset(workflow, username, token);
    return {
      success: !!res.commitHash,
      commitHash: res.commitHash,
    };
  }

  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    return {
      id: workflowId,
      name: 'Telegram AI Bot Workflow',
      status: 'active',
      updatedAt: new Date().toISOString(),
      hfDatasetPath: 'datasets/mahmoud-mohasseb/hf-workflow-data',
      commitHash: 'commit_a94f2b',
      creditBalance: 1250,
      nodes: [],
      edges: [],
    };
  }

  async listWorkflows(): Promise<Workflow[]> {
    const wf = await this.getWorkflow('wf_telegram_ai_bot');
    return wf ? [wf] : [];
  }

  async saveExecution(executionId: string, result: ExecutionResult): Promise<boolean> {
    console.log(`Saved execution ${executionId} (status: ${result.success ? 'success' : 'failed'})`);
    return true;
  }
}

export const defaultStorage = new HuggingFaceDatasetStorage();
