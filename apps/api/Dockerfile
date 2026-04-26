FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy required packages and the api app
COPY packages/common ./packages/common
COPY packages/config ./packages/config
COPY packages/database ./packages/database
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter @pearl/database db:generate

# Build the api
RUN pnpm --filter @pearl/api build

# Final production stage
FROM node:22-alpine

WORKDIR /app

# Enable pnpm for production install
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/common ./packages/common
COPY packages/config ./packages/config
COPY packages/database ./packages/database
COPY apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Generate Prisma Client in production stage as well
RUN pnpm --filter @pearl/database db:generate

EXPOSE 3000

CMD ["node", "apps/api/dist/index.js"]
