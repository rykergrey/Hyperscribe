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
  functions: Record<string, AIFunction>;
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
  showManageFunctionsButton = false,
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
<Card className={`bg-gray-800 border-none shadow-lg shadow-purple-500/20 transition-all duration-300 rounded-lg overflow-hidden ${
  isExpanded ? 'fixed inset-0 z-50 m-0 rounded-none' : ''
} ${isMinimized ? 'h-[64px] mb-2' : 'mb-4'}`}>
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-gray-800 z-10 p-3">
        <CardTitle className="text-2xl font-bold text-blue-400">
          Sandbox
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            onClick={copyContent}
            className={`p-2 ${copiedFeedback ? 'bg-green-600' : 'bg-gray-600'} hover:bg-gray-700`}
          >
            {copiedFeedback ? 'Copied!' : <FaCopy />}
          </Button>
          <Button
            onClick={() => setShowSandboxQueue(!showSandboxQueue)}
            className="p-2 bg-gray-600 hover:bg-gray-700"
          >
            <FaList />
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
        <CardContent className={`space-y-4 ${isExpanded ? 'p-4 md:p-8' : 'p-3'}`}>
          {!isMinimized && (
            <>
              <div className={`flex ${isExpanded ? 'flex-row items-center space-x-2' : 'flex-col space-y-2'}`}>
                <Select value={selectedFunction} onValueChange={setSelectedFunction} className={isExpanded ? 'flex-grow' : 'w-full'}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100 w-full">
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(functions).map((funcName) => (
                      <SelectItem key={funcName} value={funcName}>
                        {funcName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isExpanded && (
                  <>
                    <Button
                      onClick={handleExecute}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={isExecuting || !selectedFunction || !sandboxText.trim()}
                    >
                      {isExecuting ? "Executing..." : "Execute"}
                    </Button>
                    <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700">
                          Clear
                        </Button>
                      </DialogTrigger>
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
                  </>
                )}
              </div>
              {!isExpanded && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleExecute}
                    className="bg-purple-600 hover:bg-purple-700 flex-grow"
                    disabled={isExecuting || !selectedFunction || !sandboxText.trim()}
                  >
                    {isExecuting ? "Executing..." : "Execute"}
                  </Button>
                  {showManageFunctionsButton && (
                    <Button
                      onClick={() => setShowManageFunctions(!showManageFunctions)}
                      className="bg-blue-600 hover:bg-blue-700 flex-grow"
                    >
                      {showManageFunctions ? "Close Manager" : "Manage Functions"}
                    </Button>
                  )}
                  <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 flex-grow">
                        Clear
                      </Button>
                    </DialogTrigger>
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
                </div>
              )}

              {showManageFunctions && showManageFunctionsButton && (
                <FunctionManager
                  functions={functions}
                  setFunctions={setFunctions}
                  selectedFunction={selectedFunction}
                  setSelectedFunction={setSelectedFunction}
                />
              )}

              <div
                ref={sandboxRef}
                data-color-mode="dark"
                className="bg-gray-700 rounded-md overflow-hidden"
              >
                <MDEditor
                  value={sandboxText}
                  onChange={(value) => setSandboxText(value || "")}
                  preview="preview"
                  className="!bg-gray-700"
                  textareaProps={{
                    placeholder: "Send text here...",
                    className: "!bg-gray-700 !text-gray-100",
                    onMouseUp: handleTextSelection,
                  }}
                  previewOptions={{
                    className: "!bg-gray-700 !text-gray-100",
                  }}
                  height={isExpanded ? "calc(100vh - 140px)" : "320px"}
                  style={{
                    ...mdEditorStyles,
                    transition: 'height 0.3s ease-in-out'
                  }}
                />
              </div>
            </>
          )}
        </CardContent>
      </div>
      {showSandboxQueue && (
        <SandboxQueue
          functions={functions}
          onExecute={handleExecuteQueue}
          onClose={() => setShowSandboxQueue(false)}
        />
      )}
    </Card>
  );
}
