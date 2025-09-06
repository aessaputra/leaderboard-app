# Production Dockerfile (multi-stage) for Next.js + Prisma + PNPM

FROM node:20-slim AS deps
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-slim AS builder
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm prisma generate
COPY . .
# Build with standalone output (set in next.config.mjs)
RUN pnpm build

FROM node:20-slim AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nextjs \
  && adduser --system --uid 1001 nextjs

# Copy built artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/worker ./worker
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Include Prisma CLI and engines for migrations at runtime
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

# Run migrations then start the server
CMD sh -lc "node ./node_modules/prisma/build/index.js migrate deploy && node server.js"
