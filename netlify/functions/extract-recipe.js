import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { YoutubeTranscript } from "youtube-transcript";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const RECIPE_PROMPT = `Extract the recipe from this content and return it as valid JSON only (no markdown, no code blocks, just raw JSON).

The JSON must have this exact structure:
{
  "title": "Recipe Name",
  "description": "Brief 1-2 sentence description",
  "prepTime": "X min",
  "cookTime": "X min",
  "servings": 4,
  "difficulty": "Easy" or "Medium" or "Hard",
  "cuisine": "Type of cuisine",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["Step 1...", "Step 2...", ...],
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fat": 15,
    "fiber": 5,
    "sugar": 8,
    "sodium": 450
  },
  "tags": ["tag1", "tag2", "tag3"]
}

If you can't find exact nutrition info, make reasonable estimates based on ingredients.
If the content doesn't contain a recipe, return: {"error": "No recipe found"}

Content:
`;

// Check if URL is a YouTube video
function isYouTubeUrl(url) {
  return (
    url.includes("youtube.com/watch") ||
    url.includes("youtu.be/") ||
    url.includes("youtube.com/shorts")
  );
}

// Extract video ID from YouTube URL
function getYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch YouTube transcript
async function getYouTubeTranscript(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map((item) => item.text).join(" ");
  } catch (error) {
    console.log("Transcript error:", error.message);
    return null; // Return null instead of throwing - we'll try fallback
  }
}

// Fallback: Get YouTube video description and metadata from page
async function getYouTubePageContent(videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await response.text();

    let content = "";

    // Try to extract from ytInitialPlayerResponse JSON
    const playerResponseMatch = html.match(
      /ytInitialPlayerResponse\s*=\s*(\{.+?\});/s
    );
    if (playerResponseMatch) {
      try {
        const playerData = JSON.parse(playerResponseMatch[1]);
        const videoDetails = playerData?.videoDetails;
        if (videoDetails) {
          content += `Title: ${videoDetails.title || ""}\n`;
          content += `Description: ${videoDetails.shortDescription || ""}\n`;
          content += `Channel: ${videoDetails.author || ""}\n`;
        }
      } catch (e) {
        console.log("Could not parse player response");
      }
    }

    // Try ytInitialData for more details
    const initialDataMatch = html.match(/ytInitialData\s*=\s*(\{.+?\});/s);
    if (initialDataMatch) {
      try {
        const initialData = JSON.parse(initialDataMatch[1]);
        // Try to find description in engagement panels
        const panels =
          initialData?.engagementPanels || [];
        for (const panel of panels) {
          const content_panel =
            panel?.engagementPanelSectionListRenderer?.content
              ?.structuredDescriptionContentRenderer?.items;
          if (content_panel) {
            for (const item of content_panel) {
              if (item?.expandableVideoDescriptionBodyRenderer?.attributedDescriptionBodyText?.content) {
                content += `\nFull Description: ${item.expandableVideoDescriptionBodyRenderer.attributedDescriptionBodyText.content}\n`;
              }
            }
          }
        }
      } catch (e) {
        console.log("Could not parse initial data");
      }
    }

    // Fallback: Extract from meta tags
    const descMeta = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (descMeta && !content.includes("Description:")) {
      content += `Description: ${descMeta[1]}\n`;
    }

    const titleMeta = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (titleMeta && !content.includes("Title:")) {
      content = `Title: ${titleMeta[1]}\n` + content;
    }

    console.log(`Extracted YouTube content preview: ${content.slice(0, 200)}...`);
    return content || null;
  } catch (error) {
    console.log("Page content error:", error.message);
    return null;
  }
}

// Fetch YouTube video title
async function getYouTubeVideoInfo(videoId) {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log("Could not fetch video info");
  }
  return null;
}

async function extractWithOpenAI(textContent, isVideo = false) {
  const prompt = isVideo
    ? `This is a transcript from a cooking video. ${RECIPE_PROMPT}`
    : RECIPE_PROMPT;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt + textContent,
      },
    ],
  });
  return completion.choices[0].message.content.trim();
}

async function extractWithClaude(textContent, isVideo = false) {
  const prompt = isVideo
    ? `This is a transcript from a cooking video. ${RECIPE_PROMPT}`
    : RECIPE_PROMPT;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt + textContent,
      },
    ],
  });
  return message.content[0].text.trim();
}

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { url } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "URL is required" }),
      };
    }

    let textContent;
    let isVideo = false;
    let videoInfo = null;

    // Check if it's a YouTube video
    if (isYouTubeUrl(url)) {
      console.log("Detected YouTube video, fetching transcript...");
      isVideo = true;

      const videoId = getYouTubeVideoId(url);
      if (!videoId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid YouTube URL" }),
        };
      }

      // Get video info and try transcript first
      videoInfo = await getYouTubeVideoInfo(videoId);
      let transcript = await getYouTubeTranscript(videoId);

      if (transcript) {
        textContent = transcript.slice(0, 15000);
        console.log(
          `Got transcript (${textContent.length} chars) for: ${videoInfo?.title || videoId}`
        );
      } else {
        // Fallback to page content if transcript not available
        console.log("Transcript not available, trying page content fallback...");
        const pageContent = await getYouTubePageContent(videoId);
        if (pageContent) {
          textContent = pageContent.slice(0, 15000);
          console.log(`Got page content (${textContent.length} chars)`);
        } else {
          return {
            statusCode: 400,
            body: JSON.stringify({
              error: "Could not extract content from this video. Try a video with captions or a recipe in the description.",
            }),
          };
        }
      }
    } else {
      // Regular webpage - fetch HTML
      const response = await fetch(url);
      const html = await response.text();

      // Extract text content (strip HTML tags for cleaner input)
      textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 15000);
    }

    // Try OpenAI first, fall back to Claude
    let recipeText;
    try {
      console.log("Trying OpenAI...");
      recipeText = await extractWithOpenAI(textContent, isVideo);
    } catch (openaiError) {
      console.log("OpenAI failed, trying Claude...", openaiError.message);
      try {
        recipeText = await extractWithClaude(textContent, isVideo);
      } catch (claudeError) {
        console.log("Claude also failed:", claudeError.message);
        throw new Error("Both AI services failed: " + openaiError.message);
      }
    }

    // Parse the response
    let recipeData;
    try {
      recipeData = JSON.parse(recipeText);
    } catch (e) {
      // Try to extract JSON from the response if it's wrapped in something
      const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse recipe data");
      }
    }

    if (recipeData.error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: recipeData.error }),
      };
    }

    // Add metadata
    recipeData.id = Date.now();
    recipeData.sourceUrl = url;
    recipeData.image = `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop`;

    // If it's a YouTube video, use thumbnail as image
    if (isVideo && videoInfo) {
      recipeData.image =
        videoInfo.thumbnail_url ||
        `https://img.youtube.com/vi/${getYouTubeVideoId(url)}/maxresdefault.jpg`;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipeData),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to extract recipe",
        details: error.message,
      }),
    };
  }
}
