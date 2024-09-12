import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIFunction } from '@/lib/functions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { context, function: aiFunction } = await req.json();

    const completion = await openai.chat.completions.create({
      model: aiFunction.model,
      messages: [
        { role: "system", content: aiFunction.systemPrompt },
        { role: "user", content: `${aiFunction.userPrompt}${context}` }
      ],
      temperature: aiFunction.temp,
      max_tokens: aiFunction.maxTokens,
    });

    const generatedQuestions = completion.choices[0].message.content?.split('\n').filter(q => q.trim() !== '') || [];

    return NextResponse.json({ questions: generatedQuestions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}