import type { DimensionGroup, Influence } from './types'

export interface ScoreBand {
  min: number
  label: string
  note: string
}

export const SCORE_BANDS: ScoreBand[] = [
  { min: 9.0, label: 'Exceptional', note: 'A rare, highly cohesive read with several standout features.' },
  { min: 8.0, label: 'Very attractive', note: 'A striking face that reads as distinctive in most settings.' },
  { min: 7.0, label: 'Attractive', note: 'Clearly stands out. Strong features and few visible weaknesses.' },
  { min: 6.0, label: 'Above average', note: 'Several dimensions are working well. Noticeably better than the middle.' },
  { min: 5.0, label: 'Average', note: 'The population midpoint. Balanced, normal, and responsive to presentation changes.' },
  { min: 4.0, label: 'Slightly below average', note: 'A normal face with a few dimensions that pull the read down.' },
  { min: 3.0, label: 'Below average', note: 'Multiple visible features are working against the read. Presentation can change a lot here.' },
  { min: 1.0, label: 'Very low', note: 'Several dimensions sit outside common aesthetic ranges. A structured, non-surgical plan matters most.' },
]

export interface DimensionMeta {
  key: string
  name: string
  group: DimensionGroup
  weight: number
  short: string
  influence: Influence
}

export const DIMENSIONS: DimensionMeta[] = [
  {
    key: 'harmony',
    name: 'Facial Harmony',
    group: 'structure',
    weight: 0.13,
    short: 'How the features work together as a whole.',
    influence: 'structural',
  },
  {
    key: 'proportions',
    name: 'Proportions & Symmetry',
    group: 'structure',
    weight: 0.11,
    short: 'Vertical thirds, horizontal fifths, approximate symmetry and balance.',
    influence: 'structural',
  },
  {
    key: 'eyeArea',
    name: 'Eye Area',
    group: 'structure',
    weight: 0.11,
    short: 'Canthal tilt, spacing, shape, lid exposure and under-eye quality.',
    influence: 'structural',
  },
  {
    key: 'midface',
    name: 'Midface',
    group: 'structure',
    weight: 0.07,
    short: 'Midface compactness, projection, cheek support and nose balance.',
    influence: 'structural',
  },
  {
    key: 'jawline',
    name: 'Jawline & Chin',
    group: 'structure',
    weight: 0.1,
    short: 'Mandibular definition, gonial angle, chin projection and lower-third balance.',
    influence: 'mixed',
  },
  {
    key: 'cheekbones',
    name: 'Cheekbones & Definition',
    group: 'structure',
    weight: 0.07,
    short: 'Malar prominence, cheek support and how sharply the bone reads through soft tissue.',
    influence: 'mixed',
  },
  {
    key: 'skin',
    name: 'Skin Quality',
    group: 'presentation',
    weight: 0.1,
    short: 'Texture, clarity, tone evenness, shine and under-eye appearance.',
    influence: 'modifiable',
  },
  {
    key: 'hair',
    name: 'Hair',
    group: 'presentation',
    weight: 0.08,
    short: 'Hairline, density, cut, styling and how well it frames the face.',
    influence: 'modifiable',
  },
  {
    key: 'grooming',
    name: 'Grooming',
    group: 'presentation',
    weight: 0.05,
    short: 'Brows, facial hair, cleanliness and deliberate presentation.',
    influence: 'modifiable',
  },
  {
    key: 'appeal',
    name: 'Overall Appeal',
    group: 'gestalt',
    weight: 0.18,
    short: 'The combined impression: how the features read together, beyond any single measurement.',
    influence: 'mixed',
  },
]

export interface FrameworkGroup {
  key: DimensionGroup
  label: string
  weight: number
  description: string
  keys: string[]
}

export const FRAMEWORK_GROUPS: FrameworkGroup[] = [
  {
    key: 'structure',
    label: 'Structure',
    weight: 0.59,
    description: 'Harmony, proportions, eye area, midface, jawline and cheekbones. The architectural read.',
    keys: ['harmony', 'proportions', 'eyeArea', 'midface', 'jawline', 'cheekbones'],
  },
  {
    key: 'presentation',
    label: 'Presentation',
    weight: 0.23,
    description: 'Skin, hair and grooming. The dimensions you can change most directly.',
    keys: ['skin', 'hair', 'grooming'],
  },
  {
    key: 'gestalt',
    label: 'Overall appeal',
    weight: 0.18,
    description: 'The holistic impression, weighted separately so no single feature dominates.',
    keys: ['appeal'],
  },
]

