import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCopy, FaExpand, FaMinus, FaPlus, FaVolumeUp } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTextSelection } from "@/hooks/useTextSelection";
import SharedComponentWrapper from "@/components/SharedComponentWrapper";
interface SummaryProps {
  summary: string;
  setSummary: React.Dispatch<React.SetStateAction<string>>;
  rawTranscript: string;
  executeFunction: (
    functionName: string,
    input: string,
  ) => Promise<string | undefined>;
  appendToSandbox: (text: string) => void;
  isExpanded: boolean;
  onExpand: () => void;
  onAddToPlaylist: (item: AudioItem) => void;
  onOpenAudioPlayer: () => void;
  setSelectedText: React.Dispatch<React.SetStateAction<string | null>>;
}

interface AudioItem {
  id: string;
  text: string;
  blob: Blob;
}

export default function Summary({
  summary,
  setSummary,
  rawTranscript,
  executeFunction,
  appendToSandbox,
  isExpanded,
  onExpand,
  onOpenAudioPlayer,
  setSelectedText,
}: SummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const summaryRef = useTextSelection(setSelectedText);

  const handleGenerateSummary = async (functionName: string) => {
    setIsGenerating(true);
    try {
      const result = await executeFunction(functionName, rawTranscript);
      if (result) {
        setSummary(result);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToSandbox = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    appendToSandbox(selectedText || summary);
  };

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      const tempInput = document.createElement('textarea');
      tempInput.value = summary;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    }
  };

  const handleSpeak = () => {
    const textToSpeak = window.getSelection()?.toString().trim() || summary;
    console.log("Text to be spoken:", textToSpeak);
    onOpenAudioPlayer();
  };

  return (
    <SharedComponentWrapper
      title="Summary"
      onCopy={handleCopy}
      onExpand={onExpand}
      isExpanded={isExpanded}
      copiedFeedback={copiedFeedback}
      onSpeak={handleSpeak}
    >
      <div className="flex flex-col h-full">
        <div
          ref={summaryRef}
          className="flex-grow overflow-auto p-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg markdown-content"
        >
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button
            onClick={() => handleGenerateSummary("Generate Simple Summary")}
            className="bg-purple-600 hover:bg-purple-700 flex-grow py-2"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Simple"}
          </Button>
          <Button
            onClick={() => handleGenerateSummary("Generate Detailed Summary")}
            className="bg-blue-600 hover:bg-blue-700 flex-grow py-2"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Detailed"}
          </Button>
          <Button
            onClick={handleSendToSandbox}
            className="bg-orange-600 hover:bg-orange-700 flex-grow py-2"
          >
            Send to Sandbox
          </Button>
        </div>
      </div>
    </SharedComponentWrapper>
  );
}
