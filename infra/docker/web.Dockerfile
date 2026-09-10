FROM node:22-bookworm-slim AS build
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/ apps/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @taxone/web build
RUN pnpm --filter @taxone/web deploy --prod /prod

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /workspace
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=build --chown=nextjs:nodejs /prod/ ./
USER nextjs
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
