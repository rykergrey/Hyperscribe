import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  FaPlay,
  FaPause,
  FaStop,
  FaVolumeUp,
  FaVolumeMute,
  FaSpinner,
  FaDownload,
} from "react-icons/fa";

interface AudioPlayerProps {
  text: string;
  onClose: () => void;
}

export function AudioPlayer({ text, selectedText, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener("ended", () => setIsPlaying(false));
    audioRef.current.addEventListener("loadedmetadata", () => {
      setDuration(audioRef.current!.duration);
    });
    audioRef.current.addEventListener("timeupdate", () => {
      setCurrentTime(audioRef.current!.currentTime);
    });
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const fetchAndPlayAudio = async () => {
    setIsLoading(true);
    const textToConvert = selectedText || text;
    const cleanedText = textToConvert.replace(/^### [^\n]+\n\n/, '');
    console.log("Text being sent to API:", cleanedText);
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanedText }),
      });

      if (!response.ok) throw new Error("Failed to generate speech");

      const reader = response.body!.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const blob = new Blob(chunks, { type: "audio/mpeg" });
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error fetching audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (isLoading) return;

    if (isPlaying) {
      audioRef.current?.pause();
    } else if (audioRef.current?.src) {
      audioRef.current.play();
    } else {
      fetchAndPlayAudio();
    }
    setIsPlaying(!isPlaying);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    if (audioRef.current) {
      audioRef.current.volume = volumeValue;
    }
  };

  const handleProgressChange = (newTime: number[]) => {
    const timeValue = newTime[0];
    if (audioRef.current) {
      audioRef.current.currentTime = timeValue;
      setCurrentTime(timeValue);
    }
  };

  const handleDownload = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audio.mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-80 text-white border border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold">Audio Player</h2>
        <Button onClick={onClose} className="p-1 h-6 w-6 text-xs">
          X
        </Button>
      </div>
      <div className="flex items-center space-x-2 mb-2">
        <Button
          onClick={togglePlayPause}
          className="p-2 bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" />
          ) : isPlaying ? (
            <FaPause />
          ) : (
            <FaPlay />
          )}
        </Button>
        <Button
          onClick={stopAudio}
          className="p-2 bg-red-600 hover:bg-red-700"
          disabled={isLoading || !audioRef.current?.src}
        >
          <FaStop />
        </Button>
        <Button
          onClick={handleDownload}
          className="p-2 bg-green-600 hover:bg-green-700"
          disabled={!audioBlob}
        >
          <FaDownload />
        </Button>
      </div>
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xs">{formatTime(currentTime)}</span>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={handleProgressChange}
          className="w-full"
        />
        <span className="text-xs">{formatTime(duration)}</span>
      </div>
      <div className="flex items-center space-x-2">
        {volume === 0 ? <FaVolumeMute className="text-gray-400" /> : <FaVolumeUp className="text-gray-400" />}
        <Slider
          value={[volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-32"
        />
      </div>
    </div>
  );
}