export const DELIVERABLES: Array<{ title: string; body: string }> = [
  {
    title: 'A 10-point overall read',
    body: 'A calibrated score, a descriptive band, and the weighted dimensions behind it.',
  },
  {
    title: 'Dimension-by-dimension analysis',
    body: 'Ten scores with notes on what drove each one, plus your strongest and weakest areas.',
  },
  {
    title: 'A realistic plan',
    body: 'Grooming, hair, skin and lifestyle steps ranked by impact, with honest evidence tags.',
  },
  {
    title: 'Genetic vs changeable',
    body: 'A clear split between structure you cannot change and presentation you can.',
  },
  {
    title: 'A chat with Kef',
    body: 'Ask follow-up questions about your report, your plan or the method. Available immediately.',
  },
]

export const PHOTO_PROTOCOL: Array<{ title: string; detail: string }> = [
  { title: 'Front-facing', detail: 'Camera at eye level, face square to the lens.' },
  { title: 'Even light', detail: 'Soft, indirect light. Avoid flash, ring lights and hard shadows.' },
  { title: 'Neutral expression', detail: 'Relaxed face, eyes open, no smiling or posing.' },
  { title: 'No filters', detail: 'No beauty mode, edits, heavy makeup or lens distortion.' },
  { title: 'Hair back', detail: 'If possible, keep the hairline and jaw visible.' },
]

export const PRIVACY_POINTS: string[] = [
  'Compressed in your browser before sending',
  'Processed once by the analysis endpoint',
  'Not stored by this app. No account, profile or gallery',
  'The chat sends your report context, not your photo',
]

export const EVIDENCE_LEVERS: Array<{ title: string; label: string; tone: 'good' | 'warn' | 'neutral' | 'bad'; body: string }> = [
  {
    title: 'Sun protection and not smoking',
    label: 'Strong evidence',
    tone: 'good',
    body: 'The clearest evidence for reducing visible skin ageing. Daily broad-spectrum sunscreen and avoiding smoke are the highest-confidence skin levers.',
  },
  {
    title: 'Body composition in a healthy range',
    label: 'Moderate evidence',
    tone: 'warn',
    body: 'Facial adiposity changes how the jaw and cheekbones read. The goal is a healthy range, not an extreme cut. Severe restriction is not a looksmaxxing shortcut.',
  },
  {
    title: 'Sleep and under-eye appearance',
    label: 'Moderate evidence',
    tone: 'warn',
    body: 'Short sleep can be visible to observers and is linked to lower perceived health and attractiveness. Seven to nine hours is the practical target.',
  },
  {
    title: 'Haircut and styling',
    label: 'Moderate evidence',
    tone: 'warn',
    body: 'A cut changes the frame of the face quickly. Face-shape matching is a useful stylist heuristic, not a scientific rule. Hair type, density and growth pattern matter more than any chart.',
  },
  {
    title: 'Basic skin care',
    label: 'Strong evidence',
    tone: 'good',
    body: 'A gentle cleanser, moisturiser and sunscreen are the foundation. Retinoids have good evidence for photoageing and acne, but introduce them slowly and get medical advice for persistent problems.',
  },
  {
    title: 'Brow and facial-hair grooming',
    label: 'Moderate evidence',
    tone: 'warn',
    body: 'Small, reversible changes can sharpen the eye area and lower-face frame. Keep the natural shape and avoid over-plucking.',
  },
  {
    title: 'Mewing, gua sha and massage',
    label: 'Limited evidence',
    tone: 'neutral',
    body: 'No good evidence that these reshape adult bone. Massage can temporarily reduce puffiness. Treat any lasting structural claim with scepticism.',
  },
  {
    title: 'Jaw exercises and hard chewing',
    label: 'Limited evidence',
    tone: 'neutral',
    body: 'Masseter hypertrophy may change the look of the lower face for some people, but the evidence is thin and overuse can cause jaw pain or TMJ problems. Not a reliable bone-building method.',
  },
  {
    title: 'Bone smashing',
    label: 'Avoid',
    tone: 'bad',
    body: 'Do not do this. It is dangerous, unproven and can cause permanent injury. No responsible analysis recommends it.',
  },
]

export const METHOD_LIMITS: string[] = [
  'One 2D photo is not a clinical measurement. Lens distance, lighting, angle, expression, filters, makeup and facial hair all shift the read.',
  'The model estimates. It does not measure bone with calipers, imaging or a physical exam.',
  'Attractiveness is partly subjective and culturally variable. A score is a structured opinion, not a fact about your worth.',
  'Community metrics such as canthal tilt, gonial angle and midface ratio are descriptive cues. They are not validated laws of attractiveness.',
  'Hair and grooming advice is general styling guidance. Hair type, density, growth pattern and personal preference matter.',
  'Nothing here is medical advice. See a qualified professional for skin, dental, jaw or mental health concerns.',
  'No percentile is shown. A single photo cannot establish a true population percentile, and false precision is worse than no number.',
]

