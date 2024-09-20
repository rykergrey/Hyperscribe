import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "cjpS6kiuQBPP8G84Zhx6"; // Default voice ID, you can change this

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY!,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5", // Using the Turbo v2.5 model for lower latency
      voice_settings: {
        stability: 0.5,
        similarity_boost: 1,
      },
      output_format: "mp3_44100_96",
    }),
  });

  if (!response.ok) {
    console.error('Error generating speech:', await response.text());
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }

  // Stream the response directly
  return new NextResponse(response.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    },
  });
}