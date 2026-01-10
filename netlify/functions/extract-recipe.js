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

const FIND_RECIPE_LINK_PROMPT = `Analyze this webpage content from a social media post that references a recipe.

Your task: Find the URL to the SPECIFIC recipe page (not a landing page, homepage, or index page).

GOOD recipe URLs look like:
- https://example.com/recipes/chicken-parmesan
- https://example.com/2024/01/pasta-recipe
- URLs containing the recipe name or dish name

BAD URLs to avoid:
- https://example.com/instagram (landing pages)
- https://example.com/recipes (index pages without specific recipe)
- https://example.com (homepages)
- Social media profile URLs

Look for:
1. Direct links to full recipe pages with specific dish names in the URL
2. URLs from recipe websites (allrecipes, foodnetwork, budgetbytes, seriouseats, etc.)
3. Blog post URLs that contain recipe keywords

Return ONLY a JSON object:
{"recipeUrl": "https://the-recipe-url.com/specific-recipe-name" }

If you cannot find a SPECIFIC recipe URL (only landing pages or no links), return:
{"recipeUrl": null}

Content:
`;

const EXTRACT_DISH_NAME_PROMPT = `From this social media post content, extract the name of the dish or recipe being shown.

Return ONLY a JSON object:
{"dishName": "the dish name", "websiteDomain": "example.com or null if not found"}

Examples:
- "This Tuscan chicken orzo is amazing! Link in bio @barleyandsage" -> {"dishName": "Tuscan chicken orzo", "websiteDomain": "barleyandsage.com"}
- "Made my famous chocolate cake today" -> {"dishName": "chocolate cake", "websiteDomain": null}

Content:
`;

// Check URL type
function getUrlType(url) {
  if (url.includes("youtube.com/watch") || url.includes("youtu.be/") || url.includes("youtube.com/shorts")) {
    return "youtube";
  }
  if (url.includes("instagram.com")) {
    return "instagram";
  }
  if (url.includes("tiktok.com")) {
    return "tiktok";
  }
  if (url.includes("pinterest.com") || url.includes("pin.it")) {
    return "pinterest";
  }
  return "website";
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
    return null;
  }
}

// Get YouTube video description and metadata from page
async function getYouTubePageContent(videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await response.text();
    let content = "";

    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
    if (playerResponseMatch) {
      try {
        const playerData = JSON.parse(playerResponseMatch[1]);
        const videoDetails = playerData?.videoDetails;
        if (videoDetails) {
          content += `Title: ${videoDetails.title || ""}\n`;
          content += `Description: ${videoDetails.shortDescription || ""}\n`;
        }
      } catch (e) {}
    }

    const descMeta = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (descMeta && !content.includes("Description:")) {
      content += `Description: ${descMeta[1]}\n`;
    }

    return content || null;
  } catch (error) {
    console.log("Page content error:", error.message);
    return null;
  }
}

// Fetch YouTube video info
async function getYouTubeVideoInfo(videoId) {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (response.ok) return await response.json();
  } catch (e) {}
  return null;
}

// Fetch Instagram content (try oEmbed and page scraping)
async function getInstagramContent(url) {
  console.log("Fetching Instagram content...");

  // Try oEmbed first
  try {
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      console.log("Got Instagram oEmbed data");
      return {
        content: `Title: ${data.title || ""}\nAuthor: ${data.author_name || ""}\nCaption: ${data.title || ""}`,
        thumbnail: data.thumbnail_url,
      };
    }
  } catch (e) {
    console.log("Instagram oEmbed failed:", e.message);
  }

  // Try direct page fetch with headers
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await response.text();

    // Extract from meta tags
    let content = "";
    const descMatch = html.match(/<meta\s+(?:property="og:description"|name="description")\s+content="([^"]+)"/i);
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    if (titleMatch) content += `Title: ${titleMatch[1]}\n`;
    if (descMatch) content += `Caption: ${descMatch[1]}\n`;

    // Try to find JSON data in the page
    const jsonMatch = html.match(/"caption":\s*\{"text":\s*"([^"]+)"/);
    if (jsonMatch) {
      content += `Full Caption: ${jsonMatch[1]}\n`;
    }

    // Look for any URLs in the content that might be recipe links
    const urlMatches = html.match(/https?:\/\/[^\s"<>]+/g) || [];
    const recipeUrls = urlMatches.filter(u =>
      u.includes("recipe") ||
      u.includes("allrecipes") ||
      u.includes("foodnetwork") ||
      u.includes("budgetbytes") ||
      u.includes("seriouseats") ||
      u.includes("bonappetit")
    );
    if (recipeUrls.length > 0) {
      content += `\nRecipe Links Found: ${recipeUrls.join(", ")}\n`;
    }

    console.log(`Got Instagram page content (${content.length} chars)`);
    return {
      content: content || null,
      thumbnail: imageMatch ? imageMatch[1] : null,
    };
  } catch (e) {
    console.log("Instagram page fetch failed:", e.message);
  }

  return { content: null, thumbnail: null };
}

