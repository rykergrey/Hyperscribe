import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import os from 'os';
import { YoutubeTranscript } from 'youtube-transcript';
import { decode } from 'html-entities';

// Set the FFmpeg path to the local executable
ffmpeg.setFfmpegPath(join(process.cwd(), 'ffmpeg.exe'));

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const youtubeUrl = formData.get('youtubeUrl') as string;

  if (youtubeUrl) {
    try {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
      }

      const transcript = await fetchYouTubeTranscript(videoId);
      return NextResponse.json({ transcript });
    } catch (error) {
      console.error('Error processing YouTube transcript:', error);
      return NextResponse.json({ error: 'Failed to process YouTube transcript' }, { status: 500 });
    }
  } else if (file) {
    // Existing audio file processing code...
  } else {
    return NextResponse.json({ error: 'No file or YouTube URL provided' }, { status: 400 });
  }
}

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const decodedTranscript = transcript
      .map(entry => decode(entry.text))
      .join('\n');
    return decodedTranscript;
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    throw new Error('Failed to fetch YouTube transcript');
  }
}

function decodeHTMLEntities(text: string): string {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '='
  };
  return text.replace(/&amp;#39;|&amp;#x2F;|&amp;#x60;|&amp;#x3D;|&amp;|&lt;|&gt;|&quot;|&#39;/g, 
    match => entities[match as keyof typeof entities] || match);
}

async function splitAudio(inputPath: string, chunkDuration: number): Promise<string[]> {
  const chunks: string[] = [];
  const tempDir = os.tmpdir();

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-f segment', `-segment_time ${chunkDuration}`, '-c copy'])
      .output(join(tempDir, 'chunk-%03d.mp3'))
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  let chunkIndex = 0;
  while (true) {
    const chunkPath = join(tempDir, `chunk-${String(chunkIndex).padStart(3, '0')}.mp3`);
    try {
      await readFile(chunkPath);
      chunks.push(chunkPath);
      chunkIndex++;
    } catch (error) {
      break;
    }
  }

  return chunks;
}

async function transcribeAudio(audioData: Buffer) {
  const formData = new FormData();
  
  // Append the buffer directly to formData
  formData.append('file', audioData, {
    filename: 'audio.mp3',
    contentType: 'audio/mpeg',
  });

  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      ...formData.getHeaders()
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to transcribe audio');
  }

  const data = await response.json();
  return data.text;
}