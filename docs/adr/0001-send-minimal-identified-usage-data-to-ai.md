---
status: accepted
---

# Send minimal identified usage data to the AI summary provider

The management summary needs to identify high-usage employees by name, so the AI provider receives each user's name together with aggregated usage metrics. Email addresses, internal user IDs, authentication data, raw booking purposes, maintenance descriptions, and maintenance reporters are excluded because they do not add enough management value to justify the additional privacy and prompt-injection risk; administrators remain responsible for interpreting the summary and making allocation decisions.

## Consequences

Employee names leave the application boundary when an Admin explicitly generates a summary. The integration must document this disclosure, limit access to Admins, and allow the data boundary to be reviewed if organizational privacy policy changes.

The first version does not persist the prompt or generated summary. Operational logs may contain only non-content metadata such as the requesting Admin, timestamp, model, latency, token usage, and success or failure; they must not contain submitted names, prompt content, or response content. The generated result is shown only in the current page session and must be requested again after a refresh or filter change. The server may keep the result in a non-durable cache for up to 10 minutes for the same filters and unchanged source data, but it must not store that cached content in the database or durable logs.
