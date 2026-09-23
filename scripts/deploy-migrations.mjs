import { spawnSync } from "node:child_process"

if (process.env.VERCEL_ENV !== "production") {
  process.exit(0)
}

const pooledUrl = process.env.DATABASE_URL
if (!pooledUrl) {
  throw new Error("DATABASE_URL is required for production migrations")
}

const directUrl = new URL(pooledUrl)
if (directUrl.hostname !== "pooled.db.prisma.io") {
  throw new Error("Expected a pooled Prisma Postgres DATABASE_URL in production")
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
