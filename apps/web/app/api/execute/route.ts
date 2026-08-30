import { NextResponse } from 'next/server';
import { executeWorkflow } from '../../../lib/engine/executor';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nodes, edges, userInputs } = body;

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json({ error: 'Nodes array is required' }, { status: 400 });
    }

    // Extract Hugging Face Token from Cookies, Auth Headers, or Request Body
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

    // Cookie token extraction if available
    const cookieHeader = req.headers.get('cookie') || '';
    const cookieMatch = cookieHeader.match(/hf_oauth_token=([^;]+)/);
    const cookieToken = cookieMatch ? cookieMatch[1] : '';

    const hfToken = body?.hfToken || body?.token || userInputs?.hfToken || headerToken || cookieToken || process.env.HF_TOKEN || '';

    const result = await executeWorkflow({
      nodes,
      edges: edges || [],
      userInputs: userInputs || {},
      hfToken,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Execution error' }, { status: 500 });
  }
}
