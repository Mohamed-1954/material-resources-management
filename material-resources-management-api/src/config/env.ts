function readEnv(name: string, fallback?: string): string {
  const value = process.env[name]
  if (value !== undefined && value !== '') return value
  if (fallback !== undefined) return fallback
  throw new Error(`Missing required environment variable: ${name}`)
}

function readOptional(name: string): string | undefined {
  const value = process.env[name]
  return value !== undefined && value !== '' ? value : undefined
}

const nodeEnv = readEnv('NODE_ENV', 'development')
const isTestEnv = nodeEnv === 'test'
const isProdEnv = nodeEnv === 'production'

// Validators run lazily (via getters) so DB-only scripts like `db:migrate`/
// `db:seed` don't trip BETTER_AUTH_SECRET enforcement when they only need
// DATABASE_URL.
let _databaseUrl: string | undefined
function getDatabaseUrl(): string {
  if (_databaseUrl !== undefined) return _databaseUrl
  const fromEnv = process.env.DATABASE_URL
  if (fromEnv) {
    _databaseUrl = fromEnv
    return _databaseUrl
  }
  if (isProdEnv) {
    throw new Error('DATABASE_URL is required in production')
  }
  _databaseUrl = 'postgres://faculty:faculty@localhost:15432/faculty_resources'
  return _databaseUrl
}

let _betterAuthSecret: string | undefined
function getBetterAuthSecret(): string {
  if (_betterAuthSecret !== undefined) return _betterAuthSecret
  const fromEnv = process.env.BETTER_AUTH_SECRET
  if (fromEnv && fromEnv.length >= 32) {
    _betterAuthSecret = fromEnv
    return _betterAuthSecret
  }
  if (isTestEnv) {
    _betterAuthSecret = 'test-only-secret-do-not-use-anywhere-else-32c'
    return _betterAuthSecret
  }
  if (!fromEnv) {
    throw new Error(
      'BETTER_AUTH_SECRET is required. Generate one with `openssl rand -base64 32` and set it in your .env',
    )
  }
  throw new Error(
    `BETTER_AUTH_SECRET is too short (${fromEnv.length} chars). Required: >=32 chars.`,
  )
}

export const env = {
  nodeEnv,
  apiPort: Number.parseInt(readEnv('API_PORT', '3001'), 10),
  apiBaseUrl: readEnv('API_BASE_URL', 'http://localhost:3001'),
  webOrigin: readEnv('WEB_ORIGIN', 'http://localhost:5173'),
  get databaseUrl(): string {
    return getDatabaseUrl()
  },
  get betterAuthSecret(): string {
    return getBetterAuthSecret()
  },
  betterAuthUrl: readEnv('BETTER_AUTH_URL', 'http://localhost:3001'),
  trustedOrigins: readEnv('TRUSTED_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  github: {
    clientId: readOptional('GITHUB_CLIENT_ID'),
    clientSecret: readOptional('GITHUB_CLIENT_SECRET'),
  },
  google: {
    clientId: readOptional('GOOGLE_CLIENT_ID'),
    clientSecret: readOptional('GOOGLE_CLIENT_SECRET'),
  },
}

export const isProd = isProdEnv
export const isTest = isTestEnv