// Fetch TikTok content
async function getTikTokContent(url) {
  console.log("Fetching TikTok content...");

  try {
    // Try oEmbed
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      console.log("Got TikTok oEmbed data");
      return {
        content: `Title: ${data.title || ""}\nAuthor: ${data.author_name || ""}`,
        thumbnail: data.thumbnail_url,
      };
    }
  } catch (e) {
    console.log("TikTok oEmbed failed:", e.message);
  }

  return { content: null, thumbnail: null };
}

// Fetch Pinterest content
async function getPinterestContent(url) {
  console.log("Fetching Pinterest content...");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await response.text();

    let content = "";
    const descMatch = html.match(/<meta\s+(?:property="og:description"|name="description")\s+content="([^"]+)"/i);
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    if (titleMatch) content += `Title: ${titleMatch[1]}\n`;
    if (descMatch) content += `Description: ${descMatch[1]}\n`;

    // Pinterest often has recipe links
    const urlMatches = html.match(/https?:\/\/[^\s"<>]+/g) || [];
    const recipeUrls = urlMatches.filter(u =>
      !u.includes("pinterest") &&
      (u.includes("recipe") || u.includes(".com/"))
    );
    if (recipeUrls.length > 0) {
      content += `\nLinked URLs: ${recipeUrls.slice(0, 5).join(", ")}\n`;
    }

    console.log(`Got Pinterest content (${content.length} chars)`);
    return {
      content: content || null,
      thumbnail: imageMatch ? imageMatch[1] : null,
    };
  } catch (e) {
    console.log("Pinterest fetch failed:", e.message);
  }

  return { content: null, thumbnail: null };
}

// Fetch regular webpage
async function fetchWebpage(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const html = await response.text();

  // Also extract all links for potential recipe page discovery
  const links = [];
  const linkMatches = html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]*)</gi);
  for (const match of linkMatches) {
    links.push({ url: match[1], text: match[2] });
  }

  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Extract image
  const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

  return {
    content: textContent,
    links,
    image: imageMatch ? imageMatch[1] : null,
  };
}

// Clean JSON response (remove markdown code blocks)
function cleanJsonResponse(text) {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  return cleaned;
}

// Ask AI to find recipe link in content
async function findRecipeLink(content) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: FIND_RECIPE_LINK_PROMPT + content.slice(0, 8000) }],
    });
    const cleaned = cleanJsonResponse(completion.choices[0].message.content);
    const result = JSON.parse(cleaned);
    return result.recipeUrl;
  } catch (e) {
    console.log("Could not find recipe link:", e.message);
    return null;
  }
}

// Extract dish name from social media content
async function extractDishInfo(content) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: EXTRACT_DISH_NAME_PROMPT + content.slice(0, 4000) }],
    });
    const cleaned = cleanJsonResponse(completion.choices[0].message.content);
    return JSON.parse(cleaned);
  } catch (e) {
    console.log("Could not extract dish name:", e.message);
    return { dishName: null, websiteDomain: null };
  }
}

