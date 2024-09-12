import { NextResponse } from 'next/server';
import { defaultFunctions } from '@/lib/functions';

export async function GET() {
  try {
    return NextResponse.json({ functions: defaultFunctions });
  } catch (error) {
    console.error('Error getting functions:', error);
    return NextResponse.json({ error: 'Failed to get functions' }, { status: 500 });
  }
}