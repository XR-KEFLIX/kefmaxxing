export type Gender = 'male' | 'female' export type Influence = 'structural' | 'mixed' | 'modifiable'
export type DimensionGroup = 'structure' | 'presentation' | 'gestalt'
export type EvidenceLevel = 'strong' | 'moderate' | 'limited'
export type Impact = 'High' | 'Medium' | 'Low'
export type Effort = 'Low' | 'Medium' | 'High'
export type ScanStatus = 'idle' | 'analyzing' | 'done' | 'error' export interface CategoryScore { key name group weight score note influence
} export interface ScoreComponent { key name group weight score contribution influence
} export interface InsightItem { name category influence note
} export interface PlanItem { rank action category impact effort evidence timeframe detail addresses
} export interface RoadmapPhase { phase focus actions[]
} export interface HairRecommendation { faceShape direction styles[] avoid[] note
} export interface SkincareRecommendation { am[] pm[] ingredients[] note
} export interface GroomingRecommendation { brows facialHair general[] note
} export interface GeneticVsModifiable { genetic[] modifiable[] note
} export interface RatingReport { overall potential band bandNote level: 'low' | 'mid' | 'high' structuralIndex appealIndex hairHalo hairBonus confidence archetype faceShape summary analysis categories: CategoryScore[] scoreBreakdown: ScoreComponent[] strengths: InsightItem[] improvements: InsightItem[] plan: PlanItem[] roadmap: RoadmapPhase[] hair: HairRecommendation skincare: SkincareRecommendation grooming: GroomingRecommendation geneticVsModifiable: GeneticVsModifiable photoNotes
} export interface RateResponse { ok model provider report: RatingReport
} export interface ChatMessage { role: 'user' | 'coach' content
}
