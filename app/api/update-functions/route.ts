import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { functions } = await request.json();
    
    // Convert the functions object to a string
    const functionsString = `
export interface AIFunction {
  name: string;
  systemPrompt: string;
  userPrompt: string;
  temp: number; // Changed from temperature
  model: string;
  maxTokens: number;
}

export const defaultFunctions: Record<string, AIFunction> = ${JSON.stringify(functions, null, 2)};
`;

    // Write the updated functions to the file
    const filePath = path.join(process.cwd(), 'lib', 'functions.ts');
    await fs.writeFile(filePath, functionsString, 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating functions:', error);
    return NextResponse.json({ error: 'Failed to update functions' }, { status: 500 });
  }
}