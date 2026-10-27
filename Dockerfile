# LuxePrizeDraw — full-stack demo (frontend build + Express/WebSocket server)
# node:20-slim (glibc) instead of alpine: musl DNS resolution is a common cause
# of flaky npm registry fetches inside Docker builds.
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
# Retry-friendly npm settings + an outer retry loop: transient registry/network
# blips shouldn't fail the build.
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 15000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 600000 \
 && for i in 1 2 3 4 5; do \
      npm ci --no-audit --no-fund && break; \
      echo "npm ci attempt $i failed — retrying in 20s"; sleep 20; \
      if [ "$i" = "5" ]; then exit 1; fi; \
    done
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 15000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 600000 \
 && for i in 1 2 3 4 5; do \
      npm ci --omit=dev --ignore-scripts --no-audit --no-fund && break; \
      echo "npm ci attempt $i failed — retrying in 20s"; sleep 20; \
      if [ "$i" = "5" ]; then exit 1; fi; \
    done
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
# data/ holds the local JSON account store when Redis is not configured
RUN mkdir -p data
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
