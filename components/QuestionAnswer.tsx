import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface QuestionAnswerProps {
  question: string;
  setQuestion: React.Dispatch<React.SetStateAction<string>>;
  answer: string;
  setAnswer: React.Dispatch<React.SetStateAction<string>>;
  rawTranscript: string;
  executeFunction: (
    functionName: string,
    input: string,
  ) => Promise<string | undefined>;
  appendToSandbox: (text: string) => void;
}

export default function QuestionAnswer({
  question,
  setQuestion,
  answer,
  setAnswer,
  rawTranscript,
  executeFunction,
  appendToSandbox,
}: QuestionAnswerProps) {
  const answerRef = useRef<HTMLDivElement>(null);
  const [answerHeight, setAnswerHeight] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);

  const handleSendToSandbox = () => {
    if (answerRef.current) {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || "";
      appendToSandbox(selectedText || answer);
    }
  };

  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim() || !rawTranscript.trim()) return;
    setIsAsking(true);
    try {
      const input = `Context: ${rawTranscript}\n\nQuestion: ${question}`;
      const result = await executeFunction("Answer Question", input);
      if (result) {
        // Remove the function name header if it exists
        const newAnswer = result.replace(/^# Answer Question\n\n/, '');
        // Create a new entry with the question and answer
        const newEntry = `## ${question}\n\n${newAnswer}\n\n---\n\n`;
        // Prepend the new entry to the existing answer
        setAnswer(prevAnswer => newEntry + prevAnswer);
      }
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer(prevAnswer => `Error: An error occurred while processing your question. Please try again.\n\n---\n\n${prevAnswer}`);
    } finally {
      setIsAsking(false);
      setQuestion(''); // Clear the question input after asking
    }
  };

  const handleGenerateSuggestedQuestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      console.log("Generating suggested questions...");
      const result = await executeFunction(
        "Generate Suggested Questions",
        rawTranscript,
      );
      console.log("Result:", result);
      if (result) {
        // Remove the function name header if it exists and parse questions
        const questionsWithoutHeader = result.replace(
          /^# Generate Suggested Questions\n\n/,
          "",
        );
        const questions = questionsWithoutHeader
          .split("\n")
          .filter((q) => q.trim());
        console.log("Parsed questions:", questions);
        setSuggestedQuestions(questions);
      } else {
        console.log("No result returned from executeFunction");
        setSuggestedQuestions([
          "No suggested questions generated. Please try again.",
        ]);
      }
    } catch (error) {
      console.error("Error generating suggested questions:", error);
      setSuggestedQuestions([
        "An error occurred while generating questions. Please try again.",
      ]);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight =
        e.clientY - (answerRef.current?.getBoundingClientRect().top || 0);
      setAnswerHeight(Math.max(newHeight, 100));
    },
    [isResizing],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(answer)
      .then(() => alert("Content copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

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
              disabled={isAsking || !question.trim()}
            >
              {isAsking ? "Asking..." : "Ask Question"}
            </Button>
            <Button
              onClick={() => setShowSuggestedQuestions(!showSuggestedQuestions)}
              className="bg-blue-600 hover:bg-blue-700 flex-grow"
            >
              Suggested Questions
            </Button>
            <Button
              onClick={handleCopy}
              className="bg-green-600 hover:bg-green-700 flex-grow"
            >
              Copy
            </Button>
            <Button
              onClick={handleSendToSandbox}
              className="bg-orange-600 hover:bg-orange-700 flex-grow relative group"
            >
              Send to Sandbox
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Highlight text to send only that selection
              </span>
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
              {isGeneratingSuggestions
                ? "Generating..."
                : "Generate Suggested Questions"}
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
          className="relative w-full p-2 bg-gray-700 border-gray-600 text-gray-100 rounded overflow-auto markdown-content"
          style={{ height: `${answerHeight}px`, resize: "vertical" }}
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
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-gray-500 pl-4 italic my-2" {...props} />
              ),
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={dracula}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              hr: ({node, ...props}) => <hr className="my-4 border-t border-gray-600" {...props} />
            }}
          >
            {answer}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
