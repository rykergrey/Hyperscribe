import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIFunction } from "@/lib/functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MDEditor from "@uiw/react-md-editor";
import { FunctionManager } from "./FunctionManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaCopy, FaExpand, FaMinus, FaPlus, FaList, FaVolumeUp } from 'react-icons/fa';
import { SandboxQueue } from "./SandboxQueue";
import { AudioPlayer } from "./AudioPlayer";
import { useTextSelection } from "@/hooks/useTextSelection";
import SharedComponentWrapper from "@/components/SharedComponentWrapper";

// Custom styles for the MDEditor
const mdEditorStyles = {
  backgroundColor: "#374151", // Matches bg-gray-700
  color: "#e5e7eb", // Light text color
};

interface SandboxProps {
  sandboxText: string;
  setSandboxText: React.Dispatch<React.SetStateAction<string>>;
  selectedFunction: string;
  setSelectedFunction: React.Dispatch<React.SetStateAction<string>>;
  functions: Record<string, AIFunction> | undefined; // Add undefined as a possible type
  setFunctions: React.Dispatch<
    React.SetStateAction<Record<string, AIFunction>>
  >;
  executeFunction: (
    functionName: string,
    input: string,
  ) => Promise<string | undefined>;
  showManageFunctionsButton?: boolean;
  isExpanded?: boolean;
  onExpand?: () => void;
  setSelectedText: React.Dispatch<React.SetStateAction<string | null>>;
  onOpenAudioPlayer: () => void;
}

export default function Sandbox({
  sandboxText,
  setSandboxText,
  selectedFunction,
  setSelectedFunction,
  functions,
  setFunctions,
  executeFunction,
  showManageFunctionsButton = true,
  isExpanded,
  onExpand,
  setSelectedText,
  onOpenAudioPlayer,
}: SandboxProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [showManageFunctions, setShowManageFunctions] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSandboxQueue, setShowSandboxQueue] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const sandboxRef = useTextSelection(setSelectedText);

  const handleExecute = useCallback(async () => {
    if (!selectedFunction || !sandboxText.trim()) return;
    setIsExecuting(true);
    try {
      const result = await executeFunction(selectedFunction, sandboxText);
      if (result) {
        const formattedResult = `### ${selectedFunction}\n\n${result}`;
        setSandboxText(formattedResult);
      }
    } catch (error) {
      console.error("Error executing function:", error);
      alert("An error occurred while executing the function. Please try again.");
    } finally {
      setIsExecuting(false);
    }
  }, [selectedFunction, sandboxText, executeFunction, setSandboxText]);

  const handleClearSandbox = () => {
    setSandboxText("");
    setShowClearDialog(false);
  };

  const copyContent = () => {
    if (typeof window !== 'undefined') {
      const tempInput = document.createElement('textarea');
      tempInput.value = sandboxText;
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

  const handleExecuteQueue = async (functionQueue: string[], resultMode: "replace" | "append") => {
    let currentContent = sandboxText;
    let results: string[] = [];

    for (const funcName of functionQueue) {
      try {
        const result = await executeFunction(funcName, currentContent);
        if (result) {
          // Format the function name like the Q&A component's question style
          const formattedResult = `## ${funcName}\n\n${result}`;
          results.push(formattedResult);
          currentContent = result; // Use the raw result as input for the next function
        } else {
          console.error(`Function ${funcName} returned no result`);
        }
      } catch (error) {
        console.error(`Error executing function ${funcName}:`, error);
      }
    }

    if (resultMode === "replace") {
      setSandboxText(results[results.length - 1] || ''); // Set content to the result of the last function
    } else { // append mode
      const combinedResults = results.join('\n\n');
      setSandboxText((prevContent) => prevContent + '\n\n' + combinedResults);
    }
  };

  const handleSpeak = () => {
    const textToSpeak = window.getSelection()?.toString().trim() || sandboxText;
    console.log("Text to be spoken:", textToSpeak);
    onOpenAudioPlayer();
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    setSelectedText(selectedText || null);
  }, [setSelectedText]);

  return (
    <SharedComponentWrapper
      title="Sandbox"
      onCopy={copyContent}
      onExpand={onExpand}
      isExpanded={isExpanded}
      copiedFeedback={copiedFeedback}
      onSpeak={handleSpeak}
    >
      <div className="flex flex-col h-full">
        <div className="space-y-2 mb-2">
          <Select value={selectedFunction} onValueChange={setSelectedFunction} className="w-full">
            <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
              <SelectValue placeholder="Select function" />
            </SelectTrigger>
            <SelectContent>
              {functions && Object.keys(functions).map((funcName) => (
                <SelectItem key={funcName} value={funcName}>
                  {funcName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button
              onClick={handleExecute}
              className="bg-purple-600 hover:bg-purple-700 flex-grow"
              disabled={isExecuting || !selectedFunction || !sandboxText.trim()}
            >
              {isExecuting ? "Executing..." : "Execute"}
            </Button>
            <Button
              onClick={() => setShowClearDialog(true)}
              className="bg-red-600 hover:bg-red-700 flex-grow"
            >
              Clear
            </Button>
          </div>
        </div>
        <div className="flex-grow">
          <MDEditor
            value={sandboxText}
            onChange={(value) => setSandboxText(value || "")}
            preview="preview"
            height="100%"
            className="!h-full"
            textareaProps={{
              placeholder: "Enter text here...",
              style: { height: '100%' },
            }}
          />
        </div>
      </div>
      {showClearDialog && (
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogContent className="bg-gray-800 text-gray-100">
            <DialogHeader>
              <DialogTitle>Clear Sandbox</DialogTitle>
              <DialogDescription>
                Are you sure you want to clear the sandbox? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setShowClearDialog(false)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClearSandbox}
                className="bg-red-600 hover:bg-red-700"
              >
                Clear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {showSandboxQueue && (
        <SandboxQueue
          functions={functions}
          onExecute={handleExecuteQueue}
          onClose={() => setShowSandboxQueue(false)}
        />
      )}
    </SharedComponentWrapper>
  );
}
