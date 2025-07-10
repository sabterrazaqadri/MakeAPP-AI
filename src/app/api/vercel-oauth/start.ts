import { NextRequest, NextResponse } from 'next/server';

const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID;
const VERCEL_REDIRECT_URI = process.env.VERCEL_REDIRECT_URI;

export async function GET(req: NextRequest) {
  if (!VERCEL_CLIENT_ID || !VERCEL_REDIRECT_URI) {
    return new NextResponse('Missing Vercel OAuth configuration', { status: 500 });
  }
  const url = `https://vercel.com/oauth/authorize?client_id=${encodeURIComponent(VERCEL_CLIENT_ID)}&redirect_uri=${encodeURIComponent(VERCEL_REDIRECT_URI)}&scope=deployments`;
  return NextResponse.redirect(url);
}