export type Gender = 'male' | 'female'

export interface CategoryScore {
  key: string
  name: string
  score: number
  note: string
}

export interface FeatureNote {
  name: string
  note: string
}

export interface PlanItem {
  rank: number
  action: string
  impact: 'High' | 'Medium' | 'Low'
  evidence: 'strong' | 'moderate' | 'anecdotal'
  timeframe: string
  detail: string
}

export interface RoadmapPhase {
  phase: string
  focus: string
  actions: string[]
}

export interface RatingReport {
  overall: number
  potential: number
  tier: string
  subTier: string
  tierLabel: string
  archetype: string
  percentile: string
  confidence: number
  summary: string
  categories: CategoryScore[]
  halos: FeatureNote[]
  failos: FeatureNote[]
  plan: PlanItem[]
  roadmap: RoadmapPhase[]
  ascension: string
  photoNotes: string
}

export interface RateResponse {
  ok: boolean
  model: string
  report: RatingReport
}

export interface ChatMessage {
  role: 'user' | 'coach'
  content: string
}

export type ScanStatus = 'idle' | 'analyzing' | 'done' | 'error'
