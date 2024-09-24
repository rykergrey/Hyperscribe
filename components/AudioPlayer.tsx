import React, { useState, useRef, useEffect, useCallback } from "react";
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
  FaRandom,
  FaRedo,
} from "react-icons/fa";
import { AudioPlaylist } from "./AudioPlaylist";

interface AudioItem {
  id: string;
  text: string;
  blob: Blob;
}

interface AudioPlayerProps {
  playlist: AudioItem[];
  onClose: () => void;
  onAddToPlaylist: (item: AudioItem) => void;
  onGenerateSpeech: (component: string) => Promise<void>;
  audioState: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    currentItem: AudioItem | null;
    currentIndex: number;
  };
  setAudioState: React.Dispatch<React.SetStateAction<typeof audioState>>;
  audioRef: React.RefObject<HTMLAudioElement>;
  selectedText: string;
  onReorderPlaylist: (newPlaylist: AudioItem[]) => void;
}

export function AudioPlayer({ 
  playlist, 
  onClose, 
  onAddToPlaylist, 
  onGenerateSpeech, 
  audioState, 
  setAudioState, 
  audioRef, 
  selectedText, 
  onReorderPlaylist 
}: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaylistEnded, setIsPlaylistEnded] = useState(false);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<AudioItem[]>([]);

  const getCurrentPlaylist = useCallback(() => {
    return isShuffled ? shuffledPlaylist : playlist;
  }, [isShuffled, shuffledPlaylist, playlist]);

  const playAudio = useCallback((item: AudioItem) => {
    setIsLoading(true);
    setAudioState((prevState: typeof audioState) => ({
      ...prevState,
      currentItem: item,
      currentIndex: playlist.findIndex(i => i.id === item.id),
    }));
    setIsPlaylistEnded(false);
    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(item.blob);
      audioRef.current.play().then(() => {
        setIsLoading(false);
      }).catch((error) => {
        console.error("Error playing audio:", error);
        setIsLoading(false);
      });
    }
  }, [setAudioState, playlist, audioRef]);

  const playNext = useCallback(() => {
    const currentPlaylist = getCurrentPlaylist();
    if (currentPlaylist.length === 0) return;
    let nextIndex = (audioState.currentIndex + 1) % currentPlaylist.length;
    if (nextIndex === 0 && !isRepeating) {
      setIsPlaylistEnded(true);
      return;
    }
    playAudio(currentPlaylist[nextIndex]);
  }, [getCurrentPlaylist, audioState.currentIndex, isRepeating, playAudio]);

  const playPrevious = useCallback(() => {
    const currentPlaylist = getCurrentPlaylist();
    if (currentPlaylist.length === 0) return;
    let prevIndex = (audioState.currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playAudio(currentPlaylist[prevIndex]);
  }, [getCurrentPlaylist, audioState.currentIndex, playAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateAudioState = () => {
        setAudioState((prevState: typeof audioState) => ({
          ...prevState,
          isPlaying: !audio.paused,
          currentTime: audio.currentTime,
          duration: audio.duration,
          volume: audio.volume,
        }));
      };

      const handleEnded = () => {
        playNext();
      };

      const events = ['loadedmetadata', 'timeupdate', 'play', 'pause', 'ended'];
      events.forEach(event => audio.addEventListener(event, updateAudioState));
      audio.addEventListener('ended', handleEnded);

      return () => {
        events.forEach(event => audio.removeEventListener(event, updateAudioState));
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [setAudioState, audioRef, playNext]);

  useEffect(() => {
    if (isShuffled) {
      const newShuffledPlaylist = [...playlist].sort(() => Math.random() - 0.5);
      setShuffledPlaylist(newShuffledPlaylist);
    } else {
      setShuffledPlaylist([]);
    }
  }, [isShuffled, playlist]);

  const handleAudioEnded = () => {
    playNext();
  };

  const togglePlayPause = () => {
    if (isLoading) return;

    if (audioState.isPlaying) {
      audioRef.current?.pause();
    } else if (audioRef.current?.src) {
      audioRef.current.play();
    } else if (playlist.length > 0) {
      playAudio(playlist[0]);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioState(prevState => ({ ...prevState, isPlaying: false, currentTime: 0 }));
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(prev => !prev);
  };

  const toggleRepeat = () => {
    setIsRepeating(prev => !prev);
    if (isPlaylistEnded) {
      playNext();
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setAudioState(prevState => ({ ...prevState, volume: volumeValue }));
    if (audioRef.current) {
      audioRef.current.volume = volumeValue;
    }
  };

  const handleProgressChange = (newTime: number[]) => {
    const timeValue = newTime[0];
    if (audioRef.current) {
      audioRef.current.currentTime = timeValue;
      setAudioState(prevState => ({ ...prevState, currentTime: timeValue }));
    }
  };

  const handleDownload = (item: AudioItem) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audio_${item.id}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleGenerateSpeech = async (component: string) => {
    setIsGenerating(true);
    await onGenerateSpeech(component);
    setIsGenerating(false);
  };

  const handleReorder = useCallback((newPlaylist: AudioItem[]) => {
    onReorderPlaylist(newPlaylist);

    if (isShuffled) {
      setShuffledPlaylist(newPlaylist);
    }
  }, [isShuffled, onReorderPlaylist]);

  useEffect(() => {
    console.log("Selected text in AudioPlayer:", selectedText); // Add this line for debugging
  }, [selectedText]);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-80 text-white border border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold">Audio Player</h2>
        <Button onClick={onClose} className="p-1 h-6 w-6 text-xs">
          X
        </Button>
      </div>

      <div className="mb-4">
        <AudioPlaylist
          playlist={getCurrentPlaylist()}
          currentItem={audioState.currentItem}
          onPlay={playAudio}
          onReorder={handleReorder}
        />
      </div>

      <div className="flex justify-between mb-4">
        <Button
          onClick={() => handleGenerateSpeech('summary')}
          disabled={isGenerating}
          className="px-2 py-1 text-xs"
        >
          Summary
        </Button>
        <Button
          onClick={() => handleGenerateSpeech('sandbox')}
          disabled={isGenerating}
          className="px-2 py-1 text-xs"
        >
          Sandbox
        </Button>
        <Button
          onClick={() => handleGenerateSpeech('qa')}
          disabled={isGenerating}
          className="px-2 py-1 text-xs"
        >
          Q&A
        </Button>
        <Button
          onClick={() => handleGenerateSpeech('selection')}
          disabled={isGenerating || !selectedText}
          className="px-2 py-1 text-xs"
        >
          Selection
        </Button>
      </div>

      <div className="flex items-center justify-between space-x-2 mb-2">
        <Button
          onClick={togglePlayPause}
          className="p-2 bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" />
          ) : audioState.isPlaying ? (
            <FaPause />
          ) : (
            <FaPlay />
          )}
        </Button>
        <Button onClick={stopAudio} className="p-2 bg-red-600 hover:bg-red-700" disabled={isLoading || !audioRef.current?.src}>
          <FaStop />
        </Button>
        <Button onClick={handleDownload} className="p-2 bg-gray-600 hover:bg-gray-700" disabled={!audioState.currentItem}>
          <FaDownload />
        </Button>
        <Button onClick={toggleShuffle} className={`p-2 ${isShuffled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
          <FaRandom />
        </Button>
        <Button onClick={toggleRepeat} className={`p-2 ${isRepeating ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
          <FaRedo />
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xs">{formatTime(audioState.currentTime)}</span>
        <Slider
          value={[audioState.currentTime]}
          min={0}
          max={audioState.duration}
          step={0.1}
          onValueChange={handleProgressChange}
          className="w-full"
        />
        <span className="text-xs">{formatTime(audioState.duration)}</span>
      </div>

      <div className="flex items-center space-x-2">
        {audioState.volume === 0 ? <FaVolumeMute className="text-gray-400" /> : <FaVolumeUp className="text-gray-400" />}
        <Slider
          value={[audioState.volume]}
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