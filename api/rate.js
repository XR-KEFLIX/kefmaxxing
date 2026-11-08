import { providerChain } from './_providers.js'
import { saveScan, updateScanMeta } from './_scan-store.js'

const MAX_IMAGE_CHARS = 5_200_000
const TOTAL_BUDGET_MS = 150000
const PER_MODEL_TIMEOUT_MS = 40000
const MAX_ATTEMPTS = 12

const CATEGORY_META = [
  {
    key: 'harmony',
    name: 'Facial Harmony',
    group: 'structure',
    weight: 0.13,
    influence: 'structural',
    short: 'How the features work together as a whole.',
  },
  {
    key: 'proportions',
    name: 'Proportions & Symmetry',
    group: 'structure',
    weight: 0.11,
    influence: 'structural',
    short: 'Vertical thirds, horizontal fifths, approximate symmetry and balance.',
  },
  {
    key: 'eyeArea',
    name: 'Eye Area',
    group: 'structure',
    weight: 0.11,
    influence: 'structural',
    short: 'Canthal tilt, spacing, shape, lid exposure and under-eye quality.',
  },
  {
    key: 'midface',
    name: 'Midface',
    group: 'structure',
    weight: 0.07,
    influence: 'structural',
    short: 'Midface compactness, projection, cheek support and nose balance.',
  },
  {
    key: 'jawline',
    name: 'Jawline & Chin',
    group: 'structure',
    weight: 0.1,
    influence: 'mixed',
    short: 'Mandibular definition, gonial angle, chin projection and lower-third balance.',
  },
  {
    key: 'cheekbones',
    name: 'Cheekbones & Definition',
    group: 'structure',
    weight: 0.07,
    influence: 'mixed',
    short: 'Malar prominence, cheek support and how sharply the bone reads through soft tissue.',
  },
  {
    key: 'skin',
    name: 'Skin Quality',
    group: 'presentation',
    weight: 0.1,
    influence: 'modifiable',
    short: 'Texture, clarity, tone evenness, shine and under-eye appearance.',
  },
  {
    key: 'hair',
    name: 'Hair',
    group: 'presentation',
    weight: 0.08,
    influence: 'modifiable',
    short: 'Hairline, density, cut, styling and how well it frames the face.',
  },
  {
    key: 'grooming',
    name: 'Grooming',
    group: 'presentation',
    weight: 0.05,
    influence: 'modifiable',
    short: 'Brows, facial hair, cleanliness and deliberate presentation.',
  },
  {
    key: 'appeal',
    name: 'Overall Appeal',
    group: 'gestalt',
    weight: 0.18,
    influence: 'mixed',
    short: 'The combined impression: how the features read together, beyond any single measurement.',
  },
]

const META_BY_KEY = new Map(CATEGORY_META.map((meta) => [meta.key, meta]))
const STRUCTURE_WEIGHT = CATEGORY_META.filter((meta) => meta.group === 'structure').reduce(
  (sum, meta) => sum + meta.weight,
  0,
)

const BANDS = [
  { min: 9.0, label: 'Exceptional', note: 'Everything works together and reads as highly distinctive.' },
  { min: 8.0, label: 'Very attractive', note: 'Clearly strong overall with very few visible drags.' },
  { min: 7.0, label: 'Attractive', note: 'Noticeably above average, with clear strengths.' },
  { min: 6.0, label: 'Above average', note: 'A few features work clearly in your favour.' },
  { min: 5.0, label: 'Average', note: 'Around the population midpoint. Presentation changes can move the read.' },
  { min: 4.0, label: 'Below average', note: 'Several visible factors pull the read down.' },
  { min: 3.0, label: 'Well below average', note: 'Several visible problems are present. Presentation can still change a lot.' },
  { min: 1.0, label: 'Far below average', note: 'Multiple features sit outside common ranges. A structured plan matters most.' },
]

const RETRY_DELAYS_MS = []

