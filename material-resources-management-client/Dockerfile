# syntax=docker/dockerfile:1.7
# React + Vite client — built with Bun, served by nginx.
FROM oven/bun:1.3.9-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY material-resources-management-api/package.json material-resources-management-api/package.json
COPY material-resources-management-client/package.json material-resources-management-client/package.json
COPY packages packages
RUN bun install --frozen-lockfile

FROM deps AS build
# Build-time variable baked into the static bundle by Vite.
ARG VITE_API_BASE_URL=http://localhost:3001
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY tsconfig.base.json ./
COPY material-resources-management-client material-resources-management-client
WORKDIR /app/material-resources-management-client
RUN bun run build

FROM nginx:1.27-alpine AS run
COPY --from=build /app/material-resources-management-client/dist /usr/share/nginx/html
COPY material-resources-management-client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
