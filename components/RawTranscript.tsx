import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import SharedComponentWrapper from "@/components/SharedComponentWrapper";

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
  const transcriptRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(() => {
    if (transcriptRef.current) {
      navigator.clipboard.writeText(transcriptRef.current.innerText);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    }
  }, []);

  const handleSendToSandbox = () => {
    appendToSandbox(rawTranscript);
  };

  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html);
  };

  return (
    <SharedComponentWrapper
      title="Raw Data"
      onCopy={handleCopy}
      onExpand={onExpand}
      isExpanded={isExpanded}
      copiedFeedback={copiedFeedback}
    >
      <div className="flex flex-col h-full">
        <div
          ref={transcriptRef}
          className="flex-grow overflow-auto p-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", userSelect: 'text' }}
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(rawTranscript) }}
        />
        <Button
          onClick={handleSendToSandbox}
          className="bg-orange-600 hover:bg-orange-700 w-full py-2 mt-4"
        >
          Send to Sandbox
        </Button>
      </div>
    </SharedComponentWrapper>
  );
}