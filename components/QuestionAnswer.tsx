import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AIFunction } from '@/lib/functions'
import { Input } from "@/components/ui/input"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface QuestionAnswerProps {
  question: string
  setQuestion: (question: string) => void
  answer: string
  setAnswer: (answer: string) => void
  rawTranscript: string
  functions: Record<string, AIFunction>
  executeFunction: (functionName: string, input: string) => Promise<string | undefined>
}

export default function QuestionAnswer({ 
  question, 
  setQuestion, 
  answer, 
  setAnswer, 
  rawTranscript, 
  functions,
  executeFunction
}: QuestionAnswerProps) {
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(false)

  const handleAskQuestion = async () => {
    if (!question.trim() || !rawTranscript.trim()) return
    try {
      const input = `Context: ${rawTranscript}\n\nQuestion: ${question}`
      const result = await executeFunction("Answer Question", input)
      if (result) {
        setAnswer(result)
      }
    } catch (error) {
      console.error("Error asking question:", error)
      setAnswer("An error occurred while processing your question. Please try again.")
    }
  }

  const handleGenerateSuggestedQuestions = async () => {
    setIsGeneratingSuggestions(true)
    try {
      console.log("Generating suggested questions...")
      const result = await executeFunction("Generate Suggested Questions", rawTranscript)
      console.log("Result:", result)
      if (result) {
        const questions = result.split('\n').filter(q => q.trim())
        console.log("Parsed questions:", questions)
        setSuggestedQuestions(questions)
      } else {
        console.log("No result returned from executeFunction")
        setSuggestedQuestions(["No suggested questions generated. Please try again."])
      }
    } catch (error) {
      console.error("Error generating suggested questions:", error)
      setSuggestedQuestions(["An error occurred while generating questions. Please try again."])
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">Q&A</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-grow bg-gray-700 border-gray-600 text-gray-100"
            placeholder="Enter your question here..."
          />
          <Button onClick={handleAskQuestion} className="bg-purple-600 hover:bg-purple-700">
            Ask Question
          </Button>
          <Button 
            onClick={() => setShowSuggestedQuestions(!showSuggestedQuestions)} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Suggested Questions
          </Button>
        </div>
        {showSuggestedQuestions && (
          <div className="p-4 space-y-2 border border-gray-600 rounded-md bg-gray-700">
            <Button 
              onClick={handleGenerateSuggestedQuestions} 
              className="w-full bg-green-600 hover:bg-green-700 text-white" 
              disabled={isGeneratingSuggestions}
            >
              {isGeneratingSuggestions ? 'Generating...' : 'Generate Suggested Questions'}
            </Button>
            {suggestedQuestions.map((q, index) => (
              <div 
                key={index} 
                className="p-2 bg-gray-600 rounded cursor-pointer hover:bg-gray-500 transition-colors text-white"
                onClick={() => setQuestion(q)}
              >
                {q}
              </div>
            ))}
          </div>
        )}
        <div className="w-full min-h-[20rem] p-2 bg-gray-700 border-gray-600 text-gray-100 rounded overflow-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}