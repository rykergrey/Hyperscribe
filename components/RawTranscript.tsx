import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DOMPurify from "dompurify";
import { FaCopy, FaExpand, FaMinus } from 'react-icons/fa';

interface RawTranscriptProps {
  rawTranscript: string;
  setRawTranscript: React.Dispatch<React.SetStateAction<string>>;
  appendToSandbox: (text: string) => void;
  isExpanded: boolean;
  onExpand: () => void;
}

export default function RawTranscript({
  rawTranscript,
  setRawTranscript,
  appendToSandbox,
  isExpanded,
  onExpand,
}: RawTranscriptProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const sanitizeAndParseHTML = (html: string) => {
    if (typeof window !== 'undefined') {
      const sanitizedHTML = DOMPurify.sanitize(html);
      return { __html: sanitizedHTML };
    }
    return { __html: html };
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawTranscript)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  const handleSendToSandbox = () => {
    const selectedText = window.getSelection()?.toString() || rawTranscript;
    appendToSandbox(selectedText);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <Card className={`bg-gray-800 border-none shadow-lg shadow-purple-500/20 transition-all duration-300 rounded-lg ${
      isExpanded ? 'fixed inset-0 z-50 m-0 rounded-none overflow-auto' : ''
    }`}>
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-transparent z-10">
        <CardTitle className="text-2xl font-bold text-blue-400">
          Raw Transcript
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            onClick={handleCopy}
            className={`p-2 ${isCopied ? "bg-green-500" : "bg-gray-600"} hover:bg-gray-700`}
          >
            <FaCopy />
          </Button>
          <Button
            onClick={handleMinimize}
            className="p-2 bg-gray-600 hover:bg-gray-700"
          >
            <FaMinus />
          </Button>
          <Button
            onClick={onExpand}
            className="p-2 bg-gray-600 hover:bg-gray-700"
          >
            <FaExpand />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`space-y-4 ${isExpanded ? 'p-4 md:p-8' : ''}`}>
        {!isMinimized && (
          <>
            <div
              className={`w-full ${
                isExpanded 
                  ? 'h-[calc(100vh-180px)] md:h-[calc(100vh-220px)]' 
                  : 'h-80'
              } min-h-[20rem] p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded overflow-auto`}
              style={{ 
                whiteSpace: "pre-wrap", 
                wordBreak: "break-word" 
              }}
              dangerouslySetInnerHTML={sanitizeAndParseHTML(rawTranscript)}
            />
            <Button
              onClick={handleSendToSandbox}
              className="bg-orange-600 hover:bg-orange-700 w-full relative isolate group"
            >
              <span className="pointer-events-none absolute inset-x-0 bottom-full mb-2 flex items-center justify-center">
                <span className="bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Highlight text to send only that selection
                </span>
              </span>
              Send to Sandbox
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}