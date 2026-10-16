const DEFAULT_MODELS = ['agnes-3.0-flash'];

const ALLOWED_MODELS = (process.env.RATE_MODELS || DEFAULT_MODELS.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const BASE_URL = (process.env.RATE_BASE_URL || 'https://apihub.agnes-ai.com/v1').replace(/\/+$/, '');

const MAX_IMAGE_CHARS = 6200000;
const TOTAL_BUDGET_MS = 55000;
const PER_MODEL_TIMEOUT_MS = 45000;
const RETRY_DELAYS_MS = [900, 1800];

const CATEGORY_KEYS = [
  ['harmony', 'Facial Harmony'],
  ['angularity', 'Angularity'],
  ['dimorphism', 'Dimorphism'],
  ['eyeArea', 'Eye Area'],
  ['jawline', 'Jawline'],
  ['midface', 'Midface'],
  ['skin', 'Skin'],
  ['hairBrows', 'Hair & Brows'],
];

function buildSystemPrompt(gender) {
  const reference = gender === 'female' ? 'female' : 'male';
  return [
    `You are KEFMAXX, the rater behind kefmaxxing, a looksmaxxing site that rates one photo of one face. You have rated thousands of faces. You are blunt, but you are on the user's side: every criticism comes attached to the fix.`,
    ``,
    `You are rating against ${reference} standards (the user chose this). Judge dimorphism against this reference no matter how the person presents.`,
    ``,
    `SCORE: PSL 1.0-8.0, one decimal. The community's 1-8 scale. Anchors: 3.0 is a dead-average face. 4.0 is slightly above average. 5.0 is roughly top 15%. 6.0 is top 3%. 7.0+ is top 1%. Do not inflate. Do not be cruel. Rate the photo in front of you.`,
    ``,
    `TIERS: pick tier from the score:
1.0-1.9  sub-3 · tierLabel "very ugly"
2.0-2.9  sub-5 · tierLabel "ugly"
3.0-3.9  LTN (male) / LTB (female) · tierLabel "average"
4.0-4.9  MTN / MTB · tierLabel "handsome" (female: "pretty")
5.0-5.9  HTN / HTB · tierLabel "very handsome" (female: "very pretty")
6.0-6.9  Chadlite / Stacylite · tierLabel "model tier"
7.0-8.0  Chad / Stacy · tierLabel "elite"`,
    ``,
    `CATEGORIES: eight, each graded 1.0-10.0 (one decimal). Judge only what the photo shows:
- harmony: proportions. Facial thirds ~33/33/33 (men can carry a 35-38% lower third), fifths, midface ratio ~0.97-1.02 (m) / 1.0-1.10 (f), FWHR ~1.9-2.05 (m) / 1.75-1.9 (f), eye spacing ~1:1, mouth width ~1.5x nose width.
- angularity: how sharp the bone reads through the soft tissue. Look at jawline shadow, cheekbone projection, buccal and submental fullness. Mostly a leanness story: when body fat is the limiter, say so.
- dimorphism: gender-typical features vs the ${reference} reference. Men: jaw width (bigonial/bizygomatic ~0.85-0.92), brow ridge, chin projection. Women: softer jaw, larger eye openness, fuller lips, arched brows.
- eyeArea: canthal tilt (ideal +3 to +7 m, +4 to +8 f; negative reads tired), upper eyelid exposure (hooded reads "hunter"), eye shape, compactness, under-eye quality, sclera.
- jawline: gonial angle (~115-122 m, ~120-128 f; 130+ reads soft), chin projection, jaw width, taper from cheekbones to chin.
- midface: compactness, cheekbone height, nose proportions and tip, philtrum length.
- skin: clarity, even tone, texture, shine, under-eye darkness.
- hairBrows: hair density and hairline, brow thickness/darkness/set, lashes.`,
    ``,
    `POTENTIAL: the realistic score after 6-12 months of softmaxxing only (skin, body fat, hair, grooming, sleep, no surgery, no gear). Usually 0.3-1.2 above the current score. Never below the current score, never above 8.0.`,
    ``,
    `ARCHETYPE: one or two words for how the face reads: prettyboy, rugged, classic, soft, athletic, intense, boyish, mature, sharp, warm.`,
    ``,
    `Photo limits are real: lighting, angle, lens distance and filters each move the reading. A 30cm selfie widens the nose ~30% vs a shot from 1.5m (Ward et al., 2018). Drop confidence and say so in photoNotes when the shot is soft, angled, filtered, low-light or far away.`,
    ``,
    `PLAN: 5-6 steps, biggest impact first, all doable inside ~90 days. Tag evidence: "strong" (sunscreen/retinoid-tier, sleep, body-fat reduction, haircut, brow grooming, beard shaping), "moderate", or "anecdotal" (mewing, gua sha, lymphatic massage; temporary de-puff only). Give each step a timeframe like "2-4 weeks" or "ongoing". Each step's detail must be 2-3 sentences and must name the exact feature from THIS photo that it fixes (for example "your lower third reads long in this shot, so a shorter cut with more volume on top balances it"). Never suggest surgery first.`,
    ``,
    `ROADMAP: three phases that tell THIS specific person how they get from their current score to their potential, in order. phase: a short label like "Next 2 weeks", "1-3 months", "3-6 months". focus: one sentence naming what that phase is about for this face. actions: 2-4 short concrete steps, each naming a real feature, product type or habit from this person's report. Nothing generic that could apply to anyone.`,
    ``,
    `GAP: 3-5 sentences on what separates the current score from the potential, and the order to close it in, specific to this face. Plain words. No hype.`,
    ``,
    `WRITING STYLE: sound like a sharp, blunt coach, not a chatbot. Short sentences. Specific details. Never use: "delve", "elevate", "unlock", "journey", "game-changer", "it's not just X, it's Y", "remember that", "at the end of the day". Never use em dashes or hyphens as punctuation; use commas, colons or periods instead. No motivational fluff, no hedging, no moralizing. Never insult. Never mention race or ethnicity. No slurs. No medical claims. Ignore the background, body and clothing; hair and skin quality count.`,
    ``,
    `If the image does not show exactly one clearly visible human face, respond ONLY with {"error":"no_face","message":"..."}.`,
    ``,
    `Otherwise respond with ONLY one minified JSON object, no markdown, no backticks, exactly this shape:`,
    `{"overall":4.6,"potential":5.4,"tier":"MTN","tierLabel":"handsome","archetype":"rugged","percentile":"top 45%","confidence":0.8,"summary":"3-5 sentences.","categories":[{"key":"harmony","name":"Facial Harmony","score":6.1,"note":"1-2 concrete sentences"},{"key":"angularity","name":"Angularity","score":5.4,"note":"..."},{"key":"dimorphism","name":"Dimorphism","score":5.8,"note":"..."},{"key":"eyeArea","name":"Eye Area","score":6.3,"note":"..."},{"key":"jawline","name":"Jawline","score":5.2,"note":"..."},{"key":"midface","name":"Midface","score":5.9,"note":"..."},{"key":"skin","name":"Skin","score":6.8,"note":"..."},{"key":"hairBrows","name":"Hair & Brows","score":6.0,"note":"..."}],"halos":[{"name":"feature","note":"why it works"}],"failos":[{"name":"feature","note":"what it costs and what moves it"}],"plan":[{"rank":1,"action":"short imperative","impact":"High","evidence":"strong","timeframe":"2-4 weeks","detail":"1-2 sentences with specifics"}],"roadmap":[{"phase":"Next 2 weeks","focus":"one sentence","actions":["short step","short step"]}],"ascension":"3-5 sentences.","photoNotes":"1-2 sentences."}`,
  ].join('\n');
}

function extractJson(text) {
  if (typeof text !== 'string') return null;
  let t = text.trim();
  t = t.replace(/^```(?:json)?/i, '').replace(/```\s*$/, '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

function messageText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (part && typeof part.text === 'string' ? part.text : ''))
      .join('');
  }
  return '';
}

