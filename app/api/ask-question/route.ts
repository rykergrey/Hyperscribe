import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIFunction } from '@/lib/functions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { question, context, function: aiFunction } = await req.json();

    const userPrompt = aiFunction.userPrompt
      .replace('{{context}}', context)
      .replace('{{question}}', question);

    const completion = await openai.chat.completions.create({
      model: aiFunction.model,
      messages: [
        { role: "system", content: aiFunction.systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: aiFunction.temp,
      max_tokens: aiFunction.maxTokens,
    });

    const answer = completion.choices[0].message.content || '';

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error answering question:', error);
    return NextResponse.json({ error: 'Failed to answer question' }, { status: 500 });
  }
}