import { NextResponse } from 'next/server';
import { generateWorkflowFromPrompt } from '../../../lib/engine/aiGenerator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, modelId } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Natural language prompt is required' }, { status: 400 });
    }

    const generated = await generateWorkflowFromPrompt(prompt, modelId);
    return NextResponse.json(generated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI Generation error' }, { status: 500 });
  }
}
