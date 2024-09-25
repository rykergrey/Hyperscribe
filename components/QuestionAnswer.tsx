import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaCopy, FaExpand, FaMinus, FaPlus, FaVolumeUp } from "react-icons/fa";
import { useTextSelection } from "@/hooks/useTextSelection";

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
  const [answerHeight, setAnswerHeight] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const defaultHeight = 320;
  const minimizedHeight = 0.1; // Height when minimized

  const answerRef = useTextSelection(setSelectedText);

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
      console.log("Generating suggested questions...");
      const result = await executeFunction(
        "Generate Suggested Questions",
        rawTranscript,
      );
      console.log("Result:", result);
      if (result) {
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

  const handleBarClick = (e: React.MouseEvent) => {
    if (isResizing) return;
    setIsMinimized(!isMinimized);
    setAnswerHeight(isMinimized ? defaultHeight : minimizedHeight);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const newHeight =
        clientY - (answerRef.current?.getBoundingClientRect().top || 0);
      setAnswerHeight(Math.max(newHeight, minimizedHeight));
      setIsMinimized(newHeight <= minimizedHeight);
    },
    [isResizing],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener(
        "mousemove",
        handleMouseMove as (e: Event) => void,
      );
      window.addEventListener(
        "touchmove",
        handleMouseMove as (e: Event) => void,
      );
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    } else {
      window.removeEventListener(
        "mousemove",
        handleMouseMove as (e: Event) => void,
      );
      window.removeEventListener(
        "touchmove",
        handleMouseMove as (e: Event) => void,
      );
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove as (e: Event) => void,
      );
      window.removeEventListener(
        "touchmove",
        handleMouseMove as (e: Event) => void,
      );
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleCopy = () => {
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
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSpeak = () => {
    const textToSpeak = window.getSelection()?.toString() || answer;
    console.log("Text to be spoken:", textToSpeak);
    onOpenAudioPlayer();
  };

  return (
    <Card className={`bg-gray-800 border-none shadow-lg shadow-purple-500/20 transition-all duration-300 rounded-lg overflow-hidden ${
      isExpanded ? 'fixed inset-0 z-50 m-0 rounded-none' : ''
    } ${isMinimized ? 'h-[64px]' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-gray-800 z-10 p-3">
        <CardTitle className="text-2xl font-bold text-blue-400">Q&A</CardTitle>
        <div className="flex space-x-2">
          <Button
            onClick={handleCopy}
            className={`p-2 ${copiedFeedback ? 'bg-green-600' : 'bg-gray-600'} hover:bg-gray-700`}
          >
            {copiedFeedback ? 'Copied!' : <FaCopy />}
          </Button>
          <Button
            onClick={handleMinimize}
            className="p-2 bg-gray-600 hover:bg-gray-700"
          >
            {isMinimized ? <FaPlus /> : <FaMinus />}
          </Button>
          <Button
            onClick={onExpand}
            className="p-2 bg-gray-600 hover:bg-gray-700"
          >
            <FaExpand />
          </Button>
          <Button
            onClick={handleSpeak}
            className="p-2 bg-gray-600 hover:bg-gray-700"
          >
            <FaVolumeUp />
          </Button>
        </div>
      </CardHeader>
      <div className={`transition-all duration-300 ${isMinimized ? 'h-0 overflow-hidden' : 'h-auto'}`}>
        <CardContent className={`${isExpanded ? 'p-4 md:p-8' : 'p-3'}`}>
          <div className="flex flex-col space-y-2">
            <Input
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-gray-700 text-gray-100 border-gray-600"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleAskQuestion}
                className="bg-purple-600 hover:bg-purple-700 flex-grow"
                disabled={isAsking}
              >
                {isAsking ? "Asking..." : "Ask"}
              </Button>
              <Button
                onClick={handleGenerateSuggestedQuestions}
                className="bg-blue-600 hover:bg-blue-700 flex-grow"
                disabled={isGeneratingSuggestions}
              >
                {isGeneratingSuggestions ? "Generating..." : "Suggest Questions"}
              </Button>
            </div>
          </div>
          {showSuggestedQuestions && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-200">Suggested Questions:</h3>
              <ul className="list-disc list-inside space-y-1">
                {suggestedQuestions.map((q, index) => (
                  <li key={index} className="text-gray-300 cursor-pointer hover:text-blue-400" onClick={() => setQuestion(q)}>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div
            ref={answerRef}
            className="w-full h-64 p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded overflow-auto markdown-content"
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
          <Button
            onClick={handleSendToSandbox}
            className="bg-orange-600 hover:bg-orange-700 w-full"
          >
            Send to Sandbox
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}