import type { SessionInfo, SessionUser } from '../auth/auth.ts'

export type AppVariables = {
  user: SessionUser | null
  session: SessionInfo | null
  requestId: string
}

export type AppEnv = {
  Variables: AppVariables
}
