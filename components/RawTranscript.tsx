import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Decode HTML entities when rawTranscript changes
    const decodedTranscript = decodeHTMLEntities(rawTranscript);
    if (decodedTranscript !== rawTranscript) {
      setRawTranscript(decodedTranscript);
    }
  }, [rawTranscript, setRawTranscript]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawTranscript)
      .then(() => alert("Content copied to clipboard!"))
      .catch(err => console.error('Failed to copy: ', err));
  };

  const handleSendToSandbox = () => {
    if (textareaRef.current) {
      const selectedText = textareaRef.current.value.substring(
        textareaRef.current.selectionStart,
        textareaRef.current.selectionEnd,
      );
      appendToSandbox(selectedText || rawTranscript);
    }
  };

  // Function to decode HTML entities
  const decodeHTMLEntities = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
  };

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">
          Raw Transcript
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          ref={textareaRef}
          value={rawTranscript}
          onChange={(e) => setRawTranscript(e.target.value)}
          className="w-full h-[20rem] min-h-[20rem] p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded resize-y"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        />
        <div className="flex justify-end space-x-2">
          <Button
            onClick={handleCopy}
            className="bg-green-600 hover:bg-green-700"
          >
            Copy
          </Button>
          <Button
            onClick={handleSendToSandbox}
            className="bg-orange-600 hover:bg-orange-700 relative group"
          >
            Send to Sandbox
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Highlight text to send only that selection
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default RawTranscript;
