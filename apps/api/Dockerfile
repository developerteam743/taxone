FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/accounting/package.json packages/accounting/package.json
COPY packages/gst/package.json packages/gst/package.json
COPY packages/database/package.json packages/database/package.json
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm --filter @taxone/api build
EXPOSE 4000
CMD ["node","apps/api/dist/main.js"]
