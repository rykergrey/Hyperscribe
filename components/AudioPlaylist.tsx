import React from "react";
import { Button } from "@/components/ui/button";
import { FaPlay, FaDownload } from "react-icons/fa";

interface AudioItem {
  id: string;
  text: string;
  blob: Blob;
}

interface AudioPlaylistProps {
  playlist: AudioItem[];
  currentItem: AudioItem | null;
  onPlay: (item: AudioItem) => void;
  onDownload: (item: AudioItem) => void;
}

export function AudioPlaylist({
  playlist,
  currentItem,
  onPlay,
  onDownload,
}: AudioPlaylistProps) {
  return (
    <div className="max-h-60 overflow-y-auto">
      {playlist.map((item) => (
        <div
          key={item.id}
          className={`flex items-center justify-between p-2 border-b border-gray-700 ${currentItem?.id === item.id ? "bg-blue-900" : ""}`}
        >
          <div className="truncate flex-grow mr-2">
            {item.text.substring(0, 50)}...
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => onPlay(item)} className="p-1">
              <FaPlay />
            </Button>
            <Button onClick={() => onDownload(item)} className="p-1">
              <FaDownload />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
