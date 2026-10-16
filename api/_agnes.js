const DEFAULT_MODELS = ['agnes-3.0-flash'];

const ALLOWED_MODELS = (process.env.RATE_MODELS || DEFAULT_MODELS.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const BASE_URL = (process.env.RATE_BASE_URL || 'https://apihub.agnes-ai.com/v1').replace(/\/+$/, '');

const PER_MODEL_TIMEOUT_MS = 25000;

async function callModel(model, messages, { maxTokens, temperature }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PER_MODEL_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RATE_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        stream: false,
        max_tokens: maxTokens,
        temperature,
        messages,
      }),
      signal: controller.signal,
    });

    const text = await upstream.text();
    if (!upstream.ok) return { ok: false, status: upstream.status, text };

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, status: 502, text: 'unparseable upstream response' };
    }

    const content = parsed?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      return { ok: false, status: 502, text: 'empty completion' };
    }

    return { ok: true, status: 200, text: content.trim(), model };
  } catch (err) {
    return { ok: false, status: 0, text: err && err.message ? err.message : 'network error' };
  } finally {
    clearTimeout(timer);
  }
}

export async function callAgnes(messages, options = {}) {
  const { maxTokens = 500, temperature = 0.6, attempts = 2 } = options;
  const log = [];

  for (const model of ALLOWED_MODELS) {
    for (let i = 0; i < attempts; i++) {
      const result = await callModel(model, messages, { maxTokens, temperature });
      if (result.ok) return { ...result, attempts: log };

      log.push({ model, attempt: i, status: result.status, message: String(result.text).slice(0, 160) });

      const retryable = result.status === 0 || result.status === 429 || result.status >= 500;
      if (!retryable) break;
      await new Promise((resolve) => setTimeout(resolve, 600 * (i + 1)));
    }
  }

  return { ok: false, status: 502, text: 'all models failed', attempts: log };
}
