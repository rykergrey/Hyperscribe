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
import { FaCopy, FaExpand, FaMinus, FaList } from 'react-icons/fa';
import { SandboxQueue } from "./SandboxQueue";
import { FaVolumeUp } from 'react-icons/fa';
import { AudioPlayer } from "./AudioPlayer";

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
}: SandboxProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [showManageFunctions, setShowManageFunctions] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSandboxQueue, setShowSandboxQueue] = useState(false);
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
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!selectedFunction || !sandboxText.trim()) return;
    setIsExecuting(true);
    try {
      console.log("Executing function:", selectedFunction);
      console.log("Input:", sandboxText);
      const result = await executeFunction(selectedFunction, sandboxText);
      console.log("Result:", result);
      if (result) {
        // Include the function name in the result
        const formattedResult = `### ${selectedFunction}\n\n${result}`;
        setSandboxText(formattedResult);
      }
    } catch (error) {
      console.error("Error executing function:", error);
      alert(
        "An error occurred while executing the function. Please try again.",
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClearSandbox = () => {
    setSandboxText("");
    setShowClearDialog(false);
  };

  const copyContent = () => {
    navigator.clipboard.writeText(sandboxText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => console.error('Failed to copy: ', err));
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
    setShowAudioPlayer(true);
  };

  const handleCloseAudioPlayer = () => {
    setShowAudioPlayer(false);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    setSelectedText(selectedText || null);
    console.log("Selected text:", selectedText); // Add this line
  };

  return (
    <Card className={`bg-gray-800 border-none shadow-lg shadow-purple-500/20 transition-all duration-300 rounded-lg ${
      isExpanded ? 'fixed inset-0 z-50 m-0 rounded-none overflow-auto' : ''
    }`}>
      <CardHeader className={`flex flex-row items-center justify-between sticky top-0 bg-transparent z-10 ${
        isExpanded ? 'p-2' : ''
      }`}>
        <CardTitle className="text-2xl font-bold text-blue-400">
          Sandbox
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            onClick={copyContent}
            className="p-2 bg-gray-600 hover:bg-gray-700"
          >
            <FaCopy />
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
      <CardContent className={`space-y-4 ${isExpanded ? 'pt-0 px-2' : ''}`}>
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
      {showSandboxQueue && (
        <SandboxQueue
          functions={functions}
          onExecute={handleExecuteQueue}
          onClose={() => setShowSandboxQueue(false)}
        />
      )}
      {showAudioPlayer && (
        <AudioPlayer
          text={sandboxText}
          selectedText={selectedText}
          onClose={handleCloseAudioPlayer}
        />
      )}
    </Card>
  );
}
