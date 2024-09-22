import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCopy, FaExpand, FaMinus, FaVolumeUp } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AudioPlayer } from "./AudioPlayer";

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
  onAddToPlaylist,
  onOpenAudioPlayer,
  setSelectedText,
}: SummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState("EXAVITQu4vr4xnSDxMaL");
  const [modelId, setModelId] = useState("eleven_monolingual_v1");
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0.0);
  const [speakerBoost, setSpeakerBoost] = useState(true);
  const [useSpeedup, setUseSpeedup] = useState(0);
  const [outputFormat, setOutputFormat] = useState("mp3_44100_128");
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && summaryRef.current?.contains(selection.anchorNode)) {
        const selectedText = selection.toString().trim();
        setSelectedText(selectedText || null);
        console.log("Selected text in Summary:", selectedText); // Add this line for debugging
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [setSelectedText]);

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
    navigator.clipboard
      .writeText(summary)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSpeak = () => {
    onOpenAudioPlayer();
  };

  const handleCloseAudioPlayer = () => {
    setShowAudioPlayer(false);
  };

  return (
    <Card
      className={`bg-gray-800 border-none shadow-lg shadow-purple-500/20 transition-all duration-300 rounded-lg ${
        isExpanded ? "fixed inset-0 z-50 m-0 rounded-none overflow-auto" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-transparent z-10">
        <CardTitle className="text-2xl font-bold text-blue-400">
          Summary
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            onClick={handleCopy}
            className="p-2 bg-gray-600 hover:bg-gray-700"
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
          <Button
            onClick={handleSpeak}
            className="p-2 bg-gray-600 hover:bg-gray-700"
            disabled={isGeneratingSpeech}
          >
            <FaVolumeUp />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`space-y-4 ${isExpanded ? "p-4 md:p-8" : ""}`}>
        {!isMinimized && (
          <div className="flex flex-col h-full">
            <div
              ref={summaryRef}
              className="flex-grow overflow-auto mb-4"
              style={{ height: isExpanded ? "auto" : "320px" }}
            >
              <div className="w-full h-full p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded overflow-auto markdown-content">
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
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
              <Button
                onClick={() => handleGenerateSummary("Generate Simple Summary")}
                className="bg-purple-600 hover:bg-purple-700 flex-grow"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Simple"}
              </Button>
              <Button
                onClick={() =>
                  handleGenerateSummary("Generate Detailed Summary")
                }
                className="bg-blue-600 hover:bg-blue-700 flex-grow"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Detailed"}
              </Button>
              <Button
                onClick={handleSendToSandbox}
                className="bg-orange-600 hover:bg-orange-700 flex-grow relative isolate group"
              >
                <span className="pointer-events-none absolute inset-x-0 bottom-full mb-2 flex items-center justify-center">
                  <span className="bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Highlight text to send only that selection
                  </span>
                </span>
                Send to Sandbox
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
