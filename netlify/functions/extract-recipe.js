import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const RECIPE_PROMPT = `Extract the recipe from this webpage content and return it as valid JSON only (no markdown, no code blocks, just raw JSON).

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
If the page doesn't contain a recipe, return: {"error": "No recipe found"}

Webpage content:
`;

async function extractWithOpenAI(textContent) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: RECIPE_PROMPT + textContent,
      },
    ],
  });
  return completion.choices[0].message.content.trim();
}

async function extractWithClaude(textContent) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: RECIPE_PROMPT + textContent,
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

    // Fetch the webpage content
    const response = await fetch(url);
    const html = await response.text();

    // Extract text content (strip HTML tags for cleaner input)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 15000); // Limit content size

    // Try OpenAI first, fall back to Claude
    let recipeText;
    try {
      console.log("Trying OpenAI...");
      recipeText = await extractWithOpenAI(textContent);
    } catch (openaiError) {
      console.log("OpenAI failed, trying Claude...", openaiError.message);
      try {
        recipeText = await extractWithClaude(textContent);
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
    recipeData.image = `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop`; // Default image

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