export const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: 'Is the score objective?',
    a: 'No. It is a structured estimate from one photo. Different photos, lighting and models can produce different readings. The method is consistent, but the output is not a measurement of truth or worth.',
  },
  {
    q: 'Is my photo stored?',
    a: 'Not by this app. The image is compressed in your browser, sent to the analysis endpoint and processed once. There is no account, profile or gallery. The request goes to a third-party model provider to generate the report, so that provider processes the image under its own data policy.',
  },
  {
    q: 'Why does my score change between photos?',
    a: 'Perspective, light, expression, compression and filters can move the reading by a meaningful amount. For progress tracking, use the same camera, distance, room and light each time.',
  },
  {
    q: 'What is the PSL-style structural index?',
    a: 'It is a secondary readout built from the six structure dimensions. It is inspired by internet looksmaxxing culture, not a scientific instrument, and it is not the overall score.',
  },
  {
    q: 'Can I change my bone structure?',
    a: 'After growth, no, not without surgery. Body composition, skin, hair and grooming change how the existing structure reads. Be sceptical of anyone selling non-surgical bone change.',
  },
  {
    q: 'Does mewing work?',
    a: 'There is no good evidence that it reshapes adult bone. It may help some people with oral posture or nasal breathing. It is not a substitute for orthodontic or medical care.',
  },
  {
    q: 'Do jaw exercises work?',
    a: 'They can grow the masseter muscles in some people, which may change the look of the lower face. Evidence is limited, and overuse can cause pain or TMJ problems. Do not force it.',
  },
  {
    q: 'Is this medical advice?',
    a: 'No. It is cosmetic and grooming guidance. See a dermatologist, dentist, orthodontist or doctor for medical concerns.',
  },
  {
    q: 'Why no percentile?',
    a: 'A single photo cannot establish a true population percentile. We show a calibrated band and the dimensions behind the score instead of inventing precision.',
  },
  {
    q: 'How is gender handled?',
    a: 'You choose a male or female reference standard. The analysis compares visible features to that reference. It does not infer identity or make claims about who you are.',
  },
  {
    q: 'What if I wear makeup, a beard or a filter?',
    a: 'They can change the read. The report lowers confidence and notes it when relevant. For the cleanest comparison, use a neutral photo.',
  },
  {
    q: 'Is a low score an insult?',
    a: 'No. The score describes a single photo against a reference, not your value as a person. The plan focuses on what is changeable and worth doing.',
  },
]

export const REFERENCES: Array<{ authors: string; year: string; title: string; source: string }> = [
  {
    authors: 'Langlois, J. H., & Roggman, L. A.',
    year: '1990',
    title: 'Attractive faces are only average',
    source: 'Psychological Science, 1(2), 115-121',
  },
  {
    authors: 'Perrett, D. I., et al.',
    year: '1998',
    title: 'Effects of sexual dimorphism on facial attractiveness',
    source: 'Nature, 394, 884-887',
  },
  {
    authors: 'Rhodes, G.',
    year: '2006',
    title: 'The evolutionary psychology of facial beauty',
    source: 'Annual Review of Psychology, 57, 199-226',
  },
  {
    authors: 'Little, A. C., Jones, B. C., & DeBruine, L. M.',
    year: '2011',
    title: 'Facial attractiveness: evolutionary based research',
    source: 'Philosophical Transactions of the Royal Society B, 366, 1638-1659',
  },
  {
    authors: 'Fink, B., Grammer, K., & Matts, P. J.',
    year: '2006',
    title: 'Visible skin color distribution plays a role in the perception of age, attractiveness, and health in female faces',
    source: 'Evolution and Human Behavior, 27(6), 433-442',
  },
  {
    authors: 'Samson, N., Fink, B., & Matts, P. J.',
    year: '2010',
    title: 'Visible skin condition and perception of human facial appearance',
    source: 'International Journal of Cosmetic Science, 32(3), 167-184',
  },
  {
    authors: 'Coetzee, V., Perrett, D. I., & Stephen, I. D.',
    year: '2010',
    title: 'Facial adiposity: a cue to health?',
    source: 'Perception, 39(4), 542-551',
  },
  {
    authors: 'Axelsson, J., et al.',
    year: '2010',
    title: 'Beauty sleep: experimental study on the perceived health and attractiveness of sleep deprived people',
    source: 'BMJ, 341, c6614',
  },
  {
    authors: 'Naini, F. B.',
    year: '2011',
    title: 'Facial Aesthetics: Concepts and Clinical Diagnosis',
    source: 'Wiley-Blackwell',
  },
  {
    authors: 'Bashour, M.',
    year: '2006',
    title: 'History and current concepts in the analysis of facial attractiveness',
    source: 'Plastic and Reconstructive Surgery, 118(3), 741-756',
  },
]

export const CHAT_STARTERS_WITH_REPORT: string[] = [
  'What should I improve first?',
  'What haircut suits my face?',
  'Build a simple skin routine.',
  'Which parts are genetic?',
]

export const CHAT_STARTERS_GENERAL: string[] = [
  'What does the analysis measure?',
  'How should I take the photo?',
  'What actually improves attractiveness?',
  'How is the score calculated?',
]