function summarizeDevice(ua, platform, mobile, model) {
  const u = String(ua || '')
  const plat = String(platform || '').replace(/"/g, '')
  const mod = String(model || '').replace(/"/g, '')
  const isMobile = /1|\?1|true/i.test(String(mobile || '')) || /Mobile|Android|iPhone|iPad|iPod/i.test(u)
  const os = /iPhone|iPad|iPod/i.test(u) ? 'iOS' : /Android/i.test(u) ? 'Android' : /Windows/i.test(u) ? 'Windows' : /Mac OS X|Macintosh/i.test(u) ? 'macOS' : /Linux/i.test(u) ? 'Linux' : (plat || '')
  const browser = /Edg\//.test(u) ? 'Edge' : /OPR\/|Opera/.test(u) ? 'Opera' : /Chrome\//.test(u) && !/Edg\//.test(u) ? 'Chrome' : /Safari\//.test(u) && !/Chrome\//.test(u) ? 'Safari' : /Firefox\//.test(u) ? 'Firefox' : ''
  const device = mod && mod !== '""' ? mod : (/iPhone/.test(u) ? 'iPhone' : /iPad/.test(u) ? 'iPad' : /Android/.test(u) && isMobile ? 'Android phone' : /Android/.test(u) ? 'Android device' : isMobile ? 'Mobile device' : 'Desktop')
  return [device, os, browser].filter(Boolean).join(' · ') || undefined
}

function collectRequestMeta(req) {
  const h = (req && req.headers) || {}
  const get = (k) => {
    const v = h[k]
    if (typeof v === 'string') return v
    if (Array.isArray(v)) return v[0]
    return undefined
  }
  const proto = get('x-forwarded-proto') || 'https'
  const host = get('x-forwarded-host') || get('host')
  const url = (req && req.url) || ''
  const fullUrl = host ? `${proto}://${host}${url}` : url || undefined
  const now = new Date()
  return {
    sentAt: now.toISOString(),
    sentAtEpochMs: now.getTime(),
    capturedAt: now.toISOString(),
    upload: {
      method: req && req.method,
      url,
      fullUrl,
      host,
      origin: get('origin'),
      referer: get('referer') || get('referrer'),
      forwardedHost: get('x-forwarded-host'),
      forwardedProto: get('x-forwarded-proto'),
      vercelId: get('x-vercel-id'),
      vercelDeploymentUrl: get('x-vercel-deployment-url'),
    },
    network: {
      ip: get('x-forwarded-for') || get('x-real-ip') || get('x-vercel-forwarded-for') || (req && req.socket && req.socket.remoteAddress) || undefined,
      xForwardedFor: get('x-forwarded-for'),
      vercelProxiedFor: get('x-vercel-proxied-for'),
    },
    geo: {
      country: get('x-vercel-ip-country'),
      region: get('x-vercel-ip-country-region'),
      city: get('x-vercel-ip-city'),
      latitude: get('x-vercel-ip-latitude'),
      longitude: get('x-vercel-ip-longitude'),
      timezone: get('x-vercel-ip-timezone'),
      continent: get('x-vercel-ip-continent'),
    },
    device: {
      userAgent: get('user-agent'),
      platform: get('sec-ch-ua-platform'),
      mobile: get('sec-ch-ua-mobile'),
      ua: get('sec-ch-ua'),
      uaFullVersionList: get('sec-ch-ua-full-version-list'),
      uaModel: get('sec-ch-ua-model'),
      uaPlatformVersion: get('sec-ch-ua-platform-version'),
      language: get('accept-language'),
      accept: get('accept'),
      dnt: get('dnt'),
      saveData: get('save-data'),
      deviceMemory: get('device-memory'),
      viewportWidth: get('viewport-width'),
      dpr: get('dpr'),
      ect: get('ect'),
      downlink: get('downlink'),
      summary: summarizeDevice(get('user-agent'), get('sec-ch-ua-platform'), get('sec-ch-ua-mobile'), get('sec-ch-ua-model')),
    },
  }
}

function buildSystemPrompt(gender) {
  const reference = gender === 'female' ? 'female' : 'male'
  return [
    `You are KEF, the analysis engine behind Kefmaxxing. You assess one photo of one face for a cosmetic facial-aesthetics report.`,
    `You are careful, specific and fair. Direct without being harsh. Your job is a useful estimate, not a verdict and never a lecture.`,
    ``,
    `REFERENCE: The user chose ${reference} reference standards. Compare visible features to that reference. Do not infer identity, sexuality, race or ethnicity. Never mention race or ethnicity.`,
    ``,
    `CALIBRATION:`,
    `- 5.0 is a true population average. Most faces fall between 3.8 and 5.8. Be conservative.`,
    `- In a random group of 100 people, roughly 50 score below 5.0, 30 score 5.0 to 5.9, 15 score 6.0 to 6.9, 4 score 7.0 to 7.9, and 1 scores 8.0 or above. Use that distribution.`,
    `- 5.5 is slightly above average. 6.0 is clearly above average and requires noticeable strengths. 7.0 is attractive and uncommon. 8.0 is very attractive and rare. 9.0+ is exceptional.`,
    `- Do not inflate. Err on the lower side when uncertain. Use one decimal.`,
    `- A face with no standout features is around 4.2 to 5.0, not 5.5 or 6.0.`,
    `- If a feature is merely ordinary, score it near 4.5–5.2. Reserve 6.5+ for clearly positive features.`,
    `- Do not give 6.0 or higher unless you can name at least three clearly strong features in the photo. Do not give 7.0 or higher unless the face would stand out in the top few percent.`,
    `- If you are torn between two values, choose the lower one. If the face looks average, say 4.8 or 5.0, not 5.5.`,
    `- Do not state a numeric overall score in summary or analysis. The app computes the overall from your category scores.`,
    `- Visible soft-tissue fullness can lower definition-based scores, but do not guess body fat percentage.`,
    ``,
    `EVIDENCE AND LIMITS:`,
    `- You are estimating from one 2D photo. You cannot measure bone with calipers or know a person's body fat, health or history.`,
    `- Lighting, lens distance, angle, expression, filters, makeup, facial hair and hair styling can shift the read. Lower confidence and say so in photoNotes when relevant.`,
    `- Do not claim to measure angles or ratios precisely. If you mention a ratio, call it approximate.`,
    `- PSL is an internet-community framework, not a scientific instrument. Treat the structural dimensions as descriptive cues, not laws. Do not output a PSL score; the app computes a separate structural index.`,
    `- Do not infer health, personality, intelligence or worth.`,
    `- No medical claims. No diagnosis. No surgery-first advice. No bone smashing, extreme dieting, unproven hormone or drug advice.`,
    ``,
    `CATEGORIES: score each 1.0 to 10.0, one decimal. Judge only what the photo shows.`,
    `1. harmony: how the features work together. Balance, coherence, how the eye reads the face as a whole.`,
    `2. proportions: facial thirds, fifths, approximate symmetry, midface to face balance, eye spacing, mouth to nose width.`,
    `3. eyeArea: canthal tilt, eye spacing, shape, upper-lid exposure, under-eye quality, brow-to-eye relationship.`,
    `4. midface: compactness, projection, cheek support, nose proportions and tip, philtrum length.`,
    `5. jawline: mandibular definition, gonial angle (approximately), chin projection, lower-third balance, taper.`,
    `6. cheekbones: malar prominence, cheek support, how sharply the bone reads through soft tissue.`,
    `7. skin: clarity, texture, tone evenness, shine, visible irritation, under-eye darkness.`,
    `8. hair: hairline, density, cut, styling, how well it frames the face.`,
    `9. grooming: brows, facial hair, cleanliness, deliberate presentation.`,
    `10. appeal: the holistic impression. How attractive the face reads as a whole, beyond any single feature.`,
    ``,
    `SCORING ANCHORS: 5.0 is exactly average. 3.0 to 3.9 is below average with visible issues. 4.0 to 4.9 is slightly below average to ordinary. 5.0 to 5.4 is average. 5.5 to 5.9 is a bit above average. 6.0 to 6.9 is clearly above average. 7.0 to 7.9 is attractive and uncommon. 8.0 to 8.9 is very attractive and rare. 9.0 and above is exceptional. Most dimensions for a typical face sit between 3.8 and 5.8. Do not treat 5.0 as a floor or 6.0 as a default. When in doubt between two scores, choose the lower one.`,
    ``,
    `NOTES: for each category, write 1 to 3 sentences that name the visible features that drove the score. Explain the why, not just the what. Be specific to this photo.`,
    ``,
    `STRENGTHS AND IMPROVEMENTS:`,
    `- 3 to 5 each. Specific to this photo.`,
    `- Each item: name (the feature), category (one of the ten keys), influence (structural, mixed or modifiable), note (1 to 2 sentences).`,
    `- Strengths are what works. Improvements are what costs the face in this photo, stated without insult.`,
    `- Do not call a feature a flaw if it is simply a normal variation.`,
    ``,
    `PLAN: 5 to 7 steps, ordered by realistic impact.`,
    `- Only non-surgical, legal, safe actions: grooming, skincare, haircut, sleep, body composition within a healthy range, sun protection, presentation.`,
    `- Each step: action (short imperative), category (skin, hair, grooming, sleep, body composition, presentation or style), impact (High, Medium, Low), effort (Low, Medium, High), evidence (strong, moderate, limited), timeframe (for example "2-4 weeks"), detail (2 to 3 sentences naming the feature it addresses), addresses (the feature).`,
    `- Evidence tags: strong means sunscreen, not smoking, healthy body composition, basic skin care, haircut. Moderate means retinoids, brow grooming, beard shaping, sleep. Limited means mewing, gua sha, massage, jaw exercises, chewing. Do not promise results.`,
    `- No surgery in the plan. No extreme dieting. No bone smashing.`,
    `- Name the specific feature from this photo in each detail. Do not write generic advice.`,
    ``,
    `HAIR:`,
    `- faceShape: choose oval, round, square, oblong, heart, diamond, triangle, or "not clearly readable".`,
    `- direction: one sentence on what the cut should do (balance width or height, frame the face, keep the hairline visible).`,
    `- styles: 3 to 4 styles that suit the visible face shape and hair.`,
    `- avoid: 2 to 3 styles that work against it.`,
    `- note: one sentence that hair type, density, growth pattern and preference matter. This is styling guidance, not a rule.`,
    ``,
    `SKINCARE:`,
    `- am: 3 to 5 simple steps.`,
    `- pm: 3 to 5 simple steps.`,
    `- ingredients: 2 to 4 ingredients to look for.`,
    `- note: general cosmetic guidance. See a dermatologist for persistent acne, eczema, rosacea or pigmentation.`,
    `- Base it on visible skin. Do not diagnose anything.`,
    ``,
    `GROOMING:`,
    `- brows: specific guidance.`,
    `- facialHair: specific guidance, or "clean shaven suits this read" if applicable.`,
    `- general: 2 to 4 items.`,
    `- note: one sentence.`,
    ``,
    `HAIR HALO: also output a separate "hairHalo" field, score 1.0 to 10.0 with one decimal. This rates how well the CURRENT hair, cut and styling suit THIS specific face, not generic attractiveness. A great cut on a face it does not flatter scores low. A simple cut that nails the person's face scores high. If you cannot tell, use 5.0.`,
    ``,
    `ROADMAP: three phases: "Next 2 weeks", "1-3 months", "3-6 months". Each has phase, focus (one sentence), and actions (2 to 4 concrete steps) tied to this face.`,
    ``,
    `GENETIC VS MODIFIABLE:`,
    `- genetic: 3 to 5 visible traits that are largely fixed after growth.`,
    `- modifiable: 3 to 5 things the person can realistically change.`,
    `- note: one sentence.`,
    ``,
    `POTENTIAL: a separate estimate of the realistic overall score after 6 to 12 months of consistent non-surgical improvement. Use the same 1 to 10 calibration. It should usually be 0.3 to 1.5 above where the current face would land. Never below the current read. Do not promise a transformation.`,
    ``,
    `WRITING STYLE: sound like a careful analyst, not a chatbot. Short sentences. Plain words. Specific details. Write like an experienced person talking to one other person. Use contractions. Never use: "delve", "elevate", "unlock", "journey", "game-changer", "it's not just X, it's Y", "remember that", "at the end of the day". Never use em dashes. No hype, no motivational fluff, no hedging, no moralizing. Never insult. Never mention race or ethnicity. No slurs. No medical claims. Do not use looksmaxxing rank slang in any text (no Chad, Chadlite, HTN, MTN, LTN, Sub-5, mogging, or similar terms).`,
    ``,
    `If the image does not show exactly one clearly visible human face, respond ONLY with {"error":"no_face","message":"..."}.`,
    ``,
    `Otherwise respond with ONLY one minified JSON object, no markdown, no backticks, exactly this shape. The values below are placeholders that show the field types only: never copy them and never let them influence your scores.`,
    `{"confidence":0.7,"faceShape":"oval","archetype":"structured","summary":"2-3 sentences.","analysis":"4-6 sentences.","categories":[{"key":"harmony","score":5.0,"note":"..."},{"key":"proportions","score":5.0,"note":"..."},{"key":"eyeArea","score":5.0,"note":"..."},{"key":"midface","score":5.0,"note":"..."},{"key":"jawline","score":5.0,"note":"..."},{"key":"cheekbones","score":5.0,"note":"..."},{"key":"skin","score":5.0,"note":"..."},{"key":"hair","score":5.0,"note":"..."},{"key":"grooming","score":5.0,"note":"..."},{"key":"appeal","score":5.0,"note":"..."}],"hairHalo":5.0,"strengths":[{"name":"feature","category":"harmony","influence":"structural","note":"..."}],"improvements":[{"name":"feature","category":"jawline","influence":"mixed","note":"..."}],"plan":[{"action":"short imperative","category":"skin","impact":"High","effort":"Low","evidence":"strong","timeframe":"2-4 weeks","detail":"2-3 sentences with specifics.","addresses":"feature"}],"roadmap":[{"phase":"Next 2 weeks","focus":"one sentence","actions":["short step","short step"]}],"hair":{"faceShape":"oval","direction":"one sentence","styles":["style","style"],"avoid":["style","style"],"note":"one sentence"},"skincare":{"am":["step","step"],"pm":["step","step"],"ingredients":["ingredient","ingredient"],"note":"one sentence"},"grooming":{"brows":"one sentence","facialHair":"one sentence","general":["item","item"],"note":"one sentence"},"geneticVsModifiable":{"genetic":["trait","trait"],"modifiable":["change","change"],"note":"one sentence"},"potential":6.0,"photoNotes":"1-2 sentences."}`,
  ].join('\n')
}

function trimText(value, max = 500) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function round1(value) {
  return Math.round(value * 10) / 10
}

function round2(value) {
  return Math.round(value * 100) / 100
}

function formatScore(value) {
  return Number(value).toFixed(1)
}

function clampScore(value, fallback = 5) {
  const n = typeof value === 'number' ? value : parseFloat(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(10, Math.max(1, round1(n)))
}

// Models tend to read faces optimistically above the midpoint. Map their raw
// score onto a distribution that matches how faces actually spread: most sit
// near 5.0, and 6.0+ stays uncommon. The curve is monotonic, so ordering holds.
function calibrateScore(value) {
  const s = clampScore(value, 5)
  if (s <= 5) {
    const gap = 5 - s
    return clampScore(5 - 0.88 * Math.pow(gap, 0.9))
  }
  const gap = s - 5
  return clampScore(5 + 0.6 * Math.pow(gap, 0.88))
}

// A high overall needs support from the individual dimensions. One strong
// feature cannot carry the whole face into the next band.
function capOverall(overall, categories) {
  const scores = categories.map((cat) => cat.score)
  const strong = scores.filter((s) => s >= 6.0).length
  const excellent = scores.filter((s) => s >= 7.0).length
  let cap = 5.9
  if (strong >= 3) cap = 6.5
  if (strong >= 5) cap = 7.0
  if (excellent >= 3) cap = 7.4
  if (excellent >= 5) cap = 8.0
  return Math.min(overall, cap)
}

function clampConfidence(value) {
  const n = typeof value === 'number' ? value : parseFloat(value)
  if (!Number.isFinite(n)) return 0.6
  const c = n > 1 ? n / 100 : n
  return Math.min(1, Math.max(0.1, round2(c)))
}

function allowedInfluence(value, fallback) {
  const v = String(value || '').toLowerCase()
  if (v === 'structural' || v === 'mixed' || v === 'modifiable') return v
  return fallback || 'mixed'
}

function allowedImpact(value) {
  const v = String(value || '').toLowerCase()
  if (v === 'high') return 'High'
  if (v === 'low') return 'Low'
  return 'Medium'
}

function allowedEffort(value) {
  const v = String(value || '').toLowerCase()
  if (v === 'high') return 'High'
  if (v === 'low') return 'Low'
  return 'Medium'
}

function allowedEvidence(value) {
  const v = String(value || '').toLowerCase()
  if (v === 'strong') return 'strong'
  if (v === 'limited' || v === 'anecdotal') return 'limited'
  return 'moderate'
}

function cleanStringArray(value, max, maxLength = 180) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => trimText(item, maxLength))
    .filter(Boolean)
    .slice(0, max)
}

function stripDashes(value) {
  return String(value)
    .replace(/\s*(?:—|–|--)\s*/g, ', ')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function stripDashesDeep(value) {
  if (typeof value === 'string') return stripDashes(value)
  if (Array.isArray(value)) return value.map(stripDashesDeep)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, item] of Object.entries(value)) out[key] = stripDashesDeep(item)
    return out
  }
  return value
}

