import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_DATA_API_KEY,
});

export async function POST(req: NextRequest) {
  const { videoId } = await req.json();

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 },
    );
  }

  try {
    const [comments, videoDetails] = await Promise.all([
      fetchComments(videoId),
      fetchVideoDetails(videoId),
    ]);

    const formattedOutput = `
Title: ${videoDetails.title}
Channel: ${videoDetails.channelTitle}
Upload Date: ${videoDetails.publishedAt}
Video ID: ${videoId}

Comments Section:
${comments}
    `.trim();

    return NextResponse.json({ comments: formattedOutput });
  } catch (error) {
    console.error("Error fetching YouTube comments:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Failed to fetch YouTube comments",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

async function fetchComments(videoId: string): Promise<string> {
  const response = await youtube.commentThreads.list({
    part: ["snippet"],
    videoId: videoId,
    maxResults: 200, // Adjust this number as needed
  });

  const comments =
    response.data.items
      ?.map((item) => item.snippet?.topLevelComment?.snippet?.textDisplay)
      .filter(Boolean)
      .join("\n\n") || "No comments found.";

  return comments;
}

async function fetchVideoDetails(videoId: string) {
  const response = await youtube.videos.list({
    part: ["snippet"],
    id: [videoId],
  });

  const videoDetails = response.data.items?.[0]?.snippet;
  if (!videoDetails) {
    throw new Error("Video details not found");
  }

  return {
    title: videoDetails.title,
    channelTitle: videoDetails.channelTitle,
    publishedAt: videoDetails.publishedAt,
  };
}
