FROM node:22-bookworm-slim AS build
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/ apps/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @taxone/worker build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /workspace
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs workeruser
COPY --from=build --chown=workeruser:nodejs /workspace/ ./
USER workeruser
CMD ["node", "apps/worker/dist/main.js"]