function bandFor(score) {
  const band = BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1]
  const pos = score - band.min
  const level = pos < 0.35 ? 'low' : pos < 0.7 ? 'mid' : 'high'
  return { band: band.label, bandNote: band.note, level }
}

function extractJson(text) {
  if (typeof text !== 'string') return null
  let t = text.trim()
  t = t.replace(/^```(?:json)?/i, '').replace(/```\s*$/, '').trim()
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(t.slice(start, end + 1))
  } catch {
    return null
  }
}

function messageText(content) {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content.map((part) => (part && typeof part.text === 'string' ? part.text : '')).join('')
  }
  return ''
}

function fallbackPlan() {
  return [
    {
      rank: 1,
      action: 'Build a minimal skin routine',
      category: 'skin',
      impact: 'High',
      effort: 'Low',
      evidence: 'strong',
      timeframe: 'Daily, 8-12 weeks',
      detail:
        'Use a gentle cleanser, a moisturiser and a broad-spectrum sunscreen. If you want to target texture or pigmentation, introduce a retinoid slowly and get professional advice for persistent issues.',
      addresses: 'skin quality',
    },
    {
      rank: 2,
      action: 'Get a cut that frames your face',
      category: 'hair',
      impact: 'High',
      effort: 'Low',
      evidence: 'moderate',
      timeframe: '1-2 weeks',
      detail:
        'Choose a cut that keeps the sides controlled and adds deliberate shape around the face. Bring photos and ask a stylist to work with your hair type and growth pattern.',
      addresses: 'hair and facial framing',
    },
    {
      rank: 3,
      action: 'Make grooming deliberate',
      category: 'grooming',
      impact: 'Medium',
      effort: 'Low',
      evidence: 'moderate',
      timeframe: '1-2 weeks',
      detail:
        'Clean up stray brow hairs without changing the natural shape. If you wear facial hair, define the edges and keep the length consistent.',
      addresses: 'grooming and presentation',
    },
    {
      rank: 4,
      action: 'Protect sleep and recovery',
      category: 'sleep',
      impact: 'Medium',
      effort: 'Medium',
      evidence: 'moderate',
      timeframe: '2-4 weeks',
      detail:
        'Aim for seven to nine hours and keep a consistent schedule. Sleep affects how the under-eye area and skin read, and it supports every other change on this list.',
      addresses: 'under-eye appearance and skin',
    },
    {
      rank: 5,
      action: 'Review body composition with a professional',
      category: 'body composition',
      impact: 'Medium',
      effort: 'High',
      evidence: 'moderate',
      timeframe: '3-6 months',
      detail:
        'If body fat is masking your jaw and cheekbones, work toward a healthy range with a sustainable plan. Avoid extreme dieting. The goal is definition, not depletion.',
      addresses: 'jaw and cheekbone definition',
    },
  ]
}

