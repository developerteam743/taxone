FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm --filter @taxone/web build
EXPOSE 3000
CMD ["pnpm","--filter","@taxone/web","start"]
