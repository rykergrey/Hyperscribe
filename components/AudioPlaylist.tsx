import React from "react";
import { Button } from "@/components/ui/button";
import { FaArrowUp, FaArrowDown, FaTimes, FaDownload } from "react-icons/fa";

interface AudioItem {
  id: string;
  text: string;
  blob: Blob;
}

interface AudioPlaylistProps {
  playlist: AudioItem[];
  currentItem: AudioItem | null;
  onPlay: (item: AudioItem) => void;
  onReorder: (newPlaylist: AudioItem[]) => void;
  onRemove: (item: AudioItem) => void;
  onDownload: (item: AudioItem) => void;  // Add this new prop
}

export function AudioPlaylist({
  playlist,
  currentItem,
  onPlay,
  onReorder,
  onRemove,
  onDownload,  // Add this new prop
}: AudioPlaylistProps) {
  const moveItem = (index: number, direction: "up" | "down") => {
    const newPlaylist = Array.from(playlist);
    const [movedItem] = newPlaylist.splice(index, 1);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    newPlaylist.splice(newIndex, 0, movedItem);
    onReorder(newPlaylist);
  };

  return (
    <div className="max-h-60 overflow-y-auto">
      {playlist.map((item, index) => (
        <div
          key={item.id}
          className={`flex items-center justify-between p-2 border-b border-gray-700 ${
            currentItem?.id === item.id ? "bg-blue-900" : ""
          }`}
        >
          <div
            className="truncate flex-grow mr-2 cursor-pointer"
            onClick={() => onPlay(item)}
          >
            {item.text}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => moveItem(index, "up")}
              className="p-1"
              disabled={index === 0}
            >
              <FaArrowUp />
            </Button>
            <Button
              onClick={() => moveItem(index, "down")}
              className="p-1"
              disabled={index === playlist.length - 1}
            >
              <FaArrowDown />
            </Button>
            <Button
              onClick={() => onDownload(item)}
              className="p-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FaDownload />
            </Button>
            <Button
              onClick={() => onRemove(item)}
              className="p-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <FaTimes />
            </Button>
          </div>
        </div>
      ))}
      {playlist.length === 0 && (
        <div className="text-gray-400 text-center py-4">
          No items in playlist
        </div>
      )}
    </div>
  );
}