function cleanInsights(items, max, fallback, direction) {
  const cleaned = Array.isArray(items)
    ? items
        .filter((item) => item && typeof item === 'object')
        .slice(0, max)
        .map((item) => ({
          name: trimText(item.name, 90),
          category: trimText(item.category, 40),
          influence: allowedInfluence(item.influence),
          note: trimText(item.note, 420),
        }))
        .filter((item) => item.name && item.note)
    : []
  if (cleaned.length) return cleaned

  const sorted = [...fallback].sort((a, b) => (direction === 'top' ? b.score - a.score : a.score - b.score))
  return sorted.slice(0, max).map((cat) => {
    const meta = META_BY_KEY.get(cat.key)
    return {
      name: cat.name,
      category: cat.key,
      influence: cat.influence,
      note: cat.note || (meta ? meta.short : ''),
    }
  })
}

function cleanPlan(items) {
  const cleaned = Array.isArray(items)
    ? items
        .filter((item) => item && typeof item === 'object')
        .slice(0, 7)
        .map((item, i) => ({
          rank: i + 1,
          action: trimText(item.action, 120),
          category: trimText(item.category, 40) || 'presentation',
          impact: allowedImpact(item.impact),
          effort: allowedEffort(item.effort),
          evidence: allowedEvidence(item.evidence),
          timeframe: trimText(item.timeframe, 32),
          detail: trimText(item.detail, 520),
          addresses: trimText(item.addresses, 120),
        }))
        .filter((item) => item.action && item.detail)
    : []
  return cleaned.length >= 3 ? cleaned : fallbackPlan()
}

