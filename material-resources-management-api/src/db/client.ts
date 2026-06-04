import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '../config/env.ts'
import * as schema from './schema.ts'

const queryClient = postgres(env.databaseUrl, {
  max: 10,
  prepare: false,
})

export const db = drizzle({ client: queryClient, schema })
export type Db = typeof db
// The transaction callback receives a tx with the same query surface as `db`
// (insert/update/select/delete/query). Helpers that should participate in a
// caller-owned transaction accept `Executor` and default to `db`.
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type Executor = Db | Tx
export { schema }
