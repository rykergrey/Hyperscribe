import type { NextApiRequest, NextApiResponse } from 'next'
import { AIFunction } from '@/lib/functions'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { function: func, input } = req.body as { function: AIFunction; input: string }

    const completion = await openai.chat.completions.create({
      model: func.model,
      messages: [
        { role: "system", content: func.systemPrompt },
        { role: "user", content: func.userPrompt + "\n\n" + input }
      ],
      temperature: func.temp,
      max_tokens: func.maxTokens,
    })

    const result = completion.choices[0].message.content

    res.status(200).json({ result })
  } catch (error) {
    console.error('Error executing function:', error)
    res.status(500).json({ error: 'Failed to execute function' })
  }
}