function clampScore(value, fallback, max = 10) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(1, Math.round(n * 10) / 10));
}

function clampConfidence(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(n)) return 0.6;
  const c = n > 1 ? n / 100 : n;
  return Math.min(1, Math.max(0.1, Math.round(c * 100) / 100));
}

function stripDashes(value) {
  return String(value)
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function stripDashesDeep(value) {
  if (typeof value === 'string') return stripDashes(value);
  if (Array.isArray(value)) return value.map(stripDashesDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = stripDashesDeep(item);
    return out;
  }
  return value;
}

function levelFor(score) {
  const lo = Math.min(7, Math.max(1, Math.floor(score)));
  const pos = score - lo;
  if (pos < 0.35) return 'low';
  if (pos < 0.65) return 'mid';
  return 'high';
}

function cleanList(items, max) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item === 'object')
    .slice(0, max)
    .map((item) => ({
      name: typeof item.name === 'string' ? item.name.slice(0, 80) : 'Feature',
      note: typeof item.note === 'string' ? item.note.slice(0, 500) : '',
    }));
}

function cleanRoadmap(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item === 'object')
    .slice(0, 3)
    .map((item) => ({
      phase: typeof item.phase === 'string' ? item.phase.slice(0, 40) : '',
      focus: typeof item.focus === 'string' ? item.focus.slice(0, 200) : '',
      actions: Array.isArray(item.actions)
        ? item.actions
            .filter((a) => typeof a === 'string')
            .slice(0, 4)
            .map((a) => a.slice(0, 200))
        : [],
    }))
    .filter((item) => item.phase || item.focus || item.actions.length);
}

