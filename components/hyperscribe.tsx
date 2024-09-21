"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultFunctions, AIFunction } from "@/lib/functions";
import { executeFunction } from "@/lib/executeFunction";

// Import components statically
import RawTranscript from "./RawTranscript";
import Summary from "./Summary";
import QuestionAnswer from "./QuestionAnswer";
import Sandbox from "./Sandbox";

export default function Hyperscribe() {
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [rawTranscript, setRawTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sandboxText, setSandboxText] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");
  const [functions, setFunctions] =
    useState<Record<string, AIFunction>>(defaultFunctions);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [expandedComponent]);

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
        return `# ${functionName}\n\n${result}`;
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
        throw new Error(`Failed to process YouTube comments: ${errorData.error}. Details: ${errorData.details}`);
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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Function to decode HTML entities
  const decodeHTMLEntities = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      <div className="gradient-container">
        <div className="absolute inset-0 bg-gradient-animation"></div>
      </div>
      <div className="relative z-10 container mx-auto p-4">
        <div className="container mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold pb-1 leading-none uppercase">
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #3B82F6, #B794F4, #F7F7F7, #FBD38D)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  display: "inline-block",
                  textShadow: "none",
                }}
              >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6 flex flex-col">
              <RawTranscript
                rawTranscript={rawTranscript}
                setRawTranscript={setRawTranscript}
                appendToSandbox={appendToSandbox}
                isExpanded={expandedComponent === 'rawTranscript'}
                onExpand={() => setExpandedComponent(expandedComponent === 'rawTranscript' ? null : 'rawTranscript')}
              />
              <QuestionAnswer
                question={question}
                setQuestion={setQuestion}
                answer={answer}
                setAnswer={setAnswer}
                rawTranscript={rawTranscript}
                executeFunction={handleExecuteFunction}
                appendToSandbox={appendToSandbox}
                isExpanded={expandedComponent === 'questionAnswer'}
                onExpand={() => setExpandedComponent(expandedComponent === 'questionAnswer' ? null : 'questionAnswer')}
              />
            </div>

            <div className="space-y-6 flex flex-col">
              <Summary
                summary={summary}
                setSummary={setSummary}
                rawTranscript={rawTranscript}
                executeFunction={handleExecuteFunction}
                appendToSandbox={appendToSandbox}
                isExpanded={expandedComponent === 'summary'}
                onExpand={() => setExpandedComponent(expandedComponent === 'summary' ? null : 'summary')}
              />
              <Sandbox
                sandboxText={sandboxText}
                setSandboxText={setSandboxText}
                selectedFunction={selectedFunction}
                setSelectedFunction={setSelectedFunction}
                functions={functions}
                setFunctions={setFunctions}
                executeFunction={handleExecuteFunction}
                isExpanded={expandedComponent === 'sandbox'}
                onExpand={() => setExpandedComponent(expandedComponent === 'sandbox' ? null : 'sandbox')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
