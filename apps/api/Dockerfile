FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY . .
RUN pnpm install --no-frozen-lockfile && pnpm build
EXPOSE 4000
CMD ["node","dist/main.js"]
