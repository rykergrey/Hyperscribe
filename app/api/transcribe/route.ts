import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
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

// Remove or comment out unused functions
// const decodeHTMLEntities = ...
// const splitAudio = ...
// const transcribeAudio = ...