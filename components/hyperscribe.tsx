"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultFunctions, AIFunction } from "@/lib/functions";
import { executeFunction } from "@/lib/executeFunction";
import { useTextSelection } from '@/hooks/useTextSelection';

// Import components statically
import RawTranscript from "./RawTranscript";
import Summary from "./Summary";
import QuestionAnswer from "./QuestionAnswer";
import Sandbox from "./Sandbox";
import { AudioPlayer } from "./AudioPlayer";

interface AudioItem {
  id: string;
  text: string;
  blob: Blob;
}

export default function Hyperscribe() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [rawTranscript, setRawTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sandboxText, setSandboxText] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");
  const [functions, setFunctions] = useState<Record<string, any>>({});
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [expandedComponent, setExpandedComponent] = useState<string | null>(
    null,
  );

  const [audioPlaylist, setAudioPlaylist] = useState<AudioItem[]>([]);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    currentItem: null as AudioItem | null,
    currentIndex: -1,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [selectedText, setSelectedText] = useState<string | null>(null);

  const handleSetSelectedText = useCallback((text: string | null) => {
    console.log("Selected text in Hyperscribe:", text);
    setSelectedText(text);
  }, []);

  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        const response = await fetch("/api/get-functions");
        if (response.ok) {
          const data = await response.json();
          setFunctions(data.functions);
        } else {
          throw new Error("Failed to fetch functions");
        }
      } catch (error) {
        console.error("Error fetching functions:", error);
      }
    };

    fetchFunctions();
  }, []);

  useEffect(() => {
    if (expandedComponent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [expandedComponent]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const updateAudioState = () => {
      setAudioState(prevState => ({
        ...prevState,
        isPlaying: !audio.paused,
        currentTime: audio.currentTime,
        duration: audio.duration,
        volume: audio.volume,
      }));
    };

    audio.addEventListener("loadedmetadata", updateAudioState);
    audio.addEventListener("timeupdate", updateAudioState);
    audio.addEventListener("play", updateAudioState);
    audio.addEventListener("pause", updateAudioState);

    return () => {
      audio.removeEventListener("loadedmetadata", updateAudioState);
      audio.removeEventListener("timeupdate", updateAudioState);
      audio.removeEventListener("play", updateAudioState);
      audio.removeEventListener("pause", updateAudioState);
    };
  }, []);

  const handleProcessYouTube = async () => {
    if (!youtubeUrl) return;
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("youtubeUrl", youtubeUrl);
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to process YouTube video");
      const data = await response.json();
      setRawTranscript(decodeHTMLEntities(data.transcript));
    } catch (error) {
      console.error("Error processing YouTube video:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleExecuteFunction = async (functionName: string, input: string) => {
    if (!functions[functionName]) return;
    try {
      const result = await executeFunction(functions[functionName], input);
      if (result) {
        // Remove the function name and any leading newlines
        return result.replace(/^### .*\n+/, "").trim();
      }
    } catch (error) {
      console.error(`Error executing function ${functionName}:`, error);
    }
  };

  const appendToSandbox = (text: string) => {
    setSandboxText((prevText) => prevText + (prevText ? "\n\n" : "") + text);
  };

  const [isProcessingComments, setIsProcessingComments] = useState(false);

  const handleProcessYouTubeComments = async () => {
    if (!youtubeUrl) return;
    setIsProcessingComments(true);
    try {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }
      const response = await fetch("/api/youtube-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to process YouTube comments: ${errorData.error}. Details: ${errorData.details}`,
        );
      }
      const data = await response.json();
      setRawTranscript(decodeHTMLEntities(data.comments));
    } catch (error) {
      console.error("Error processing YouTube comments:", error);
      // Display error to user
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessingComments(false);
    }
  };

  const extractVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Function to decode HTML entities
  const decodeHTMLEntities = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
  };

  const handleOpenAudioPlayer = () => {
    setShowAudioPlayer(true);
  };

  const handleCloseAudioPlayer = () => {
    setShowAudioPlayer(false);
    // The audio will continue playing
  };

  const handleAddToPlaylist = (item: AudioItem) => {
    setAudioPlaylist((prevPlaylist) => [...prevPlaylist, item]);
  };

  const handleGenerateSpeech = async (component: string) => {
    let text = '';
    switch (component) {
      case 'summary':
        text = summary;
        break;
      case 'sandbox':
        text = sandboxText;
        break;
      case 'qa':
        text = `Question: ${question}\n\nAnswer: ${answer}`;
        break;
      case 'selection':
        text = selectedText || '';
        break;
    }

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      handleAddToPlaylist({
        id: Date.now().toString(),
        text: text.substring(0, 50) + "...",
        blob: audioBlob,
      });
    } catch (error) {
      console.error("Error generating speech:", error);
    }
  };

  const handleReorderPlaylist = useCallback((newPlaylist: AudioItem[]) => {
    setAudioPlaylist(newPlaylist);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      <div className="gradient-container">
        <div className="absolute inset-0 bg-gradient-animation"></div>
      </div>
      <div className="relative z-10 container mx-auto p-4 flex flex-col min-h-screen">
        <div className="flex-grow space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold pb-1 leading-none uppercase">
            <span style={{
  background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: '#3b82f6', // Fallback color
  display: 'inline-block'
}}>
  HYPERSCRIBE.AI
</span>
            </h1>

            <Card className="bg-gray-800 border-none shadow-lg shadow-purple-500/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-400">
                  Information Source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-full sm:flex-grow">
                    <Input
                      placeholder="YouTube URL Here"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <div className="flex w-full sm:w-auto space-x-4">
                    <Button
                      onClick={handleProcessYouTube}
                      className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                      disabled={!youtubeUrl || isTranscribing}
                    >
                      Retrieve Transcript
                    </Button>

                    <Button
                      onClick={handleProcessYouTubeComments}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                      disabled={!youtubeUrl || isProcessingComments}
                    >
                      Retrieve Comments
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <RawTranscript
              rawTranscript={rawTranscript}
              setRawTranscript={setRawTranscript}
              appendToSandbox={appendToSandbox}
              isExpanded={expandedComponent === "rawTranscript"}
              onExpand={() => setExpandedComponent(expandedComponent === "rawTranscript" ? null : "rawTranscript")}
              setSelectedText={handleSetSelectedText}
            />
            {expandedComponent !== "rawTranscript" && (
              <>
                <Summary
                  summary={summary}
                  setSummary={setSummary}
                  rawTranscript={rawTranscript}
                  executeFunction={handleExecuteFunction}
                  appendToSandbox={appendToSandbox}
                  isExpanded={expandedComponent === "summary"}
                  onExpand={() => setExpandedComponent(expandedComponent === "summary" ? null : "summary")}
                  onOpenAudioPlayer={handleOpenAudioPlayer}
                  setSelectedText={handleSetSelectedText}
                />
                <QuestionAnswer
                  question={question}
                  setQuestion={setQuestion}
                  answer={answer}
                  setAnswer={setAnswer}
                  rawTranscript={rawTranscript}
                  executeFunction={handleExecuteFunction}
                  appendToSandbox={appendToSandbox}
                  isExpanded={expandedComponent === "questionAnswer"}
                  onExpand={() => setExpandedComponent(expandedComponent === "questionAnswer" ? null : "questionAnswer")}
                  setSelectedText={handleSetSelectedText}
                  onOpenAudioPlayer={handleOpenAudioPlayer}
                />
                <Sandbox
                  sandboxText={sandboxText}
                  setSandboxText={setSandboxText}
                  selectedFunction={selectedFunction}
                  setSelectedFunction={setSelectedFunction}
                  functions={functions}
                  setFunctions={setFunctions}
                  executeFunction={handleExecuteFunction}
                  isExpanded={expandedComponent === "sandbox"}
                  onExpand={() => setExpandedComponent(expandedComponent === "sandbox" ? null : "sandbox")}
                  setSelectedText={handleSetSelectedText}
                  onOpenAudioPlayer={handleOpenAudioPlayer}
                />
              </>
            )}
          </div>
        </div>
      </div>
      {showAudioPlayer && (
        <AudioPlayer
          playlist={audioPlaylist}
          onClose={handleCloseAudioPlayer}
          onAddToPlaylist={handleAddToPlaylist}
          onGenerateSpeech={handleGenerateSpeech}
          audioState={audioState}
          setAudioState={setAudioState}
          audioRef={audioRef}
          selectedText={selectedText || ''}
          onReorderPlaylist={handleReorderPlaylist}
        />
      )}
    </div>
  );
}