// Search a website for a specific recipe
async function searchWebsiteForRecipe(domain, dishName) {
  console.log(`Searching ${domain} for "${dishName}"...`);
  try {
    // Try common search URL patterns
    const searchUrls = [
      `https://${domain}/?s=${encodeURIComponent(dishName)}`,
      `https://www.${domain}/?s=${encodeURIComponent(dishName)}`,
      `https://${domain}/search?q=${encodeURIComponent(dishName)}`,
    ];

    // Helper to check if URL is a valid recipe page (not an image/asset)
    const isValidRecipeUrl = (url) => {
      const lower = url.toLowerCase();
      // Reject image and asset URLs
      if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|css|js|woff|ttf)(\?|$)/)) return false;
      if (lower.includes('/wp-content/uploads/')) return false;
      if (lower.includes('/assets/')) return false;
      if (lower.includes('/images/')) return false;
      // Should look like a page URL
      return true;
    };

    for (const searchUrl of searchUrls) {
      try {
        const response = await fetch(searchUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "en-US,en;q=0.9",
          },
        });

        if (!response.ok) continue;

        const html = await response.text();

        // Look for recipe URLs in search results - find <a href="..."> links
        const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
        const dishWords = dishName.toLowerCase().split(' ').filter(w => w.length > 3);
        let match;

        while ((match = linkPattern.exec(html)) !== null) {
          const url = match[1];
          if (!url.includes(domain.replace('www.', ''))) continue;
          if (!isValidRecipeUrl(url)) continue;

          const urlLower = url.toLowerCase();
          // Check if URL contains key words from the dish name
          const matchCount = dishWords.filter(word => urlLower.includes(word)).length;
          if (matchCount >= 2) {
            const cleanUrl = url.startsWith('http') ? url : `https://${domain}${url}`;
            console.log(`Found recipe via search: ${cleanUrl}`);
            return cleanUrl.replace(/["'<>]/g, '');
          }
        }
      } catch (e) {
        continue;
      }
    }
  } catch (e) {
    console.log("Website search failed:", e.message);
  }
  return null;
}

