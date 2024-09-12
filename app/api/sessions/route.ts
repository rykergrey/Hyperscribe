import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const sessionsDir = path.join(process.cwd(), 'data', 'sessions');

export async function GET() {
  try {
    await fs.mkdir(sessionsDir, { recursive: true });
    const files = await fs.readdir(sessionsDir);
    const sessions = files.map(file => path.parse(file).name);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error getting sessions:', error);
    return NextResponse.json({ error: 'Failed to get sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await request.json();
    await fs.mkdir(sessionsDir, { recursive: true });
    await fs.writeFile(path.join(sessionsDir, `${session.name}.json`), JSON.stringify(session));
    return NextResponse.json({ message: 'Session saved successfully' });
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}