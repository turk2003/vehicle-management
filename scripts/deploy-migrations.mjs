import { spawnSync } from "node:child_process"

if (process.env.VERCEL_ENV !== "production") {
  process.exit(0)
}

const pooledUrl = process.env.DATABASE_URL
if (!pooledUrl) {
  throw new Error("DATABASE_URL is required for production migrations")
}

const directUrl = new URL(pooledUrl)
if (!["postgres:", "postgresql:"].includes(directUrl.protocol)) {
  throw new Error("Expected a PostgreSQL DATABASE_URL in production")
}
if (!["pooled.db.prisma.io", "db.prisma.io"].includes(directUrl.hostname)) {
  throw new Error(`Unexpected Prisma Postgres host: ${directUrl.hostname}`)
}
directUrl.hostname = "db.prisma.io"

const prisma = process.platform === "win32"
  ? "node_modules/.bin/prisma.cmd"
  : "node_modules/.bin/prisma"
const result = spawnSync(prisma, ["migrate", "deploy"], {
  env: { ...process.env, DIRECT_URL: directUrl.toString() },
  stdio: "inherit",
})

if (result.error) {
  throw result.error
}
process.exit(result.status ?? 1)
