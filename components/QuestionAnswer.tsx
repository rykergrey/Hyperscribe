import React, { useRef, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface QuestionAnswerProps {
  question: string
  setQuestion: React.Dispatch<React.SetStateAction<string>>
  answer: string
  setAnswer: React.Dispatch<React.SetStateAction<string>>
  rawTranscript: string
  // Remove functions from here if it's not used
  executeFunction: (functionName: string, input: string) => Promise<string | undefined>
  appendToSandbox: (text: string) => void
}

export default function QuestionAnswer({ 
  question, 
  setQuestion, 
  answer, 
  setAnswer, 
  rawTranscript, 
  // Remove functions from here if it's not used
  executeFunction,
  appendToSandbox
}: QuestionAnswerProps) {
  const answerRef = useRef<HTMLDivElement>(null);
  const [answerHeight, setAnswerHeight] = useState(320); // Default height
  const [isResizing, setIsResizing] = useState(false);

  const handleSendToSandbox = () => {
    if (answerRef.current) {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || '';
      appendToSandbox(selectedText || answer);
    }
  };

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newHeight = e.clientY - (answerRef.current?.getBoundingClientRect().top || 0);
    setAnswerHeight(Math.max(newHeight, 100)); // Minimum height of 100px
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">Q&A</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-gray-100"
            placeholder="Enter your question here..."
          />
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleAskQuestion} 
              className="bg-purple-600 hover:bg-purple-700 flex-grow"
              disabled={!question.trim()}
            >
              Ask Question
            </Button>
            <Button 
              onClick={() => setShowSuggestedQuestions(!showSuggestedQuestions)} 
              className="bg-blue-600 hover:bg-blue-700 flex-grow"
            >
              Suggested Questions
            </Button>
            <Button onClick={handleSendToSandbox} className="bg-orange-600 hover:bg-orange-700 flex-grow">
              Send to Sandbox
            </Button>
          </div>
        </div>
        {showSuggestedQuestions && (
          <div className="p-4 space-y-2 border border-gray-600 rounded-md bg-gray-700">
            <Button 
              onClick={handleGenerateSuggestedQuestions} 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white" 
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
        <div 
          ref={answerRef}
          className="relative w-full p-2 bg-gray-700 border-gray-600 text-gray-100 rounded overflow-auto"
          style={{ height: `${answerHeight}px`, resize: 'vertical' }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleMouseDown}
          />
        </div>
      </CardContent>
    </Card>
  )
}