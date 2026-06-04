import type { Config } from 'drizzle-kit'

// Mirrors src/config/env.ts dev default — host-mapped Postgres on 15432
// (see infra/docker-compose.yml).
const databaseUrl =
  process.env.DATABASE_URL ?? 'postgres://faculty:faculty@localhost:15432/faculty_resources'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
} satisfies Config
