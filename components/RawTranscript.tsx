import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DOMPurify from 'dompurify';

interface RawTranscriptProps {
  rawTranscript: string;
  setRawTranscript: React.Dispatch<React.SetStateAction<string>>;
  appendToSandbox: (text: string) => void;
}

function RawTranscript({
  rawTranscript,
  setRawTranscript,
  appendToSandbox,
}: RawTranscriptProps) {
  const textareaRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const sanitizeAndParseHTML = (html: string) => {
    if (typeof window !== 'undefined') {
      // Client-side-only code
      const sanitizedHTML = DOMPurify.sanitize(html);
      return { __html: sanitizedHTML };
    }
    return { __html: html }; // Fallback for server-side rendering
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(rawTranscript)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const handleSendToSandbox = () => {
    if (textareaRef.current) {
      const selectedText = window.getSelection()?.toString() || rawTranscript;
      appendToSandbox(selectedText);
    }
  };

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-blue-400">
          Raw Data
        </CardTitle>
        <Button
          onClick={handleCopy}
          className={`transition-colors ${
            isCopied
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isCopied ? "Copied!" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={textareaRef}
          className="w-full h-[20rem] min-h-[20rem] p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded overflow-auto"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          dangerouslySetInnerHTML={sanitizeAndParseHTML(rawTranscript)}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSendToSandbox}
            className="bg-orange-600 hover:bg-orange-700 relative isolate group"
          >
            <span className="pointer-events-none absolute inset-x-0 bottom-full mb-2 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Highlight text to send only that selection
              </span>
            </span>
            Send to Sandbox
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default RawTranscript;