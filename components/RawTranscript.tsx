import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface RawTranscriptProps {
  rawTranscript: string
  setRawTranscript: (value: string) => void
  setSandboxText: (value: string) => void
}

const RawTranscript: React.FC<RawTranscriptProps> = ({ rawTranscript, setRawTranscript, setSandboxText }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(rawTranscript)
      .then(() => console.log('Text copied to clipboard'))
      .catch(err => console.error('Failed to copy text: ', err))
  }

  const handleSendToSandbox = () => {
    setSandboxText(rawTranscript)
  }

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20 flex flex-col min-h-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">Raw Transcript</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <Textarea
          value={rawTranscript}
          onChange={(e) => setRawTranscript(e.target.value)}
          className="w-full min-h-[20rem] p-2 bg-gray-700 border-gray-600 text-gray-100 rounded resize-y font-sans text-sm mb-4"
          placeholder="Enter raw transcript here..."
        />
        <div className="flex space-x-2">
          <Button onClick={handleCopy} className="bg-blue-600 hover:bg-blue-700 flex-1">
            Copy
          </Button>
          <Button onClick={handleSendToSandbox} className="bg-purple-600 hover:bg-purple-700 flex-1">
            Send to Sandbox
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RawTranscript