import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Add this import

interface RawTranscriptProps {
  rawTranscript: string;
  setRawTranscript: React.Dispatch<React.SetStateAction<string>>;
  appendToSandbox: (text: string) => void;
}

function RawTranscript({ rawTranscript, setRawTranscript, appendToSandbox }: RawTranscriptProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawTranscript);
  };

  const handleSendToSandbox = () => {
    if (textareaRef.current) {
      const selectedText = textareaRef.current.value.substring(
        textareaRef.current.selectionStart,
        textareaRef.current.selectionEnd
      );
      appendToSandbox(selectedText || rawTranscript);
    }
  };

  return (
    <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-400">Raw Transcript</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          ref={textareaRef}
          value={rawTranscript}
          onChange={(e) => setRawTranscript(e.target.value)}
          className="w-full h-[20rem] min-h-[20rem] p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded resize-y"
          style={{ resize: 'vertical' }}
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={handleCopy} className="bg-purple-600 hover:bg-purple-700">
            Copy
          </Button>
          <Button onClick={handleSendToSandbox} className="bg-orange-600 hover:bg-orange-700">
            Send to Sandbox
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default RawTranscript;