async function extractWithOpenAI(textContent, isVideo = false) {
  const prompt = isVideo
    ? `This is a transcript from a cooking video. ${RECIPE_PROMPT}`
    : RECIPE_PROMPT;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt + textContent }],
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
    messages: [{ role: "user", content: prompt + textContent }],
  });
  return message.content[0].text.trim();
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { url } = JSON.parse(event.body);
    if (!url) {
      return { statusCode: 400, body: JSON.stringify({ error: "URL is required" }) };
    }

    const urlType = getUrlType(url);
    console.log(`Processing ${urlType} URL: ${url}`);

    let textContent = "";
    let isVideo = false;
    let thumbnail = null;

    // Handle different URL types
    if (urlType === "youtube") {
      isVideo = true;
      const videoId = getYouTubeVideoId(url);
      if (!videoId) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid YouTube URL" }) };
      }

      const videoInfo = await getYouTubeVideoInfo(videoId);
      thumbnail = videoInfo?.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      let transcript = await getYouTubeTranscript(videoId);
      if (transcript) {
        textContent = transcript.slice(0, 15000);
        console.log(`Got transcript (${textContent.length} chars)`);
      } else {
        const pageContent = await getYouTubePageContent(videoId);
        if (pageContent) {
          textContent = pageContent.slice(0, 15000);
          console.log(`Got page content (${textContent.length} chars)`);
        }
      }
    } else if (urlType === "instagram") {
      const igData = await getInstagramContent(url);
      textContent = igData.content || "";
      thumbnail = igData.thumbnail;
    } else if (urlType === "tiktok") {
      const ttData = await getTikTokContent(url);
      textContent = ttData.content || "";
      thumbnail = ttData.thumbnail;
    } else if (urlType === "pinterest") {
      const pinData = await getPinterestContent(url);
      textContent = pinData.content || "";
      thumbnail = pinData.thumbnail;
    } else {
      const webData = await fetchWebpage(url);
      textContent = webData.content.slice(0, 15000);
      thumbnail = webData.image;
    }

    if (!textContent || textContent.length < 50) {
      const platformMessages = {
        instagram: "Instagram requires login to view full content. Try pasting the recipe URL from the post's caption or bio link instead.",
        tiktok: "TikTok content couldn't be accessed. Try pasting the recipe URL from the video description instead.",
      };
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: platformMessages[urlType] || "Could not extract content from this URL. The platform may be blocking access."
        }),
      };
    }

    // First attempt: Try to extract recipe
    console.log("Trying to extract recipe...");
    let recipeText;
    try {
      recipeText = await extractWithOpenAI(textContent, isVideo);
    } catch (openaiError) {
      console.log("OpenAI failed, trying Claude...");
      try {
        recipeText = await extractWithClaude(textContent, isVideo);
      } catch (claudeError) {
        throw new Error("Both AI services failed");
      }
    }

    let recipeData;
    try {
      const cleanedText = cleanJsonResponse(recipeText);
      recipeData = JSON.parse(cleanedText);
    } catch (e) {
      const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse recipe data");
      }
    }

    // If no recipe found, try to find a recipe link and follow it
    if (recipeData.error === "No recipe found") {
      console.log("No recipe found, looking for recipe links...");
      let recipeUrl = await findRecipeLink(textContent);

      // If no direct link found, try to extract dish name and search for it
      if (!recipeUrl && (urlType === "instagram" || urlType === "tiktok" || urlType === "pinterest")) {
        console.log("No direct link, trying to extract dish name and search...");
        const dishInfo = await extractDishInfo(textContent);

        if (dishInfo.dishName) {
          console.log(`Extracted dish: "${dishInfo.dishName}", website: ${dishInfo.websiteDomain || "unknown"}`);

          // Try to find the website domain from content if not extracted
          let domain = dishInfo.websiteDomain;
          if (!domain) {
            // Look for common recipe website mentions
            const domainMatch = textContent.match(/(?:@|link in bio[^a-z]*)?([a-z]+(?:andsage|recipes|kitchen|cooking|eats|food)[a-z]*)/i);
            if (domainMatch) {
              domain = domainMatch[1].toLowerCase() + ".com";
            }
          }

          if (domain) {
            recipeUrl = await searchWebsiteForRecipe(domain, dishInfo.dishName);
          }
        }
      }

      if (recipeUrl && recipeUrl !== url) {
        console.log(`Found recipe link: ${recipeUrl}, following...`);

        // Fetch the recipe page
        const webData = await fetchWebpage(recipeUrl);
        const recipePageContent = webData.content.slice(0, 15000);

        // Try to extract from the recipe page
        try {
          recipeText = await extractWithOpenAI(recipePageContent, false);
          const cleanedLinkedText = cleanJsonResponse(recipeText);
          const linkedRecipeData = JSON.parse(cleanedLinkedText);

          // Only use the linked data if it's actually a recipe (not an error)
          if (!linkedRecipeData.error) {
            recipeData = linkedRecipeData;

            // Add the original source and the recipe page link
            recipeData.relatedLinks = [{ title: "Full Recipe", url: recipeUrl }];

            // Keep the original social media thumbnail (the enticing cover shot)
            // Only use recipe page image if we don't have one
            if (!thumbnail && webData.image) {
              thumbnail = webData.image;
            }

            console.log("Successfully extracted recipe from linked page!");
          } else {
            console.log("Linked page also had no recipe");
          }
        } catch (e) {
          console.log("Could not extract from linked page:", e.message);
        }
      }
    }

    if (recipeData.error) {
      // Provide helpful error messages based on platform
      let errorMessage = recipeData.error;
      if (urlType === "instagram") {
        errorMessage = "Could not extract recipe from this Instagram post. Instagram limits what we can access. Try copying the recipe link from the post's caption or bio and pasting that directly.";
      } else if (urlType === "tiktok") {
        errorMessage = "Could not extract recipe from this TikTok video. Try copying the recipe link from the video description and pasting that directly.";
      }
      return { statusCode: 400, body: JSON.stringify({ error: errorMessage }) };
    }

    // Add metadata
    recipeData.id = Date.now();
    recipeData.sourceUrl = url;
    recipeData.image = thumbnail || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipeData),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to extract recipe", details: error.message }),
    };
  }
}
