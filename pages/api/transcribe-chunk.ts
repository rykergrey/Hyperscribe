import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import { Configuration, OpenAIApi } from 'openai'

export const config = {
  api: {
    bodyParser: false,
  },
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' })
    }

    const file = files.file as formidable.File
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    try {
      const response = await openai.createTranscription(
        fs.createReadStream(file.filepath) as any,
        'whisper-1'
      )

      res.status(200).json({ transcript: response.data.text })
    } catch (error) {
      console.error('Error transcribing audio:', error)
      res.status(500).json({ error: 'Error transcribing audio' })
    } finally {
      // Clean up the temporary file
      fs.unlinkSync(file.filepath)
    }
  })
}