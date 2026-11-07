# Kefmaxxing

Kefmaxxing is a facial-aesthetics analysis app. One photo in, a transparent 10-point assessment out, with dimension-by-dimension notes, a realistic improvement plan and a contextual chat assistant.

It is deliberately not a single-metric "PSL score" site. The overall score is a weighted composite across structure, presentation and holistic appeal. The PSL-style structural index is shown separately as a secondary readout.

## What the app does

- Accepts a single front-facing photo (JPEG, PNG or WebP) with a male or female reference standard.
- Scores 10 dimensions on a 1.0-10.0 scale:
  - **Structure (59%)**: facial harmony, proportions and symmetry, eye area, midface, jawline and chin, cheekbones and definition.
  - **Presentation (23%)**: skin quality, hair, grooming.
  - **Gestalt (18%)**: overall appeal.
- Computes the headline score as a fixed weighted composite, not an equal average.
- Shows a secondary **PSL-style structural index** derived from the six structure dimensions.
- Produces a detailed read, strengths, improvement areas, hair guidance, skincare suggestions, grooming guidance and a prioritised plan.
- Includes a **hair halo** score: how well the current cut suits the specific face. A halo of 9.0 or above adds at least two subtiers to the overall score.
- Separates traits that are largely genetic from presentation changes that are realistically achievable.
- Provides a persistent chat assistant, Kef, that can answer general questions before a rating and report-specific questions afterwards.
- Does not store photos. There is no account, profile or gallery.

## Scoring method

The model scores each dimension from 1.0 to 10.0 with a note explaining what drove the score. The API then computes the overall score with fixed weights:

| Group | Weight | Dimensions |
| --- | ---: | --- |
| Structure | 59% | harmony 13%, proportions 11%, eye area 11%, midface 7%, jawline 10%, cheekbones 7% |
| Presentation | 23% | skin 10%, hair 8%, grooming 5% |
| Gestalt | 18% | overall appeal 18% |

`5.0` is the population midpoint. A hair halo of 9.0 or above adds at least two subtiers (0.7) to the overall; a halo of 8.0 or above adds one subtier (0.35). The lookism rank bands are:

| Score | Rank |
| --- | --- |
| 9.0-10.0 | Chad |
| 8.0-8.9 | Chadlite |
| 7.0-7.9 | HTN (High Tier Normie) |
| 6.0-6.9 | MTN (Mid Tier Normie) |
| 5.0-5.9 | LTN (Low Tier Normie) |
| 4.0-4.9 | Sub-5 |
| 3.0-3.9 | Sub-4 |
| 1.0-2.9 | Sub-3 |

The PSL-style index is a weighted average of the structure dimensions, normalised to the same 1.0-10.0 scale. It is inspired by internet looksmaxxing culture, not a clinical or scientific instrument, and it does not drive the headline score.

## Evidence stance

The app distinguishes between:

- **More directly observable cues**: visible skin texture, hair, grooming, approximate proportions and symmetry, visible jaw and cheekbone definition.
- **Partly observable cues**: bone structure under soft tissue, body composition, eye-area detail in poor lighting.
- **Subjective or contextual judgements**: overall appeal, dimorphism preferences, archetype, style.
- **Not assessed**: health, personality, intelligence, worth.

The method section also includes an honest evidence hierarchy. Sun protection, not smoking, basic skin care and haircut changes have the strongest practical support. Mewing, gua sha, jaw exercises and bone smashing are labelled limited or unsafe. The app does not fabricate research claims, percentiles or precision.

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons.
- **Backend**: Vercel serverless functions in `api/`.
- **Model providers**: an OpenAI-compatible provider chain configured through environment variables. The rating endpoint uses vision-capable models; the chat endpoint uses the same chain.
- **Local development**: Vite middleware shims `/api/rate` and `/api/chat` so the same code runs locally.

## Local setup

```bash
npm install
npm run dev
```

The dev server runs Vite and proxies the API routes through `vite.config.ts`.

### Environment variables

Create `.env.local` with the providers you want to use. Do not commit real keys.

```bash
GEMINI_API_KEY="key-one,key-two"
GEMINI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai"
GEMINI_MODELS="gemini-3.1-flash-lite,gemini-3-flash-preview"

UNOROUTER_API_KEY="..."
UNOROUTER_BASE_URL="https://api.unorouter.com/v1"
UNOROUTER_MODELS="claude-sonnet-4.5"

OPENROUTER_API_KEY="..."
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
OPENROUTER_MODELS="nvidia/nemotron-3.5-lightning:free"
```

The provider chain falls back across configured providers and keys. The rating endpoint requires a vision-capable model.

## Project structure

```
api/
  _agnes.js          Chat model call with fallback chain
  _providers.js      Provider chain construction
  chat.js            Chat endpoint
  rate.js            Rating endpoint, prompt and report sanitisation
src/
  components/
    AnalyzerSection.tsx
    Analyzing.tsx
    ChatDock.tsx
    Footer.tsx
    Header.tsx
    Hero.tsx
    MethodSection.tsx
    ReportView.tsx
    ui.tsx
  lib/
    api.ts
    content.ts
    image.ts
    types.ts
    useCopy.ts
    utils.ts
  App.tsx
  index.css
  main.tsx
```

## Privacy

Photos are compressed in the browser, sent to the rating endpoint, processed once and not written to storage by the app. There is no account or gallery. The image is sent to the configured third-party model provider to generate the report, so that provider processes it under its own data policy. The chat sends the report context and the conversation history, not the photo, to the configured model provider.

## Disclaimer

This is cosmetic and grooming guidance, not medical advice. Attractiveness is partly subjective and culturally variable. A score describes one photo against a chosen reference, not a person's worth. See a qualified professional for skin, dental, jaw or mental health concerns.
