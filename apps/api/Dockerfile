FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.30.1

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy required packages and the api app
COPY packages/common ./packages/common
COPY packages/config ./packages/config
COPY packages/database ./packages/database
COPY apps/api ./apps/api

# Install all dependencies (devDeps needed for build & prisma generate)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter @pearl/database db:generate

# Build the API
RUN pnpm --filter @pearl/api build

# ---- Production image ----
FROM node:22-slim

WORKDIR /app

# openssl is required by the Prisma query engine at runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install pnpm (needed for the entrypoint db:push and db:generate)
RUN npm install -g pnpm@10.30.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/common ./packages/common
COPY packages/config ./packages/config
COPY packages/database ./packages/database
COPY apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Install production dependencies only (prisma CLI is now in deps, so it will be installed)
RUN pnpm install --prod --frozen-lockfile

# Generate Prisma Client using the production engine binaries
RUN pnpm --filter @pearl/database db:generate

# Copy the entrypoint script
COPY apps/api/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