function cleanRoadmap(items, plan) {
  const cleaned = Array.isArray(items)
    ? items
        .filter((item) => item && typeof item === 'object')
        .slice(0, 3)
        .map((item) => ({
          phase: trimText(item.phase, 40),
          focus: trimText(item.focus, 220),
          actions: cleanStringArray(item.actions, 4, 220),
        }))
        .filter((item) => item.phase || item.focus || item.actions.length)
    : []
  if (cleaned.length) return cleaned

  const buckets = [plan.slice(0, 2), plan.slice(2, 4), plan.slice(4, 7)].filter((bucket) => bucket.length)
  const labels = ['Next 2 weeks', '1-3 months', '3-6 months']
  return buckets.map((bucket, i) => ({
    phase: labels[i] || `Phase ${i + 1}`,
    focus: '',
    actions: bucket.map((item) => item.action),
  }))
}

function cleanHair(raw, faceShape) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const styles = cleanStringArray(source.styles, 4, 90)
  const avoid = cleanStringArray(source.avoid, 3, 90)
  return {
    faceShape: trimText(source.faceShape, 40) || faceShape || 'not clearly readable',
    direction:
      trimText(source.direction, 240) ||
      'Keep the sides controlled and give the top deliberate shape so the face is framed rather than flattened.',
    styles: styles.length
      ? styles
      : ['A cut with controlled sides and texture on top', 'A style that keeps the hairline visible', 'A shape that works with your natural growth pattern'],
    avoid: avoid.length
      ? avoid
      : ['A heavy, flat fringe that hides the forehead', 'Excess volume at the sides that widens the face'],
    note:
      trimText(source.note, 320) ||
      'Styling guidance only. Hair type, density, growth pattern and personal preference matter.',
  }
}

