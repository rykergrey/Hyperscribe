import { NextRequest, NextResponse } from 'next/server';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { YoutubeTranscript } from 'youtube-transcript';
import { decode } from 'html-entities';

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
    try {
      const ffmpeg = new FFmpeg();

      // Load FFmpeg
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
      });

      // Write the input file to FFmpeg's virtual file system
      await ffmpeg.writeFile('input.mp3', await fetchFile(file));

      // Run FFmpeg command to convert audio to WAV
      await ffmpeg.exec(['-i', 'input.mp3', 'output.wav']);

      // Read the output file
      const data = await ffmpeg.readFile('output.wav');

      // Convert the output to a Blob
      const wavBlob = new Blob([data], { type: 'audio/wav' });

      // Here you would typically send this WAV file to a speech-to-text service
      // For this example, we'll just return a dummy transcript
      const transcript = "This is a dummy transcript. Implement actual speech-to-text here.";

      await ffmpeg.terminate();

      return NextResponse.json({ transcript });
    } catch (error) {
      console.error('Error processing audio:', error);
      return NextResponse.json({ error: 'Error processing audio' }, { status: 500 });
    }
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
      .map((entry, index) => {
        const decodedText = decode(entry.text);
        // Add a line break every 10 entries
        return (index + 1) % 10 === 0 ? decodedText + '\n\n' : decodedText + ' ';
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
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