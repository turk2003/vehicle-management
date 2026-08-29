import OpenAI from "openai"
import { zodTextFormat } from "openai/helpers/zod"
import type { VehicleUsageAnalysis } from "@/lib/vehicle-usage-analysis"
import { buildVehicleUsageAiPayload } from "./payload"
import { VEHICLE_USAGE_SUMMARY_INSTRUCTIONS } from "./prompt"
import {
  VehicleUsageSummarySchema,
  type VehicleUsageSummaryResponse,
} from "./schema"
import { validateAiSummary } from "./validate"

export class AiSummaryUnavailableError extends Error {
  constructor(
    message: string,
    readonly attempts: number,
    readonly status?: number,
  ) {
    super(message)
  }
}

export type AiGenerationMetadata = {
  model: string
  attempts: number
  latencyMs: number
  inputTokens: number | null
  outputTokens: number | null
}

let client: OpenAI | null = null

function getOpenAiClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new AiSummaryUnavailableError("OPENAI_API_KEY is not configured", 0)
  }
  client ||= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 0,
  })
  return client
}

function getStatus(error: unknown) {
  return error instanceof OpenAI.APIError ? error.status : undefined
}

export async function generateVehicleUsageSummary(
  analysis: VehicleUsageAnalysis,
): Promise<{
  result: Omit<VehicleUsageSummaryResponse, "cached">
  metadata: AiGenerationMetadata
}> {
  const openai = getOpenAiClient()
  const model = process.env.OPENAI_VEHICLE_SUMMARY_MODEL || "gpt-5.6-luna"
  const { payload, evidence, users } = buildVehicleUsageAiPayload(analysis)
  const startedAt = Date.now()
  let latestError: unknown

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await openai.responses.parse(
        {
          model,
          instructions: VEHICLE_USAGE_SUMMARY_INSTRUCTIONS,
          input: JSON.stringify(payload),
          reasoning: { effort: "low" },
          text: {
            format: zodTextFormat(
              VehicleUsageSummarySchema,
              "vehicle_usage_summary",
            ),
            verbosity: "low",
          },
          max_output_tokens: 1_800,
          store: false,
        },
        { timeout: 30_000, maxRetries: 0 },
      )

      if (!response.output_parsed) {
        throw new Error("The model did not return a parsed summary")
      }

      const summary = validateAiSummary(
        response.output_parsed,
        new Set(Object.keys(evidence)),
        users,
        analysis.dataLimitations,
      )

      return {
        result: {
          status: "READY",
          summary,
          evidence,
          users,
          generatedAt: new Date().toISOString(),
          model,
        },
        metadata: {
          model,
          attempts: attempt,
          latencyMs: Date.now() - startedAt,
          inputTokens: response.usage?.input_tokens ?? null,
          outputTokens: response.usage?.output_tokens ?? null,
        },
      }
    } catch (error) {
      latestError = error
      const status = getStatus(error)
      if (status === 400 || status === 401 || status === 403) {
        throw new AiSummaryUnavailableError(
          "OpenAI request was rejected",
          attempt,
          status,
        )
      }
    }
  }

  throw new AiSummaryUnavailableError(
    latestError instanceof Error ? latestError.message : "AI summary failed",
    2,
    getStatus(latestError),
  )
}
