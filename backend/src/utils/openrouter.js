import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;
const REQUEST_TIMEOUT_MS = 45000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isAiConfigured = () => Boolean(process.env.OPENROUTER_API_KEY);

export const getAiModel = () => process.env.AI_MODEL || 'inclusionai/ling-3.0-flash-sante:free';

/**
 * Send a chat completion request to OpenRouter.
 * @param {object} options
 * @param {string} options.system - System prompt
 * @param {Array<{role: 'user'|'assistant', content: string}>} options.messages - Conversation messages
 * @param {number} [options.maxTokens] - Max output tokens
 * @returns {Promise<string>} The assistant reply
 * @throws {Error} On failure (typed friendly messages for 402/429)
 */
export async function queryOpenRouter({ system, messages, maxTokens = 600 }) {
  if (!isAiConfigured()) {
    throw new Error('AI assistant is not configured. Set OPENROUTER_API_KEY in backend/.env.');
  }

  const body = {
    model: getAiModel(),
    messages: [{ role: 'system', content: system }, ...messages],
    temperature: 0.5,
    max_tokens: maxTokens,
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
          'X-Title': 'EmerCare',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('AI assistant timed out. Please try again.');
      }
      throw new Error('Could not reach the AI assistant. Please try again.');
    } finally {
      clearTimeout(timeout);
    }

    // Free providers are heavily rate-limited: retry with backoff on 429.
    if (response.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = parseInt(response.headers.get('retry-after') || '0', 10);
      const waitMs =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : BASE_DELAY_MS * attempt;
      await sleep(waitMs);
      continue;
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      const hint = detail ? ` (${detail.slice(0, 200)})` : '';
      if (response.status === 402) {
        throw new Error('AI assistant has no credits. Please add credits to your OpenRouter balance.');
      }
      if (response.status === 429) {
        throw new Error('AI assistant is rate-limited right now. Please try again in a moment.');
      }
      throw new Error(`AI assistant request failed (${response.status})${hint}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }

  throw new Error('AI assistant is rate-limited right now. Please try again in a moment.');
}