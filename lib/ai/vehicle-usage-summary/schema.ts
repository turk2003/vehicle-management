import { z } from "zod"

export const EvidenceInsightSchema = z.object({
  insight: z.string().min(1).max(600),
  evidenceMetricKeys: z.array(z.string().min(1).max(120)).max(5),
})

export const UserUsageInsightSchema = z.object({
  userRef: z.string().regex(/^u\d+$/),
  insight: z.string().min(1).max(500),
  evidenceMetricKeys: z.array(z.string().min(1).max(120)).max(5),
})

export const RecommendationSchema = z.object({
  recommendation: z.string().min(1).max(500),
  reason: z.string().min(1).max(500),
  evidenceMetricKeys: z.array(z.string().min(1).max(120)).max(5),
})

export const VehicleUsageSummarySchema = z.object({
  executiveSummary: z.string().min(1).max(900),
  vehicleUsageInsights: z.array(EvidenceInsightSchema).min(1).max(5),
  userUsageInsights: z.array(UserUsageInsightSchema).min(1).max(5),
  maintenanceInsights: z.array(EvidenceInsightSchema).min(1).max(5),
  recommendations: z.array(RecommendationSchema).min(1).max(5),
  dataLimitations: z.array(z.string().min(1).max(500)).max(10),
})

export type VehicleUsageSummary = z.infer<typeof VehicleUsageSummarySchema>

export type EvidenceValue = {
  label: string
  value: number | string | null
  unit: string | null
  subject: string | null
}

export type VehicleUsageSummaryResponse = {
  status: "READY"
  summary: VehicleUsageSummary
  evidence: Record<string, EvidenceValue>
  users: Record<string, { name: string }>
  generatedAt: string
  model: string
  cached: boolean
}
