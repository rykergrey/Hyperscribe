import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const sessionsDir = path.join(process.cwd(), 'data', 'sessions');

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    const sessionPath = path.join(sessionsDir, `${params.name}.json`);
    const sessionData = await fs.readFile(sessionPath, 'utf-8');
    return NextResponse.json(JSON.parse(sessionData));
  } catch (error) {
    console.error('Error loading session:', error);
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 });
  }
}