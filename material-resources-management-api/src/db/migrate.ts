import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

import { env } from '../config/env.ts'

async function main(): Promise<void> {
  const client = postgres(env.databaseUrl, { max: 1 })
  const db = drizzle({ client })
  await migrate(db, { migrationsFolder: './drizzle' })
  await client.end()
  console.log('Migrations applied.')
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
