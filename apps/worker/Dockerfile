FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-workspace.yaml ./
COPY apps/worker/package.json apps/worker/package.json
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm --filter @taxone/worker build
CMD ["node","apps/worker/dist/main.js"]