function cleanSkincare(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const am = cleanStringArray(source.am, 5, 160)
  const pm = cleanStringArray(source.pm, 5, 160)
  const ingredients = cleanStringArray(source.ingredients, 4, 80)
  return {
    am: am.length ? am : ['Gentle cleanser', 'Moisturiser', 'Broad-spectrum sunscreen SPF 30+'],
    pm: pm.length ? pm : ['Cleanse', 'Moisturiser', 'Consider a retinoid if your skin tolerates it'],
    ingredients: ingredients.length ? ingredients : ['Sunscreen', 'Retinoid (if suitable)', 'Niacinamide'],
    note:
      trimText(source.note, 320) ||
      'General cosmetic guidance. See a dermatologist for persistent acne, eczema, rosacea or pigmentation.',
  }
}

function cleanGrooming(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const general = cleanStringArray(source.general, 4, 160)
  return {
    brows:
      trimText(source.brows, 300) ||
      'Keep the natural shape and remove only stray hairs between and below the brow.',
    facialHair:
      trimText(source.facialHair, 300) ||
      'If you wear facial hair, keep the edges deliberate and the length consistent. If not, a clean shave keeps the jaw visible.',
    general: general.length
      ? general
      : ['Keep hair and nails clean', 'Choose a cut you can maintain', 'Keep facial hair tidy'],
    note: trimText(source.note, 320) || 'Grooming should sharpen the face, not hide it.',
  }
}

function cleanGenetic(raw, categories) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const genetic = cleanStringArray(source.genetic, 5, 160)
  const modifiable = cleanStringArray(source.modifiable, 5, 160)
  const structural = categories
    .filter((cat) => cat.influence === 'structural')
    .map((cat) => cat.name)
    .slice(0, 5)
  const changeable = categories
    .filter((cat) => cat.influence === 'modifiable')
    .map((cat) => cat.name)
    .slice(0, 5)
  return {
    genetic: genetic.length ? genetic : structural.length ? structural : ['Bone structure and facial proportions'],
    modifiable: modifiable.length
      ? modifiable
      : changeable.length
        ? [...changeable, 'Body composition', 'Sleep and recovery']
        : ['Body composition', 'Skin care and sun protection', 'Haircut and styling', 'Sleep and recovery'],
    note:
      trimText(source.note, 300) ||
      'Genetics set the starting point. Presentation changes how those features read.',
  }
}

