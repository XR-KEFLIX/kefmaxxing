export const SCORE_BANDS = [
  { min: 9.0, label: 'Exceptional', note: 'Everything works together and reads as highly distinctive.' },
  { min: 8.0, label: 'Very attractive', note: 'Clearly strong overall with very few visible drags.' },
  { min: 7.0, label: 'Attractive', note: 'Noticeably above average, with clear strengths.' },
  { min: 6.0, label: 'Above average', note: 'A few features work clearly in your favour.' },
  { min: 5.0, label: 'Average', note: 'Around the population midpoint. Presentation changes can move the read.' },
  { min: 4.0, label: 'Below average', note: 'Several visible factors pull the read down.' },
  { min: 3.0, label: 'Well below average', note: 'Several visible problems are present. Presentation can still change a lot.' },
  { min: 1.0, label: 'Far below average', note: 'Multiple features sit outside common ranges. A structured plan matters most.' },
]

export const DIMENSIONS = [
  { key: 'harmony', name: 'Facial Harmony', group: 'structure', weight: 0.13, short: 'Whether the features belong together.', influence: 'structural' },
  { key: 'proportions', name: 'Proportions & Symmetry', group: 'structure', weight: 0.11, short: 'Thirds, fifths, approximate symmetry, general balance.', influence: 'structural' },
  { key: 'eyeArea', name: 'Eye Area', group: 'structure', weight: 0.11, short: 'Canthal tilt, spacing, shape, lid exposure and the under-eye.', influence: 'structural' },
  { key: 'midface', name: 'Midface', group: 'structure', weight: 0.07, short: 'Compactness, projection, cheek support and nose balance.', influence: 'structural' },
  { key: 'jawline', name: 'Jawline & Chin', group: 'structure', weight: 0.1, short: 'Definition, gonial angle, chin projection and lower-third balance.', influence: 'mixed' },
  { key: 'cheekbones', name: 'Cheekbones & Definition', group: 'structure', weight: 0.07, short: 'Malar prominence and how sharply the bone reads through soft tissue.', influence: 'mixed' },
  { key: 'skin', name: 'Skin Quality', group: 'presentation', weight: 0.1, short: 'Texture, clarity, tone, shine and the under-eye.', influence: 'modifiable' },
  { key: 'hair', name: 'Hair', group: 'presentation', weight: 0.08, short: 'Hairline, density, cut, styling, how it frames the face.', influence: 'modifiable' },
  { key: 'grooming', name: 'Grooming', group: 'presentation', weight: 0.05, short: 'Brows, facial hair and deliberate presentation.', influence: 'modifiable' },
  { key: 'appeal', name: 'Overall Appeal', group: 'gestalt', weight: 0.18, short: 'The combined impression. How the whole thing reads, beyond any single measurement.', influence: 'mixed' },
]

export const FRAMEWORK_GROUPS = [
  { key: 'structure', label: 'Structure', weight: 0.59, description: 'Harmony, proportions, eyes, midface, jawline and cheekbones.', keys: ['harmony', 'proportions', 'eyeArea', 'midface', 'jawline', 'cheekbones'] },
  { key: 'presentation', label: 'Presentation', weight: 0.23, description: 'Skin, hair and grooming. The parts you can change most directly.', keys: ['skin', 'hair', 'grooming'] },
  { key: 'gestalt', label: 'Overall appeal', weight: 0.18, description: 'The holistic impression, weighted on its own so no single feature dominates.', keys: ['appeal'] },
]

export const DELIVERABLES = [
  { title: 'A score out of 10', body: 'A weighted composite with a band, so you know where you actually sit.' },
  { title: 'Ten scores, one photo', body: 'Every dimension scored separately with a note on what drove it, and your strongest and weakest areas.' },
  { title: 'A plan you can follow', body: 'Grooming, hair, skin and lifestyle steps ranked by impact, with honest evidence tags.' },
  { title: 'Genetic vs changeable', body: 'A straight split between the structure you cannot change and the presentation you can.' },
  { title: 'A chat with Kef', body: 'Ask follow-up questions about your report, your plan or the method. Available right away.' },
]

export const PHOTO_PROTOCOL = [
  { title: 'Front-facing', detail: 'Camera at eye level, face square to the lens.' },
  { title: 'Even light', detail: 'Soft, indirect light. Skip flash, ring lights and hard shadows.' },
  { title: 'Neutral expression', detail: 'Relaxed face, eyes open, no smiling or posing.' },
  { title: 'No filters', detail: 'No beauty mode, edits, heavy makeup or lens distortion.' },
  { title: 'Hair back', detail: 'Where possible, keep the hairline and jaw visible.' },
]

