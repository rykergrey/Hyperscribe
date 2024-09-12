import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { text, function: aiFunction } = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      model: aiFunction.model,
      messages: [
        { role: "system", content: aiFunction.systemPrompt },
        { role: "user", content: `${aiFunction.userPrompt}\n\n${text}` }
      ],
      temperature: aiFunction.temp, // Changed from temperature
      max_tokens: aiFunction.maxTokens,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error running function:', error);
    return NextResponse.json({ error: 'Failed to run function' }, { status: 500 });
  }
}