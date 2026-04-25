FROM node:20-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:20-bookworm-slim

WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
ENV NODE_ENV=production
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
