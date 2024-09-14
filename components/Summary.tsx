import React, { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface SummaryProps {
  summary: string;
  setSummary: React.Dispatch<React.SetStateAction<string>>;
  rawTranscript: string;
  executeFunction: (functionName: string, input: string) => Promise<string | undefined>;
  appendToSandbox: (text: string) => void;
}

export default function Summary({ 
  summary, 
  setSummary, 
  rawTranscript, 
  executeFunction,
  appendToSandbox
}: SummaryProps) {
  const resizableRef = useRef<HTMLDivElement>(null);

  const handleGenerateSummary = async (functionName: string) => {
    const result = await executeFunction(functionName, rawTranscript)
    if (result) {
      setSummary(result)
    }
  }

  const handleSendToSandbox = () => {
    appendToSandbox(summary);
  };

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={resizableRef}
          className="w-full h-[20rem] min-h-[20rem] p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded overflow-auto markdown-body resize-y"
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
              p: ({node, ...props}) => <p className="mb-2" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
              li: ({node, ...props}) => <li className="ml-4" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2" {...props} />,
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={dracula}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {summary}
          </ReactMarkdown>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleGenerateSummary("Generate Simple Summary")} className="bg-purple-600 hover:bg-purple-700 flex-grow">
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