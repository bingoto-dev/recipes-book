import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const { url, manualText, manualTitle } = body;

    if (manualText) {
      return await handleManualText(manualText, manualTitle);
    }
    if (url) {
      return await handleUrl(url);
    }

    return json({ error: 'Provide a URL or paste text' }, 400);
  } catch (err) {
    console.error('extract-article error:', err);
    return json({ error: err.message || 'Internal server error' }, 500);
  }
}

// ── Manual text paste ───────────────────────────────────────────

async function handleManualText(text, title) {
  const trimmed = text.substring(0, 60000);

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `Clean up and format this pasted article text for a beautiful reading experience.

Return a JSON object with these exact fields:
- "title": string — use "${title || ''}" if non-empty, otherwise infer from content
- "author": string or null — author if detectable
- "source": string or null — publication/source if detectable
- "content": string — the article formatted as clean HTML using ONLY these tags: p, h2, h3, blockquote, ul, ol, li, em, strong, hr. No images, no links, no classes, no inline styles. Just clean semantic HTML. Preserve all the content.
- "excerpt": string — first 2-3 sentences as plain text

Return ONLY valid JSON. No markdown fences.

Text:
${trimmed}`,
    }],
  });

  const result = JSON.parse(msg.content[0].text);
  const wordCount = countWords(result.content);

  return json({
    ...result,
    id: generateId(),
    savedAt: new Date().toISOString(),
    readingTime: Math.max(1, Math.round(wordCount / 238)),
    wordCount,
    url: null,
  });
}

// ── URL extraction ──────────────────────────────────────────────

async function handleUrl(url) {
  let html;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    const isTwitter = url.includes('twitter.com') || url.includes('x.com');
    const hint = isTwitter
      ? 'Twitter/X blocks automated fetching. Copy the thread text and use "Paste Text" instead.'
      : `Could not fetch this URL (${err.message}). Try using "Paste Text" instead.`;
    return json({ error: hint }, 422);
  }

  const trimmedHtml = html.substring(0, 120000);

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `Extract the main article content from this webpage HTML. Ignore navigation, ads, sidebars, footers, comments, related articles, and other non-article content.

Return a JSON object with these exact fields:
- "title": string — the article title
- "author": string or null — author name if found
- "source": string — the website or publication name
- "publishedDate": string or null — ISO date if found
- "content": string — the FULL article text formatted as clean HTML using ONLY these tags: p, h2, h3, blockquote, ul, ol, li, em, strong, hr. No images, no links, no classes, no inline styles. Preserve ALL article text — do not summarize or truncate.
- "excerpt": string — first 2-3 sentences as plain text

Return ONLY valid JSON. No markdown fences.

URL: ${url}

HTML:
${trimmedHtml}`,
    }],
  });

  const result = JSON.parse(msg.content[0].text);
  const wordCount = countWords(result.content);

  return json({
    ...result,
    id: generateId(),
    savedAt: new Date().toISOString(),
    readingTime: Math.max(1, Math.round(wordCount / 238)),
    wordCount,
    url,
  });
}

// ── Helpers ─────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function countWords(html) {
  return html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
