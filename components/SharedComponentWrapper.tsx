import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaCopy, FaExpand, FaMinus, FaPlus, FaVolumeUp } from "react-icons/fa";

interface SharedComponentWrapperProps {
  title: string;
  children: React.ReactNode;
  onCopy: () => void;
  onExpand: () => void;
  onSpeak?: () => void;
  isExpanded: boolean;
  copiedFeedback: boolean;
}

export default function SharedComponentWrapper({
  title,
  children,
  onCopy,
  onExpand,
  onSpeak,
  isExpanded,
  copiedFeedback,
}: SharedComponentWrapperProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <Card className={`bg-gray-800 border-none shadow-lg shadow-purple-500/20 transition-all duration-300 overflow-hidden
      ${isExpanded ? 'fixed inset-0 z-50 w-full h-full' : 'rounded-lg'}
      ${isMinimized ? 'h-[64px]' : isExpanded ? 'h-full' : 'h-[calc(50vh-2rem)]'}`}>
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-gray-800 z-10 p-4">
        <CardTitle className="text-2xl font-bold text-blue-400">{title}</CardTitle>
        <div className="flex space-x-2">
          <Button
            onClick={onCopy}
            className={`p-2 ${copiedFeedback ? 'bg-green-600' : 'bg-gray-600'} hover:bg-gray-700`}
          >
            {copiedFeedback ? 'Copied!' : <FaCopy />}
          </Button>
          <Button
            onClick={() => setIsMinimized(!isMinimized)}
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
          {onSpeak && (
            <Button
              onClick={onSpeak}
              className="p-2 bg-gray-600 hover:bg-gray-700"
            >
              <FaVolumeUp />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={`transition-all duration-300 ${isMinimized ? 'h-0 overflow-hidden' : 'h-[calc(100%-4rem)] overflow-auto'}`}>
        {children}
      </CardContent>
    </Card>
  );
}