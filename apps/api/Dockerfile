FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/accounting/package.json packages/accounting/package.json
COPY packages/gst/package.json packages/gst/package.json
COPY packages/database/package.json packages/database/package.json
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm --filter @taxone/api build
RUN chown -R node:node /app
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:4000/api/v1/health >/dev/null || exit 1
CMD ["node","apps/api/dist/main.js"]
