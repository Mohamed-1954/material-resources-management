# syntax=docker/dockerfile:1.7
# Hono + Better-Auth + Drizzle API — runs the TypeScript source directly with Bun.
FROM oven/bun:1.3.9-alpine AS deps
WORKDIR /app

# Workspace manifests first for cacheable dep install.
COPY package.json bun.lock ./
COPY material-resources-management-api/package.json material-resources-management-api/package.json
COPY material-resources-management-client/package.json material-resources-management-client/package.json
COPY packages packages
RUN bun install --frozen-lockfile

FROM deps AS runtime
WORKDIR /app
COPY tsconfig.base.json ./
COPY material-resources-management-api material-resources-management-api

WORKDIR /app/material-resources-management-api
ENV NODE_ENV=production
EXPOSE 3001

# Liveness probe — busybox wget ships with the alpine base.
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

# Apply pending Drizzle migrations on cold start, then serve the API.
# Postgres readiness is enforced by docker-compose `depends_on.condition: service_healthy`.
CMD ["sh", "-c", "bun run src/db/migrate.ts && exec bun run src/index.ts"]