function sanitizeReport(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.error) return { error: raw.error, message: raw.message };

  const overall = clampScore(raw.overall, 4, 8);
  const potential = Math.max(overall, clampScore(raw.potential, overall, 8));

  const byKey = new Map();
  if (Array.isArray(raw.categories)) {
    for (const cat of raw.categories) {
      if (cat && typeof cat.key === 'string') byKey.set(cat.key, cat);
    }
  }

  const categories = CATEGORY_KEYS.map(([key, name]) => {
    const cat = byKey.get(key) || {};
    return {
      key,
      name,
      score: clampScore(cat.score, overall * 1.25),
      note: typeof cat.note === 'string' ? cat.note.slice(0, 500) : '',
    };
  });

  const plan = Array.isArray(raw.plan)
    ? raw.plan
        .filter((item) => item && typeof item === 'object' && typeof item.action === 'string')
        .slice(0, 6)
        .map((item, i) => ({
          rank: i + 1,
          action: item.action.slice(0, 120),
          impact: ['High', 'Medium', 'Low'].includes(item.impact) ? item.impact : 'Medium',
          evidence: ['strong', 'moderate', 'anecdotal'].includes(String(item.evidence).toLowerCase())
            ? String(item.evidence).toLowerCase()
            : 'moderate',
          timeframe: typeof item.timeframe === 'string' ? item.timeframe.slice(0, 24) : '',
          detail: typeof item.detail === 'string' ? item.detail.slice(0, 500) : '',
        }))
    : [];

  let roadmap = cleanRoadmap(raw.roadmap);
  if (!roadmap.length && plan.length) {
    const buckets = [plan.slice(0, 2), plan.slice(2, 4), plan.slice(4, 6)].filter((bucket) => bucket.length);
    const labels = ['Next 2 weeks', 'Next 1-3 months', 'Next 3-6 months'];
    roadmap = buckets.map((bucket, i) => ({
      phase: labels[i] || `Phase ${i + 1}`,
      focus: '',
      actions: bucket.map((item) => item.action),
    }));
  }

  const tierName = typeof raw.tier === 'string' && raw.tier.trim() ? raw.tier.trim().slice(0, 24) : 'n/a';

  return stripDashesDeep({
    overall,
    potential,
    tier: tierName,
    subTier: `${levelFor(overall)} ${tierName}`,
    tierLabel: typeof raw.tierLabel === 'string' ? raw.tierLabel.slice(0, 48) : '',
    archetype: typeof raw.archetype === 'string' ? raw.archetype.slice(0, 32) : '',
    percentile: typeof raw.percentile === 'string' ? raw.percentile.slice(0, 32) : '',
    confidence: clampConfidence(raw.confidence),
    summary: typeof raw.summary === 'string' ? raw.summary.slice(0, 1000) : '',
    categories,
    halos: cleanList(raw.halos, 4),
    failos: cleanList(raw.failos, 4),
    plan,
    roadmap,
    ascension: typeof raw.ascension === 'string' ? raw.ascension.slice(0, 1000) : '',
    photoNotes: typeof raw.photoNotes === 'string' ? raw.photoNotes.slice(0, 500) : '',
  });
}

