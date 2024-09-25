import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DOMPurify from "dompurify";
import { FaCopy, FaExpand, FaMinus, FaPlus } from 'react-icons/fa';

interface RawTranscriptProps {
  rawTranscript: string;
  setRawTranscript: React.Dispatch<React.SetStateAction<string>>;
  appendToSandbox: (text: string) => void;
  isExpanded: boolean;
  onExpand: () => void;
  setSelectedText: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function RawTranscript({
  rawTranscript,
  setRawTranscript,
  appendToSandbox,
  isExpanded,
  onExpand,
  setSelectedText,
}: RawTranscriptProps) {
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const sanitizeHTML = (html: string) => {
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(html);
    }
    return html;
  };

  const handleCopy = useCallback(() => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(rawTranscript).then(() => {
        setCopiedFeedback(true);
        setTimeout(() => setCopiedFeedback(false), 2000);
      }).catch((err) => {
        console.error('Failed to copy: ', err);
      });
    } else {
      // Fallback for browsers that don't support navigator.clipboard
      const textArea = document.createElement("textarea");
      textArea.value = rawTranscript;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedFeedback(true);
        setTimeout(() => setCopiedFeedback(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
      document.body.removeChild(textArea);
    }
  }, [rawTranscript]);

  const handleSendToSandbox = () => {
    const selectedText = window.getSelection()?.toString() || rawTranscript;
    appendToSandbox(selectedText);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && transcriptRef.current) {
      const selectedText = selection.toString().trim();
      if (selectedText && transcriptRef.current.contains(selection.anchorNode)) {
        setSelectedText(selectedText);
      } else {
        setSelectedText(null);
      }
    }
  }, [setSelectedText]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange, handleCopy]);

  return (
<Card className={`bg-gray-800 border-none shadow-lg shadow-purple-500/20 transition-all duration-300 rounded-lg overflow-hidden ${
  isExpanded ? 'fixed inset-0 z-50 m-0 rounded-none' : ''
} ${isMinimized ? 'h-[64px] mb-2' : 'mb-4'}`}>
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-gray-800 z-10 p-3">
        <CardTitle className="text-2xl font-bold text-blue-400">
          Raw Data
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            onClick={handleCopy}
            className={`p-2 ${copiedFeedback ? "bg-green-500" : "bg-gray-600"} hover:bg-gray-700`}
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
        </div>
      </CardHeader>
      <div className={`transition-all duration-300 ${isMinimized ? 'h-0 overflow-hidden' : 'h-auto'}`}>
        <CardContent className={`space-y-4 ${isExpanded ? 'p-4 md:p-8' : 'p-3'}`}>
          <div
            ref={transcriptRef}
            className={`w-full ${
              isExpanded 
                ? 'h-[calc(100vh-180px)] md:h-[calc(100vh-220px)]' 
                : 'h-80'
            } min-h-[20rem] p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded overflow-auto`}
            style={{ 
              whiteSpace: "pre-wrap", 
              wordBreak: "break-word",
              userSelect: 'text',
            }}
          >
            {sanitizeHTML(rawTranscript)}
          </div>
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
        </CardContent>
      </div>
    </Card>
  );
}