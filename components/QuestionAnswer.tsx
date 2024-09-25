import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaCopy, FaExpand, FaMinus, FaPlus, FaVolumeUp } from "react-icons/fa";
import SharedComponentWrapper from "@/components/SharedComponentWrapper";
import { useTextSelection } from "@/hooks/useTextSelection"; // Add this line

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
  setSelectedText: React.Dispatch<React.SetStateAction<string | null>>;
  isExpanded: boolean;
  onExpand: () => void;
  onOpenAudioPlayer: () => void;
}

export default function QuestionAnswer({
  question,
  setQuestion,
  answer,
  setAnswer,
  rawTranscript,
  executeFunction,
  appendToSandbox,
  setSelectedText,
  isExpanded,
  onExpand,
  onOpenAudioPlayer,
}: QuestionAnswerProps) {
  const [isAsking, setIsAsking] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showSuggestQuestionsPanel, setShowSuggestQuestionsPanel] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const answerRef = useTextSelection(setSelectedText);

  const handleAskQuestion = useCallback(async () => {
    if (!question.trim() || !rawTranscript.trim()) return;
    setIsAsking(true);
    try {
      const input = `Context: ${rawTranscript}\n\nQuestion: ${question}`;
      const result = await executeFunction("Answer Question", input);
      if (result) {
        const newAnswer = result.replace(/^# Answer Question\s*\n+/, "").trim();
        const newEntry = `## Q: ${question}\n\n${newAnswer}\n\n---\n\n`;
        setAnswer((prevAnswer) => newEntry + prevAnswer);
      }
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer(
        (prevAnswer) =>
          `## Error\n\nAn error occurred while processing your question. Please try again.\n\n---\n\n${prevAnswer}`,
      );
    } finally {
      setIsAsking(false);
      setQuestion("");
    }
  }, [question, rawTranscript, executeFunction, setAnswer, setQuestion]);

  const handleGenerateSuggestedQuestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      const result = await executeFunction("Generate Suggested Questions", rawTranscript);
      if (result) {
        const questions = result.split('\n').filter(q => q.trim() !== '').slice(0, 5);
        setSuggestedQuestions(questions);
      } else {
        setSuggestedQuestions(["Failed to generate suggested questions."]);
      }
    } catch (error) {
      console.error("Error generating suggested questions:", error);
      setSuggestedQuestions(["Error: Failed to generate suggested questions."]);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSelectSuggestedQuestion = (q: string) => {
    setQuestion(q);
    setShowSuggestQuestionsPanel(false);
  };

  const handleCopy = useCallback(() => {
    if (typeof window !== 'undefined') {
      const tempInput = document.createElement('textarea');
      tempInput.value = answer;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    }
  }, [answer]);

  const handleSendToSandbox = () => {
    if (answerRef.current) {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || "";
      appendToSandbox(selectedText || answer);
    }
  };

  const handleSpeak = () => {
    const textToSpeak = window.getSelection()?.toString() || answer;
    console.log("Text to be spoken:", textToSpeak);
    onOpenAudioPlayer();
  };

  return (
    <SharedComponentWrapper
      title="Q&A"
      onCopy={handleCopy}
      onExpand={onExpand}
      isExpanded={isExpanded}
      copiedFeedback={copiedFeedback}
      onSpeak={handleSpeak}
    >
      <div className="flex flex-col h-full space-y-2">
        <Input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="bg-gray-700 text-gray-100 border-gray-600 py-2"
        />
        <div className="flex space-x-2">
          <Button
            onClick={handleAskQuestion}
            className="bg-purple-600 hover:bg-purple-700 flex-grow py-2"
            disabled={isAsking}
          >
            {isAsking ? "Asking..." : "Ask"}
          </Button>
          <Button
            onClick={() => setShowSuggestQuestionsPanel(!showSuggestQuestionsPanel)}
            className="bg-blue-600 hover:bg-blue-700 flex-grow py-2"
          >
            {showSuggestQuestionsPanel ? "Hide Suggestions" : "Suggested"}
          </Button>
          <Button
            onClick={handleSendToSandbox}
            className="bg-orange-600 hover:bg-orange-700 flex-grow py-2"
          >
            Send to Sandbox
          </Button>
        </div>
        
        {showSuggestQuestionsPanel && (
          <div className="p-2 bg-gray-800 rounded-lg">
            <Button
              onClick={handleGenerateSuggestedQuestions}
              className="bg-green-600 hover:bg-green-700 w-full py-2 mb-2"
              disabled={isGeneratingSuggestions}
            >
              {isGeneratingSuggestions ? "Generating..." : "Generate Suggested Questions"}
            </Button>
            <div className="space-y-2">
              {suggestedQuestions.map((q, index) => (
                <Button
                  key={index}
                  onClick={() => handleSelectSuggestedQuestion(q)}
                  className="bg-gray-700 hover:bg-gray-600 text-left w-full py-6 px-3 whitespace-normal break-words"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div
          ref={answerRef}
          className="flex-grow overflow-auto p-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg markdown-content"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
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
            }}
          >
            {answer}
          </ReactMarkdown>
        </div>
      </div>
    </SharedComponentWrapper>
  );
}