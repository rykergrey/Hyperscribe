import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export class CustomYoutubeTranscript {
  static async fetchTranscript(videoId: string) {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const scriptContent = $('script').filter((_, el) => {
      return $(el).html()?.includes('var ytInitialPlayerResponse = ');
    }).html();

    if (!scriptContent) {
      throw new Error('Could not find transcript data');
    }

    const match = scriptContent.match(/var ytInitialPlayerResponse = (.+?);\s*var/);
    if (!match) {
      throw new Error('Could not extract transcript data');
    }

    const data = JSON.parse(match[1]);
    const transcriptData = data.captions?.playerCaptionsTracklistRenderer?.captionTracks?.[0];

    if (!transcriptData) {
      throw new Error('No transcript available for this video');
    }

    const transcriptResponse = await fetch(transcriptData.baseUrl);
    const transcriptXml = await transcriptResponse.text();
    const $transcript = cheerio.load(transcriptXml, { xmlMode: true });

    return $transcript('text').map((_, el) => ({
      text: $(el).text(),
      start: parseFloat($(el).attr('start') || '0'),
      duration: parseFloat($(el).attr('dur') || '0'),
    })).get();
  }
}