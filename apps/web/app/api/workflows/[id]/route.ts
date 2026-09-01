import { NextResponse } from 'next/server';
import { saveWorkflowToCache, loadWorkflowGraphById, setAssignedBotWorkflowId, getAssignedBotWorkflowId } from '../../../../lib/engine/workflowLoader';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const workflowId = params.id;
  const graph = loadWorkflowGraphById(workflowId);

  if (graph) {
    const isAssigned = getAssignedBotWorkflowId() === workflowId;
    return NextResponse.json({
      id: graph.id,
      name: graph.name,
      status: 'active',
      nodes: graph.nodes,
      edges: graph.edges,
      isAssigned,
      source: graph.source,
    });
  }

  return NextResponse.json({
    id: workflowId,
    name: 'Workflow',
    status: 'active',
    nodes: [],
    edges: [],
    isAssigned: getAssignedBotWorkflowId() === workflowId,
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const workflowId = params.id;
    const body = await req.json();
    const { name, nodes = [], edges = [], isAssigned } = body;

    // Save current live canvas graph to server cache so all bot listeners & APIs execute this exact running workflow
    saveWorkflowToCache(workflowId, name || 'Custom Workflow', nodes, edges);

    if (isAssigned) {
      setAssignedBotWorkflowId(workflowId);
    }

    return NextResponse.json({
      success: true,
      workflowId,
      name: name || 'Custom Workflow',
      nodeCount: nodes.length,
      edgeCount: edges.length,
      isAssigned: getAssignedBotWorkflowId() === workflowId,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return PUT(req, { params });
}
