import { Workflow, ExecutionResult } from '../../../../packages/shared-types';

export interface WorkflowStorage {
  saveWorkflow(workflow: Workflow, token?: string): Promise<{ success: boolean; commitHash?: string }>;
  getWorkflow(workflowId: string, token?: string): Promise<Workflow | null>;
  listWorkflows(token?: string): Promise<Workflow[]>;
  saveExecution(executionId: string, result: ExecutionResult, token?: string): Promise<boolean>;
}
