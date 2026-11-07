const trim = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

function parseModels(envVar, fallback) {
  return trim(process.env[envVar], fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function providerChain({ vision = false } = {}) {
  const chain = [];

  const add = (provider, model, baseUrl, apiKey, extra = {}) => {
    if (!apiKey || !model) return;
    chain.push({
      provider,
      model,
      baseUrl: String(baseUrl).replace(/\/+$/, ''),
      apiKey,
      vision: Boolean(extra.vision),
      minTokens: extra.minTokens || 0,
      reasoning: extra.reasoning || '',
      headers: extra.headers || {},
    });
  };

  const geminiKeys = parseModels('GEMINI_API_KEY', '');
  const geminiModels = parseModels('GEMINI_MODELS', 'gemini-3.1-flash-lite,gemini-3-flash-preview,gemini-3.5-flash');
  for (const model of geminiModels) {
    for (const apiKey of geminiKeys) {
      add('google', model, trim(process.env.GEMINI_BASE_URL, 'https://generativelanguage.googleapis.com/v1beta/openai'), apiKey, {
        vision: true,
        minTokens: 16384,
        reasoning: 'low',
      });
    }
  }

  for (const model of parseModels('UNOROUTER_MODELS', 'claude-sonnet-4.5')) {
    add('unorouter', model, trim(process.env.UNOROUTER_BASE_URL, 'https://api.unorouter.com/v1'), process.env.UNOROUTER_API_KEY, {
      vision: true,
    });
  }

  for (const model of parseModels('OPENROUTER_MODELS', 'nvidia/nemotron-3.5-lightning:free')) {
    add('openrouter', model, trim(process.env.OPENROUTER_BASE_URL, 'https://openrouter.ai/api/v1'), process.env.OPENROUTER_API_KEY, {
      vision: false,
      minTokens: 2000,
      headers: { 'HTTP-Referer': 'https://kefmaxxing.vercel.app', 'X-Title': 'kefmaxxing' },
    });
  }

  return vision ? chain.filter((entry) => entry.vision) : chain;
}
