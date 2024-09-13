import React, { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { AIFunction } from '@/lib/functions'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface SummaryProps {
  summary: string
  setSummary: React.Dispatch<React.SetStateAction<string>>
  rawTranscript: string
  functions: Record<string, AIFunction>
  executeFunction: (functionName: string, input: string) => Promise<string | undefined>
  appendToSandbox: (text: string) => void
}

export default function Summary({ summary, setSummary, rawTranscript, functions, executeFunction, appendToSandbox }: SummaryProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerateSummary = async (functionName: string) => {
    const result = await executeFunction(functionName, rawTranscript)
    if (result) {
      setSummary(result)
    }
  }



  const handleSendToSandbox = () => {
    if (textareaRef.current) {
      const selectedText = textareaRef.current.value.substring(
        textareaRef.current.selectionStart,
        textareaRef.current.selectionEnd
      );
      appendToSandbox(selectedText || summary);
    }
  };

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          ref={textareaRef}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full h-[20rem] min-h-[20rem] p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded resize-y"
          style={{ resize: 'vertical' }}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleGenerateSummary("Generate Simple Summary1")} className="bg-purple-600 hover:bg-purple-700 flex-grow">
            Generate Simple
          </Button>
          <Button onClick={() => handleGenerateSummary("Generate Detailed Summary")} className="bg-blue-600 hover:bg-blue-700 flex-grow">
            Generate Detailed
          </Button>
          <Button onClick={handleSendToSandbox} className="bg-orange-600 hover:bg-orange-700 flex-grow">
            Send to Sandbox
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}