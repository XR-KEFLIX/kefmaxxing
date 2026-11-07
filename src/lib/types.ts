export type Gender = 'male' | 'female'

export type Influence = 'structural' | 'mixed' | 'modifiable'
export type DimensionGroup = 'structure' | 'presentation' | 'gestalt'
export type EvidenceLevel = 'strong' | 'moderate' | 'limited'
export type Impact = 'High' | 'Medium' | 'Low'
export type Effort = 'Low' | 'Medium' | 'High'
export type ScanStatus = 'idle' | 'analyzing' | 'done' | 'error'

export interface CategoryScore {
  key: string
  name: string
  group: DimensionGroup
  weight: number
  score: number
  note: string
  influence: Influence
}

export interface ScoreComponent {
  key: string
  name: string
  group: DimensionGroup
  weight: number
  score: number
  contribution: number
  influence: Influence
}

export interface InsightItem {
  name: string
  category: string
  influence: Influence
  note: string
}

export interface PlanItem {
  rank: number
  action: string
  category: string
  impact: Impact
  effort: Effort
  evidence: EvidenceLevel
  timeframe: string
  detail: string
  addresses: string
}

export interface RoadmapPhase {
  phase: string
  focus: string
  actions: string[]
}

export interface HairRecommendation {
  faceShape: string
  direction: string
  styles: string[]
  avoid: string[]
  note: string
}

export interface SkincareRecommendation {
  am: string[]
  pm: string[]
  ingredients: string[]
  note: string
}

export interface GroomingRecommendation {
  brows: string
  facialHair: string
  general: string[]
  note: string
}

export interface GeneticVsModifiable {
  genetic: string[]
  modifiable: string[]
  note: string
}

export interface RatingReport {
  overall: number
  potential: number
  band: string
  bandNote: string
  level: 'low' | 'mid' | 'high'
  structuralIndex: number
  appealIndex: number
  confidence: number
  archetype: string
  faceShape: string
  summary: string
  analysis: string
  categories: CategoryScore[]
  scoreBreakdown: ScoreComponent[]
  strengths: InsightItem[]
  improvements: InsightItem[]
  plan: PlanItem[]
  roadmap: RoadmapPhase[]
  hair: HairRecommendation
  skincare: SkincareRecommendation
  grooming: GroomingRecommendation
  geneticVsModifiable: GeneticVsModifiable
  photoNotes: string
}

export interface RateResponse {
  ok: boolean
  model: string
  provider: string
  report: RatingReport
}

export interface ChatMessage {
  role: 'user' | 'coach'
  content: string
}
