import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AIFunction {
  userPrompt: string;
  systemPrompt: string;
  model: string;
  temp: number;
  maxTokens: number;
}

export async function POST(req: NextRequest) {
  try {
    const { question, context, function: aiFunction }: { question: string; context: string; function: AIFunction } = await req.json();

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