import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIFunction } from '@/lib/functions';
import { FaPlay, FaTimes } from 'react-icons/fa';

interface SandboxQueueProps {
  functions: Record<string, AIFunction>;
  onExecute: (functionQueue: string[]) => void;
  onClose: () => void;
}

export function SandboxQueue({ functions, onExecute, onClose }: SandboxQueueProps) {
  const [functionQueue, setFunctionQueue] = useState<string[]>([]);

  const addFunction = (functionName: string) => {
    if (functionQueue.length < 3) {
      setFunctionQueue([...functionQueue, functionName]);
    }
  };

  const removeFunction = (index: number) => {
    setFunctionQueue(functionQueue.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Sandbox Queue</h3>
        <Button onClick={onClose} className="p-2">
          <FaTimes />
        </Button>
      </div>
      {functionQueue.map((func, index) => (
        <div key={index} className="flex items-center mb-2">
          <Select value={func} onValueChange={(value) => {
            const newQueue = [...functionQueue];
            newQueue[index] = value;
            setFunctionQueue(newQueue);
          }}>
            <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-100">
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
          <Button onClick={() => removeFunction(index)} className="ml-2 p-2 bg-red-600 hover:bg-red-700">
            <FaTimes />
          </Button>
        </div>
      ))}
      {functionQueue.length < 3 && (
        <Select onValueChange={addFunction}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-100">
            <SelectValue placeholder="Add function" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(functions).map((funcName) => (
              <SelectItem key={funcName} value={funcName}>
                {funcName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button 
        onClick={() => onExecute(functionQueue)} 
        className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
        disabled={functionQueue.length === 0}
      >
        <FaPlay className="mr-2" /> Execute Queue
      </Button>
    </div>
  );
}