export const PRIVACY_POINTS = [
  'Compressed in your browser before sending',
  'Processed once by the analysis endpoint',
  'The chat sends your report, not your photo',
]

export const EVIDENCE_LEVERS = [
  { title: 'Sun protection and not smoking', label: 'Strong evidence', tone: 'good', body: 'The most reliable thing you can do for visible skin ageing. Daily broad-spectrum sunscreen and staying away from smoke.' },
  { title: 'Body composition in a healthy range', label: 'Moderate evidence', tone: 'warn', body: 'Facial fullness changes how your jaw and cheekbones read. The goal is a healthy range, not a crash cut. Severe restriction is not a looksmaxxing shortcut.' },
  { title: 'Sleep and under-eye appearance', label: 'Moderate evidence', tone: 'warn', body: 'Short sleep shows. People look less healthy and less attractive when they are run down. Seven to nine hours is the practical target.' },
  { title: 'Haircut and styling', label: 'Moderate evidence', tone: 'warn', body: 'A cut changes how the face is framed, quickly. Face-shape matching is a useful stylist heuristic, not a rule. Your hair type and growth pattern matter more than any chart.' },
  { title: 'Basic skin care', label: 'Strong evidence', tone: 'good', body: 'A gentle cleanser, moisturiser and sunscreen are the foundation. Retinoids have real evidence behind them, but go slowly and see a professional if you have persistent problems.' },
  { title: 'Brow and facial-hair grooming', label: 'Moderate evidence', tone: 'warn', body: 'Small, reversible changes that sharpen the eye area and lower-face frame. Keep your natural shape and do not over-pluck.' },
  { title: 'Mewing, gua sha and massage', label: 'Limited evidence', tone: 'neutral', body: 'There is no decent evidence these reshape adult bone. Massage can briefly reduce puffiness. Be sceptical of lasting structural claims.' },
  { title: 'Jaw exercises and hard chewing', label: 'Limited evidence', tone: 'neutral', body: 'Masseter growth may change how the lower face looks for some people. The evidence is thin, and overuse can hurt your jaw or trigger TMJ problems. Not a reliable bone-building method.' },
  { title: 'Bone smashing', label: 'Avoid', tone: 'bad', body: 'Do not do this. It is dangerous, unproven and can leave permanent damage. No responsible analysis recommends it.' },
]

export const FAQ_ITEMS = [
  { q: 'Is the score objective?', a: 'No. It is an estimate from one photo. The method is consistent, but different photos, lighting and models can produce different readings.' },
  { q: 'Why does my score change between photos?', a: 'Perspective, light, expression, compression and filters can shift the read by a meaningful amount. If you want to track progress, use the same camera, distance, room and light each time.' },
  { q: 'What is the PSL-style structural index?', a: 'A secondary readout built from the six structure dimensions. It is inspired by internet looksmaxxing culture, not by science, and it is not the overall score.' },
  { q: 'What do the score bands mean?', a: 'The bands describe where the overall score sits: Far below average, Well below average, Below average, Average, Above average, Attractive, Very attractive, and Exceptional. They are photo-based estimates, not labels for a person.' },
  { q: 'What is the hair halo?', a: 'A separate score for how well your current hair and cut suit your specific face. A hair halo of 9.0 or above adds at least two subtiers to the overall score. Great hair on the wrong face does not count.' },
  { q: 'Can I change my bone structure?', a: 'Not after growth, short of surgery. Body composition, skin, hair and grooming change how your existing structure reads. Be sceptical of anyone selling non-surgical bone change.' },
  { q: 'Does mewing work?', a: 'There is no good evidence it reshapes adult bone. It may help some people with oral posture or nasal breathing. It is not a substitute for orthodontic or medical care.' },
  { q: 'Do jaw exercises work?', a: 'They can grow the masseter muscles in some people, which may change how the lower face looks. The evidence is limited, and overdoing it can cause pain or TMJ problems. Do not force it.' },
  { q: 'How is gender handled?', a: 'You pick a male or female reference standard, and the analysis compares what it sees to that reference. It does not infer your identity or make claims about who you are.' },
  { q: 'What if I wear makeup, a beard or a filter?', a: 'They change the read. The report lowers its confidence and notes it when relevant. For the cleanest comparison, use a neutral photo.' },
  { q: 'Is a low score an insult?', a: 'No. The score describes one photo against a chosen reference. The plan focuses on the parts you can actually change.' },
]

export const CHAT_STARTERS_WITH_REPORT = [
  'What should I improve first?',
  'What haircut suits my face?',
  'Build me a simple skin routine.',
  'Which parts are just genetics?',
]

export const CHAT_STARTERS_GENERAL = [
  'What does the analysis measure?',
  'How should I take the photo?',
  'What actually improves attractiveness?',
  'How is the score calculated?',
]