function sanitizeReport(raw, gender) {
  if (!raw || typeof raw !== 'object') return null
  if (raw.error) return { error: raw.error, message: raw.message }

  const byKey = new Map()
  if (Array.isArray(raw.categories)) {
    for (const cat of raw.categories) {
      if (cat && typeof cat.key === 'string') byKey.set(cat.key, cat)
    }
  }

  const categories = CATEGORY_META.map((meta) => {
    const cat = byKey.get(meta.key) || {}
    return {
      key: meta.key,
      name: meta.name,
      group: meta.group,
      weight: meta.weight,
      influence: meta.influence,
      score: calibrateScore(cat.score),
      note: trimText(cat.note, 520),
    }
  })

  const scoreByKey = Object.fromEntries(categories.map((cat) => [cat.key, cat.score]))
  const weighted = categories.reduce((sum, cat) => sum + cat.score * cat.weight, 0)

  // Hair halo: how well the current cut suits this specific face.
  // A strong hair-face match gives a small bump; keep it modest to avoid inflating the overall read.
  const rawHairHalo = clampScore(raw.hairHalo, scoreByKey.hair)
  const hairHalo = rawHairHalo
  const hairBonus = hairHalo >= 9.0 ? 0.2 : hairHalo >= 8.0 ? 0.1 : 0
  const overall = clampScore(capOverall(weighted + hairBonus, categories), 5)
  const structureScore = categories
    .filter((cat) => cat.group === 'structure')
    .reduce((sum, cat) => sum + cat.score * cat.weight, 0)
  const structuralIndex = clampScore(structureScore / STRUCTURE_WEIGHT, overall)
  const appealIndex = scoreByKey.appeal
  const rawPotential = calibrateScore(raw.potential)
  const potential = round1(Math.min(8.6, Math.max(overall + 0.3, rawPotential), overall + 1.4))

  const { band, bandNote, level } = bandFor(overall)
  const scoreBreakdown = categories.map((cat) => ({
    key: cat.key,
    name: cat.name,
    group: cat.group,
    weight: cat.weight,
    score: cat.score,
    contribution: round2(cat.score * cat.weight),
    influence: cat.influence,
  }))

  const sorted = [...categories].sort((a, b) => b.score - a.score)
  const strongest = sorted[0]
  const weakest = sorted[sorted.length - 1]
  const summary =
    trimText(raw.summary, 900) ||
    `The strongest part of this read is ${strongest.name.toLowerCase()} at ${formatScore(strongest.score)}. The clearest opportunity is ${weakest.name.toLowerCase()} at ${formatScore(weakest.score)}.${hairBonus > 0 ? ` The hair halo added ${formatScore(hairBonus)} to the overall.` : ''}`

  const analysis =
    trimText(raw.analysis, 1800) ||
    [
      `The overall read is ${formatScore(overall)} out of 10, which sits in the ${band.toLowerCase()} band.`,
      `The hair halo is ${formatScore(hairHalo)} out of 10${hairBonus > 0 ? `, which added ${formatScore(hairBonus)} to the overall` : ''}.`,
      `Strongest dimensions: ${sorted
        .slice(0, 3)
        .map((cat) => `${cat.name} (${formatScore(cat.score)})`)
        .join(', ')}.`,
      `The main drags are ${sorted
        .slice(-3)
        .reverse()
        .map((cat) => `${cat.name} (${formatScore(cat.score)})`)
        .join(', ')}.`,
      `These are estimates from one photo. Lighting, lens, expression and styling can shift the read.`,
    ].join(' ')

  const plan = cleanPlan(raw.plan)
  const roadmap = cleanRoadmap(raw.roadmap, plan)
  const faceShape = trimText(raw.faceShape, 40) || 'not clearly readable'

  return stripDashesDeep({
    overall,
    potential,
    band,
    bandNote,
    level,
    structuralIndex,
    appealIndex,
    hairHalo,
    hairBonus,
    confidence: clampConfidence(raw.confidence),
    archetype: trimText(raw.archetype, 40) || 'unclassified',
    faceShape,
    summary,
    analysis,
    categories,
    scoreBreakdown,
    strengths: cleanInsights(raw.strengths, 5, categories, 'top'),
    improvements: cleanInsights(raw.improvements, 5, categories, 'bottom'),
    plan,
    roadmap,
    hair: cleanHair(raw.hair, faceShape),
    skincare: cleanSkincare(raw.skincare),
    grooming: cleanGrooming(raw.grooming),
    geneticVsModifiable: cleanGenetic(raw.geneticVsModifiable, categories),
    photoNotes:
      trimText(raw.photoNotes, 500) ||
      'Single-photo estimate. Lighting, angle, lens and filters can shift the reading.',
  })
}

