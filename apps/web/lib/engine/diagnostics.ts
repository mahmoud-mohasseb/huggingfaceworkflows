/**
 * Structured Model-Routing & Workflow Execution Diagnostics
 */

export interface ModelRequestDiagnostic {
  type: 'video' | 'image' | 'audio' | 'text' | 'zero_shot' | 'agent' | 'multi_voice';
  requestedModel: string;
  resolvedModel: string;
  provider: string;
  modelId: string;
  workflowBranch: string;
  status: 'started' | 'running' | 'completed' | 'failed';
}

export interface ModelExecutionDiagnostic {
  provider: string;
  modelId: string;
  status: 'success' | 'failure';
  durationMs: number;
  outputType: 'video' | 'image' | 'audio' | 'text' | 'zero_shot_scores' | 'object_detection';
  error?: string;
}

export interface FinalOutputDiagnostic {
  expected: 'video' | 'image' | 'audio' | 'text' | 'multi_voice';
  actual: string;
  audioTracksCount: number;
  videoPresent: boolean;
  telegramDelivery?: 'success' | 'failure' | 'skipped_no_token';
}

export function logModelRequest(diag: ModelRequestDiagnostic) {
  console.log('\n=== [REQUEST] ===');
  console.log(`type: ${diag.type}`);
  console.log(`requested_model: ${diag.requestedModel}`);
  console.log(`resolved_model: ${diag.resolvedModel}`);
  console.log(`provider: ${diag.provider}`);
  console.log(`model_id: ${diag.modelId}`);
  console.log(`workflow_branch: ${diag.workflowBranch}`);
  console.log(`status: ${diag.status}`);
}

export function logModelExecution(diag: ModelExecutionDiagnostic) {
  console.log('\n=== [MODEL EXECUTION] ===');
  console.log(`provider: ${diag.provider}`);
  console.log(`model_id: ${diag.modelId}`);
  console.log(`status: ${diag.status}`);
  console.log(`duration: ${diag.durationMs}ms`);
  console.log(`output_type: ${diag.outputType}`);
  if (diag.error) {
    console.log(`error: ${diag.error}`);
  }
}

export function logFinalOutput(diag: FinalOutputDiagnostic) {
  console.log('\n=== [FINAL OUTPUT] ===');
  console.log(`expected: ${diag.expected}`);
  console.log(`actual: ${diag.actual}`);
  console.log(`audio_tracks: ${diag.audioTracksCount}`);
  console.log(`video_present: ${diag.videoPresent}`);
  if (diag.telegramDelivery) {
    console.log(`telegram_delivery: ${diag.telegramDelivery}`);
  }
  console.log('====================\n');
}
