# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile=false

FROM base AS api
WORKDIR /app
EXPOSE 4000
CMD ["pnpm", "--filter", "@taxone/api", "dev"]

FROM base AS web
WORKDIR /app
EXPOSE 3000
CMD ["pnpm", "--filter", "@taxone/web", "dev"]