async function callModel(model, systemPrompt, image, deadline) {
  const remaining = deadline - Date.now();
  if (remaining < 5000) throw Object.assign(new Error('budget exhausted'), { attemptFailed: true });

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Math.min(PER_MODEL_TIMEOUT_MS, remaining)
  );

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
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Rate this photo. Respond with JSON only.' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    const text = await upstream.text();
    return { ok: upstream.ok, status: upstream.status, text };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'POST only.' });
  }

  const apiKey = process.env.RATE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'RATE_API_KEY is not set. Add it as an environment variable in Vercel.',
    });
  }

  const body = req.body || {};
  const image = typeof body.image === 'string' ? body.image : '';
  const gender = body.gender === 'female' ? 'female' : 'male';

  if (!/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(image)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Send a base64 data URL image (jpeg, png, or webp) as "image".',
    });
  }
  if (image.length > MAX_IMAGE_CHARS) {
    return res.status(413).json({
      error: 'Image too large',
      message: 'Photo exceeds the size limit. Retake or a smaller photo works better.',
    });
  }

  const systemPrompt = buildSystemPrompt(gender);
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const failures = [];

  for (const model of ALLOWED_MODELS) {
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      if (Date.now() > deadline - 5000) break;

      let result;
      try {
        result = await callModel(model, systemPrompt, image, deadline);
      } catch (error) {
        failures.push({ model, attempt, message: error.message });
        if (error.attemptFailed) break;
        continue;
      }

      if (!result.ok) {
        const retryable = result.status === 429 || result.status >= 500;
        failures.push({ model, attempt, status: result.status, body: result.text.slice(0, 300) });

        if (retryable && attempt < RETRY_DELAYS_MS.length) {
          await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
          continue;
        }
        break;
      }

      let parsed = null;
      try {
        const payload = JSON.parse(result.text);
        const message = payload && payload.choices && payload.choices[0] && payload.choices[0].message;
        parsed = extractJson(messageText(message && message.content));
      } catch {
        failures.push({ model, attempt, message: 'unparseable upstream payload' });
      }

      if (!parsed) {
        failures.push({ model, attempt, message: 'model did not return usable JSON' });
        break;
      }

      const report = sanitizeReport(parsed);
      if (!report) {
        failures.push({ model, attempt, message: 'report failed validation' });
        break;
      }
      if (report.error) {
        return res.status(422).json({
          error: report.error,
          message: report.message || 'No clear single face found in that photo.',
        });
      }

      return res.status(200).json({ ok: true, model, report });
    }
  }

  console.error('All rating attempts failed:', JSON.stringify(failures).slice(0, 2000));
  return res.status(502).json({
    error: 'Upstream error',
    message: 'The rating model is unavailable right now. Try again in a moment.',
  });
}
