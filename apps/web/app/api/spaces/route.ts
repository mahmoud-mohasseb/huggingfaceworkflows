import { NextResponse } from 'next/server';
import { getSpacesList, getUserHFAssets } from '../../../lib/hfSpaces';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || undefined;
  const q = url.searchParams.get('q') || undefined;

  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  const cookieHeader = req.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.match(/hf_oauth_token=([^;]+)/);
  const cookieToken = cookieMatch ? cookieMatch[1] : '';

  const token = url.searchParams.get('token') || headerToken || cookieToken || process.env.HF_TOKEN || '';

  const spaces = await getSpacesList(category, q, token);
  const userAssets = await getUserHFAssets(token);

  return NextResponse.json({
    count: spaces.length,
    spaces,
    username: userAssets.username,
    userSpaces: userAssets.spaces,
    userModels: userAssets.models,
    userDatasets: userAssets.datasets,
  });
}