async function callModel(entry, systemPrompt, image, deadline) {
  const remaining = deadline - Date.now()
  if (remaining < 5000) throw Object.assign(new Error('budget exhausted'), { attemptFailed: true })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), Math.min(PER_MODEL_TIMEOUT_MS, remaining))

  try {
    const upstream = await fetch(`${entry.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${entry.apiKey}`,
        ...entry.headers,
      },
      body: JSON.stringify({
        model: entry.model,
        stream: false,
        max_tokens: Math.max(6000, entry.minTokens || 0),
        temperature: 0,
        ...(entry.reasoning ? { reasoning_effort: entry.reasoning } : {}),
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyse this photo. Return JSON only.' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    })

    const text = await upstream.text()
    return { ok: upstream.ok, status: upstream.status, text }
  } finally {
    clearTimeout(timer)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'POST only.' })
  }

  const chain = providerChain({ vision: true })
  if (!chain.length) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'No rating provider is configured. Set GEMINI_API_KEY (and any fallbacks) in Vercel.',
    })
  }

  const body = req.body || {}
  const image = typeof body.image === 'string' ? body.image : ''
  const gender = body.gender === 'female' ? 'female' : 'male'

  if (!/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(image)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Send a base64 data URL image (jpeg, png or webp) as "image".',
    })
  }
  if (image.length > MAX_IMAGE_CHARS) {
    return res.status(413).json({
      error: 'Image too large',
      message: 'Photo exceeds the size limit. Retake or use a smaller photo.',
    })
  }

  const scanRef = await saveScan(image, collectRequestMeta(req))
  const scanName = scanRef && scanRef.filename

  const systemPrompt = buildSystemPrompt(gender)
  const deadline = Date.now() + TOTAL_BUDGET_MS
  const failures = []
  let attempts = 0

  for (const entry of chain) {
    if (attempts >= MAX_ATTEMPTS) break
    if (Date.now() > deadline - 5000) break
    attempts += 1

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      if (Date.now() > deadline - 5000) break

      let result
      try {
        result = await callModel(entry, systemPrompt, image, deadline)
      } catch (error) {
        failures.push({ provider: entry.provider, model: entry.model, attempt, message: error.message })
        console.error('[rate] exception', entry.provider, entry.model, error.message)
        if (error.attemptFailed) break
        if (/abort/i.test(error.message || '')) break
        continue
      }

      if (!result.ok) {
        const retryable = result.status === 429 || result.status >= 500
        failures.push({
          provider: entry.provider,
          model: entry.model,
          attempt,
          status: result.status,
          body: result.text.slice(0, 300),
        })
        console.error('[rate] http', entry.provider, entry.model, result.status, result.text.slice(0, 200))

        if (retryable && attempt < RETRY_DELAYS_MS.length) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
          continue
        }
        break
      }

      let parsed = null
      try {
        const payload = JSON.parse(result.text)
        const message = payload && payload.choices && payload.choices[0] && payload.choices[0].message
        parsed = extractJson(messageText(message && message.content))
      } catch {
        failures.push({ provider: entry.provider, model: entry.model, attempt, message: 'unparseable upstream payload' })
      }

      if (!parsed) {
        failures.push({ provider: entry.provider, model: entry.model, attempt, message: 'model did not return usable JSON' })
        console.error('[rate] unusable', entry.provider, entry.model, result.text.slice(0, 200))
        if (attempt < RETRY_DELAYS_MS.length) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
          continue
        }
        break
      }

      const report = sanitizeReport(parsed, gender)
      if (!report) {
        failures.push({ provider: entry.provider, model: entry.model, attempt, message: 'report failed validation' })
        if (attempt < RETRY_DELAYS_MS.length) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
          continue
        }
        break
      }
      if (report.error) {
        if (scanName) await updateScanMeta(scanName, { result: { ok: false, error: report.error, message: report.message || 'No clear single face found in that photo.', gender, model: entry.model, provider: entry.provider } })
        return res.status(422).json({
          error: report.error,
          message: report.message || 'No clear single face found in that photo.',
        })
      }

      if (scanName) await updateScanMeta(scanName, { result: {
        ok: true,
        gender,
        model: entry.model,
        provider: entry.provider,
        overall: report.overall,
        potential: report.potential,
        band: report.band,
        bandNote: report.bandNote,
        level: report.level,
        confidence: report.confidence,
        hairHalo: report.hairHalo,
        structuralIndex: report.structuralIndex,
        appealIndex: report.appealIndex,
        faceShape: report.faceShape,
        categories: Array.isArray(report.categories) ? report.categories.map((c) => ({ key: c.key, name: c.name, score: c.score })) : undefined,
      } })
      return res.status(200).json({ ok: true, model: entry.model, provider: entry.provider, report })
    }
  }

  console.error('All rating attempts failed:', JSON.stringify(failures).slice(0, 2000))
  if (scanName) await updateScanMeta(scanName, { result: { ok: false, error: 'upstream_error', gender, failures: failures.slice(0, 12) } })
  return res.status(502).json({
    error: 'Upstream error',
    message: 'The analysis model is unavailable right now. Try again in a moment.',
  })
}
