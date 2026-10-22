# LuxePrizeDraw — full-stack demo (frontend build + Express/WebSocket server)
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
# Retry-friendly npm settings: transient registry/network blips shouldn't fail the build
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 15000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 600000 \
 && npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 15000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 600000 \
 && npm ci --omit=dev --no-audit --no-fund
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
# data/ holds the local JSON account store when Redis is not configured
RUN mkdir -p data
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
