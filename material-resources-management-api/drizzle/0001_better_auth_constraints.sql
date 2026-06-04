-- Better-Auth schema invariants & performance indexes.
-- These match what `npx @better-auth/cli generate` would emit for v1.6+.
-- Idempotent so safe to re-run on partially-migrated environments.

CREATE UNIQUE INDEX IF NOT EXISTS "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_expires_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "account_user_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_account_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_expires_idx" ON "verification" USING btree ("expires_at");
