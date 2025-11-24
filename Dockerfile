FROM node:22-alpine AS base



FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force
COPY . .

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Create data directories for SQLite database and logs
RUN mkdir -p /app/data/database /app/data/logs && \
    chown -R nuxtjs:nodejs /app/data

# Copy built application
COPY --from=builder --chown=nuxtjs:nodejs /app/.output /app/.output
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json /app/package.json

USER nuxtjs

EXPOSE 3000

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", ".output/server/index.mjs"]
