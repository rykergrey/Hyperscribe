import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AIFunction } from '@/lib/functions'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface SummaryProps {
  summary: string
  setSummary: (summary: string) => void
  rawTranscript: string
  functions: Record<string, AIFunction>
  executeFunction: (functionName: string, input: string) => Promise<string | undefined>
}

export default function Summary({ summary, setSummary, rawTranscript, functions, executeFunction }: SummaryProps) {
  const handleGenerateSummary = async (functionName: string) => {
    const result = await executeFunction(functionName, rawTranscript)
    if (result) {
      setSummary(result)
    }
  }

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={() => handleGenerateSummary("Generate Simple Summary1")} className="bg-blue-600 hover:bg-blue-700">
            Generate Simple
          </Button>
          <Button onClick={() => handleGenerateSummary("Generate Detailed Summary")} className="bg-purple-600 hover:bg-purple-700">
            Generate Detailed
          </Button>
        </div>
        <div className="w-full min-h-[20rem] p-2 bg-gray-700 border-gray-600 text-gray-100 rounded overflow-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}