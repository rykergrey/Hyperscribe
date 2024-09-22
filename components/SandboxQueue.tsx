import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIFunction } from "@/lib/functions";
import { FaTrash, FaPlus, FaSpinner } from "react-icons/fa";

type ResultMode = "replace" | "append";

interface SandboxQueueProps {
  functions: Record<string, AIFunction>;
  onExecute: (functionQueue: string[], resultMode: ResultMode) => Promise<void>;
  onClose: () => void;
}

export function SandboxQueue({ functions, onExecute, onClose }: SandboxQueueProps) {
  const [functionQueue, setFunctionQueue] = useState<string[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [resultMode, setResultMode] = useState<ResultMode>("replace");

  const addToQueue = () => {
    if (selectedFunction) {
      setFunctionQueue([...functionQueue, selectedFunction]);
      setSelectedFunction("");
    }
  };

  const removeFromQueue = (index: number) => {
    setFunctionQueue(functionQueue.filter((_, i) => i !== index));
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    for (let i = 0; i < functionQueue.length; i++) {
      setExecutingIndex(i);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating execution time
    }
    await onExecute(functionQueue, resultMode);
    setIsExecuting(false);
    setExecutingIndex(null);
    onClose();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-80 text-white border border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold">Sandbox Function Queue</h2>
        <Button onClick={onClose} className="p-1 h-6 w-6 text-xs">
          X
        </Button>
      </div>
      <ul className="space-y-1 mb-2 max-h-32 overflow-y-auto text-xs">
        {functionQueue.map((func, index) => (
          <li
            key={index}
            className={`flex items-center justify-between bg-gray-700 p-1 rounded ${
              index === executingIndex ? 'border-2 border-yellow-400' : ''
            }`}
          >
            <span className="truncate flex-grow">{func}</span>
            {index === executingIndex && (
              <FaSpinner className="animate-spin mr-1 text-yellow-400" />
            )}
            <Button
              onClick={() => removeFromQueue(index)}
              className="bg-red-600 hover:bg-red-700 p-1 h-6 w-6 ml-1"
              disabled={isExecuting}
            >
              <FaTrash className="w-3 h-3" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex mb-2">
        <Select 
          value={selectedFunction} 
          onValueChange={setSelectedFunction}
          disabled={isExecuting}
        >
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-xs h-8 flex-grow">
            <SelectValue placeholder="Add function" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(functions).map((funcName) => (
              <SelectItem key={funcName} value={funcName} className="text-black">
                {funcName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={addToQueue} 
          className="ml-2 p-1 h-8 w-8"
          disabled={isExecuting}
        >
          <FaPlus className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs">Result Mode:</span>
        <Select 
          value={resultMode} 
          onValueChange={(value: ResultMode) => setResultMode(value)}
          disabled={isExecuting}
        >
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-xs h-8 w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="replace" className="text-white">Replace</SelectItem>
            <SelectItem value="append" className="text-white">Append</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          onClick={handleExecute}
          className="bg-green-600 hover:bg-green-700 text-xs py-1 px-2 h-8"
          disabled={functionQueue.length === 0 || isExecuting}
        >
          {isExecuting ? "Executing..." : "Execute Queue"}
        </Button>
      </div>
    </div>
  );
}