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
import { FaCopy, FaExpand, FaMinus } from 'react-icons/fa';

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
  showManageFunctionsButton: boolean;
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

  const handleExecute = async () => {
    if (!selectedFunction || !sandboxText.trim()) return;
    setIsExecuting(true);
    try {
      console.log("Executing function:", selectedFunction);
      console.log("Input:", sandboxText);
      const result = await executeFunction(selectedFunction, sandboxText);
      console.log("Result:", result);
      if (result) {
        setSandboxText(result);
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

  return (
    <Card className={`bg-gray-800 border-none shadow-lg shadow-purple-500/20 transition-all duration-300 rounded-lg ${
      isExpanded ? 'fixed inset-0 z-50 m-0 rounded-none overflow-auto' : ''
    }`}>
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-transparent z-10">
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
        </div>
      </CardHeader>
      <CardContent className={`space-y-4 ${isExpanded ? 'p-4 md:p-8' : ''}`}>
        {!isMinimized && (
          <>
            <Select value={selectedFunction} onValueChange={setSelectedFunction}>
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

            {showManageFunctions && (
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
                }}
                previewOptions={{
                  className: "!bg-gray-700 !text-gray-100",
                }}
                height={isExpanded ? "calc(100vh - 280px)" : "320px"}
                style={{
                  ...mdEditorStyles,
                  transition: 'height 0.3s ease-in-out'
                }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
