FROM node:22-bookworm-slim AS build
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/ apps/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @taxone/api build
RUN pnpm --filter @taxone/api deploy --prod /prod

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /workspace
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs apiuser \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=build --chown=apiuser:nodejs /prod/ ./
USER apiuser
EXPOSE 4000
CMD ["node", "dist/main.js"]
