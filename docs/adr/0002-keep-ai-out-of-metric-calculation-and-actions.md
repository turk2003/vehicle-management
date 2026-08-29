---
status: accepted
---

# Keep AI out of metric calculation and operational actions

The vehicle usage summary uses application-computed metrics as its only source of quantitative truth. GPT-5.6 Luna interprets those metrics in Thai and proposes policy-level recommendations, but it does not calculate source metrics, classify users or vehicles into deterministic risk states, assign a vehicle to a person, infer that usage caused a breakdown, predict maintenance, or mutate application state. The application displays deterministic evidence next to generated insights and rejects a response whose references, names, or values do not match the computed dataset.

## Consequences

The history report and the AI endpoint must share one server-side analysis module so their figures cannot drift. The AI output uses a strict structured schema and may reference only evidence keys supplied by the application. Administrators retain responsibility for allocation and maintenance decisions. A provider failure leaves the deterministic report available and produces no fabricated fallback summary.
