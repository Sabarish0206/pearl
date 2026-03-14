# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- Web: React 19 + Vite + TypeScript (SPA) initialized in apps/web
- API: Express.js + TypeScript (REST API) initialized in apps/api
- Database: Prisma ORM + SQLite
- Build System: Turborepo
- Package Manager: pnpm

### Workspace Structure
pearl/
|- apps/
|  |- web/          (@pearl/web) - React Vite app
|  |- api/          (@pearl/api) - Express API
|- packages/
|  |- common/       (@pearl/common) - Shared utilities
|  |- config/       (@pearl/config) - Configuration package (Zod schemas)
|  |- database/     (@pearl/database) - Prisma schema
|- turbo.json        - Turborepo configuration
|- pnpm-workspace.yaml - Workspace configuration
|- .memory-bank/
   |- systemPatterns.md - Naming and typing conventions
   |- progress.md - Migration/setup progress
   |- activeContext.md - This file

### Naming Conventions
All packages follow the @pearl/ namespace:
- @pearl/web - Frontend application
- @pearl/api - Backend API
- @pearl/database - Database layer
- @pearl/common - Shared code/utilities
- @pearl/config - Configuration utilities (Environment Variable Types)

### API Setup Details
- Entry point: apps/api/src/index.ts
- Port: 3001 (default, fetched from root .env)
- CORS enabled for cross-origin requests
- Health check endpoint: GET /health (implemented, verifies DB connection)
- Middleware: Centralized logging middleware integrated
- Env: Validated by @pearl/config via Zod

### Web Client Setup Details
- Initialized React + Vite client in apps/web
- Configured with necessary build scripts
- Env: Validated by @pearl/config via Zod

### Database Schema
SQLite database with initial User model:
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

- Prisma Client v6.x singleton exported from packages/database/index.ts.
- `apps/api` successfully imports and connects to the Prisma Client.
- Root `.env` tracks the connection string.

### Development Scripts
Available at root level:
- pnpm dev - Start all dev servers via Turbo
- pnpm build - Build all packages
- pnpm lint - Lint all packages
- pnpm db:generate - Generate Prisma client
- pnpm db:push - Push schema to database

## Recent Changes
- Exported PrismaClient singleton from packages/database.
- Linked @pearl/database to apps/api.
- API connects to DB on startup and tests connection in the `/health` endpoint.
- Handled Prisma v7 experimental mismatches by standardizing on Prisma v6.x.
- Created root `.env` and `.env.example` to centralize environment variables.
- Scaffolded `@pearl/config` with `zod` for strictly typing and validating the environment.
- Integrated `zod` validation into `@pearl/api` (`dotenv` integration) and `@pearl/web` (`import.meta.env`).
- Fixed ESM export named issues by configuring `@pearl/config` with `"type": "module"`.
- Resolved database provider configuration mismatch to properly utilize SQLite and pushed schema.# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- Web: React 19 + Vite + TypeScript (SPA) initialized in apps/web
- API: Express.js + TypeScript (REST API) initialized in apps/api
- Database: Prisma ORM + PostgreSQL
- Build System: Turborepo
- Package Manager: pnpm

### Workspace Structure
pearl/
|- apps/
|  |- web/          (@pearl/web) - React Vite app
|  |- api/          (@pearl/api) - Express API
|- packages/
|  |- common/       (@pearl/common) - Shared utilities
|  |- config/       (@pearl/config) - Configuration package (Zod schemas)
|  |- database/     (@pearl/database) - Prisma schema
|- turbo.json        - Turborepo configuration
|- pnpm-workspace.yaml - Workspace configuration
|- docker-compose.yml - PostgreSQL database configuration
|- .memory-bank/
   |- systemPatterns.md - Naming and typing conventions
   |- progress.md - Migration/setup progress
   |- activeContext.md - This file

### Naming Conventions
All packages follow the @pearl/ namespace:
- @pearl/web - Frontend application
- @pearl/api - Backend API
- @pearl/database - Database layer
- @pearl/common - Shared code/utilities
- @pearl/config - Configuration utilities (Environment Variable Types)

### API Setup Details
- Entry point: apps/api/src/index.ts
- Port: 3001 (default, fetched from root .env)
- CORS enabled for cross-origin requests
- Health check endpoint: GET /health (implemented, verifies DB connection)
- Middleware: Centralized logging middleware integrated
- Env: Validated by @pearl/config via Zod

### Web Client Setup Details
- Initialized React + Vite client in apps/web
- Configured with necessary build scripts
- Env: Validated by @pearl/config via Zod

### Database Schema
PostgreSQL database with initial User model (dummy schema for setup):
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

- Prisma Client v6.x singleton exported from packages/database/index.ts.
- `apps/api` successfully imports and connects to the Prisma Client.
- Root `.env` tracks the connection string.

### Development Scripts
Available at root level:
- pnpm dev - Start all dev servers via Turbo
- pnpm build - Build all packages
- pnpm lint - Lint all packages
- pnpm db:generate - Generate Prisma client
- pnpm db:push - Push schema to database

## Recent Changes
- Exported PrismaClient singleton from packages/database.
- Linked @pearl/database to apps/api.
- API connects to DB on startup and tests connection in the `/health` endpoint.
- Handled Prisma v7 experimental mismatches by standardizing on Prisma v6.x.
- Created root `.env` and `.env.example` to centralize environment variables.
- Scaffolded `@pearl/config` with `zod` for strictly typing and validating the environment.
- Integrated `zod` validation into `@pearl/api` (`dotenv` integration) and `@pearl/web` (`import.meta.env`).
- Fixed ESM export named issues by configuring `@pearl/config` with `"type": "module"`.
- Transitioned Database from SQLite to PostgreSQL (added `docker-compose.yml` and updated connection strings).# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- Web: React 19 + Vite + TypeScript (SPA) initialized in apps/web
- API: Express.js + TypeScript (REST API) initialized in apps/api
- Database: Prisma ORM + PostgreSQL
- Build System: Turborepo
- Package Manager: pnpm

### Workspace Structure
pearl/
|- apps/
|  |- web/          (@pearl/web) - React Vite app
|  |- api/          (@pearl/api) - Express API
|- packages/
|  |- common/       (@pearl/common) - Shared utilities
|  |- config/       (@pearl/config) - Configuration package (Zod schemas)
|  |- database/     (@pearl/database) - Prisma schema
|- turbo.json        - Turborepo configuration
|- pnpm-workspace.yaml - Workspace configuration
|- docker-compose.yml - PostgreSQL database configuration
|- .memory-bank/
   |- systemPatterns.md - Naming and typing conventions
   |- progress.md - Migration/setup progress
   |- activeContext.md - This file

### Naming Conventions
All packages follow the @pearl/ namespace:
- @pearl/web - Frontend application
- @pearl/api - Backend API
- @pearl/database - Database layer
- @pearl/common - Shared code/utilities
- @pearl/config - Configuration utilities (Environment Variable Types)

### API Setup Details
- Entry point: apps/api/src/index.ts
- Port: 3001 (default, fetched from root .env)
- CORS enabled for cross-origin requests
- Health check endpoint: GET /health (implemented, verifies DB connection)
- Middleware: Centralized logging middleware integrated
- Env: Validated by @pearl/config via Zod

### Web Client Setup Details
- Initialized React + Vite client in apps/web
- Configured with necessary build scripts
- Env: Validated by @pearl/config via Zod

### Database Schema
PostgreSQL database with initial User model (dummy schema for setup):
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

- Prisma Client v6.x singleton exported from packages/database/index.ts.
- `apps/api` successfully imports and connects to the Prisma Client.
- Root `.env` tracks the connection string.

### Development Scripts
Available at root level:
- pnpm dev - Start all dev servers via Turbo
- pnpm build - Build all packages
- pnpm lint - Lint all packages
- pnpm db:generate - Generate Prisma client
- pnpm db:push - Push schema to database

## Recent Changes
- Exported PrismaClient singleton from packages/database.
- Linked @pearl/database to apps/api.
- API connects to DB on startup and tests connection in the `/health` endpoint.
- Handled Prisma v7 experimental mismatches by standardizing on Prisma v6.x.
- Created root `.env` and `.env.example` to centralize environment variables.
- Scaffolded `@pearl/config` with `zod` for strictly typing and validating the environment.
- Integrated `zod` validation into `@pearl/api` (`dotenv` integration) and `@pearl/web` (`import.meta.env`).
- Fixed ESM export named issues by configuring `@pearl/config` with `"type": "module"`.
- Transitioned Database from SQLite to PostgreSQL. 
- Mapped Docker container PostgreSQL to **Port 5433** to avoid collisions with any locally running PostgreSQL services.# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- Web: React 19 + Vite + TypeScript (SPA) initialized in apps/web
- API: Express.js + TypeScript (REST API) initialized in apps/api
- Database: Prisma ORM + PostgreSQL
- Build System: Turborepo
- Package Manager: pnpm

### Workspace Structure
pearl/
|- apps/
|  |- web/          (@pearl/web) - React Vite app
|  |- api/          (@pearl/api) - Express API
|- packages/
|  |- common/       (@pearl/common) - Shared utilities
|  |- config/       (@pearl/config) - Configuration package (Zod schemas)
|  |- database/     (@pearl/database) - Prisma schema
|- turbo.json        - Turborepo configuration
|- pnpm-workspace.yaml - Workspace configuration
|- docker-compose.yml - PostgreSQL database configuration
|- .memory-bank/
   |- systemPatterns.md - Naming and typing conventions
   |- progress.md - Migration/setup progress
   |- activeContext.md - This file

### Naming Conventions
All packages follow the @pearl/ namespace:
- @pearl/web - Frontend application
- @pearl/api - Backend API
- @pearl/database - Database layer
- @pearl/common - Shared code/utilities
- @pearl/config - Configuration utilities (Environment Variable Types)

### API Setup Details
- Entry point: apps/api/src/index.ts
- Port: 3001 (default, fetched from root .env)
- CORS enabled for cross-origin requests
- Health check endpoint: GET /health (implemented, verifies DB connection)
- Middleware: Centralized logging middleware integrated
- Env: Validated by @pearl/config via Zod

### Web Client Setup Details
- Initialized React + Vite client in apps/web
- Configured with necessary build scripts
- Env: Validated by @pearl/config via Zod

### Database Schema
PostgreSQL database with initial User model (dummy schema for setup):
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

- Prisma Client v6.x singleton exported from packages/database/index.ts.
- `apps/api` successfully imports and connects to the Prisma Client.
- Root `.env` tracks the connection string.

### Development Scripts
Available at root level:
- pnpm dev - Start all dev servers via Turbo
- pnpm build - Build all packages
- pnpm lint - Lint all packages
- pnpm db:generate - Generate Prisma client
- pnpm db:push - Push schema to database

## Recent Changes
- Exported PrismaClient singleton from packages/database.
- Linked @pearl/database to apps/api.
- API connects to DB on startup and tests connection in the `/health` endpoint.
- Handled Prisma v7 experimental mismatches by standardizing on Prisma v6.x.
- Created root `.env` and `.env.example` to centralize environment variables.
- Scaffolded `@pearl/config` with `zod` for strictly typing and validating the environment.
- Integrated `zod` validation into `@pearl/api` (`dotenv` integration) and `@pearl/web` (`import.meta.env`).
- Fixed ESM export named issues by configuring `@pearl/config` with `"type": "module"`.
- Transitioned Database from SQLite to PostgreSQL. 
- Mapped Docker container PostgreSQL to **Port 5432** after gracefully shutting down conflicting local databases.# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- Web: React 19 + Vite + TypeScript (SPA) initialized in apps/web
- API: Express.js + TypeScript (REST API) initialized in apps/api
- Database: Prisma ORM + PostgreSQL
- Build System: Turborepo
- Package Manager: pnpm

### Workspace Structure
pearl/
|- apps/
|  |- web/          (@pearl/web) - React Vite app
|  |- api/          (@pearl/api) - Express API
|- packages/
|  |- common/       (@pearl/common) - Shared utilities
|  |- config/       (@pearl/config) - Configuration package (Zod schemas)
|  |- database/     (@pearl/database) - Prisma schema
|- turbo.json        - Turborepo configuration
|- pnpm-workspace.yaml - Workspace configuration
|- docker-compose.yml - PostgreSQL database configuration
|- .memory-bank/
   |- systemPatterns.md - Naming and typing conventions
   |- progress.md - Migration/setup progress
   |- activeContext.md - This file

### Naming Conventions
All packages follow the @pearl/ namespace:
- @pearl/web - Frontend application
- @pearl/api - Backend API
- @pearl/database - Database layer
- @pearl/common - Shared code/utilities
- @pearl/config - Configuration utilities (Environment Variable Types)

### API Setup Details
- Entry point: apps/api/src/index.ts
- Port: 3001 (default, fetched from root .env)
- CORS enabled for cross-origin requests
- Health check endpoint: GET /health (implemented, verifies DB connection)
- Middleware: Centralized logging middleware integrated
- Env: Validated by @pearl/config via Zod

### Web Client Setup Details
- Initialized React + Vite client in apps/web
- Configured with necessary build scripts
- Env: Validated by @pearl/config via Zod

### Database Schema
PostgreSQL database with initial User model (dummy schema for setup):
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

- Prisma Client v6.x singleton exported from packages/database/index.ts.
- `apps/api` successfully imports and connects to the Prisma Client.
- Root `.env` tracks the connection string.

### Development Scripts
Available at root level:
- pnpm dev - Start all dev servers via Turbo
- pnpm build - Build all packages
- pnpm lint - Lint all packages
- pnpm db:generate - Generate Prisma client
- pnpm db:push - Push schema to database

## Recent Changes
- Exported PrismaClient singleton from packages/database.
- Linked @pearl/database to apps/api.
- API connects to DB on startup and tests connection in the `/health` endpoint.
- Handled Prisma v7 experimental mismatches by standardizing on Prisma v6.x.
- Created root `.env` and `.env.example` to centralize environment variables.
- Scaffolded `@pearl/config` with `zod` for strictly typing and validating the environment.
- Integrated `zod` validation into `@pearl/api` (`dotenv` integration) and `@pearl/web` (`import.meta.env`).
- Fixed ESM export named issues by configuring `@pearl/config` with `"type": "module"`.
- Transitioned Database from SQLite to PostgreSQL. 
- Mapped Docker container PostgreSQL to **Port 5432** after gracefully shutting down conflicting local databases.
- Executed dead-code cleanup: Removed unused variables (like `Request` and `Response` in `api/src/index.ts`) and console.logs in React's `App.tsx`.
- Ran E2E functionality testing via `curl` and `pnpm lint` / `pnpm build` across workspace.# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- Web: React 19 + Vite + TypeScript (SPA) initialized in apps/web
- API: Express.js + TypeScript (REST API) initialized in apps/api
- Database: Prisma ORM + PostgreSQL
- Build System: Turborepo
- Package Manager: pnpm

### Workspace Structure
pearl/
|- apps/
|  |- web/          (@pearl/web) - React Vite app
|  |- api/          (@pearl/api) - Express API
|- packages/
|  |- common/       (@pearl/common) - Shared utilities
|  |- config/       (@pearl/config) - Configuration package (Zod schemas)
|  |- database/     (@pearl/database) - Prisma schema
|- turbo.json        - Turborepo configuration
|- pnpm-workspace.yaml - Workspace configuration
|- docker-compose.yml - PostgreSQL database configuration
|- .memory-bank/
   |- systemPatterns.md - Naming and typing conventions
   |- progress.md - Migration/setup progress
   |- activeContext.md - This file

### Naming Conventions
All packages follow the @pearl/ namespace:
- @pearl/web - Frontend application
- @pearl/api - Backend API
- @pearl/database - Database layer
- @pearl/common - Shared code/utilities
- @pearl/config - Configuration utilities (Environment Variable Types)

### API Setup Details
- Entry point: apps/api/src/index.ts
- Port: 3001 (default, fetched from root .env)
- CORS enabled for cross-origin requests
- Health check endpoint: GET /health (implemented, verifies DB connection)
- Middleware: Centralized logging middleware integrated
- Env: Validated by @pearl/config via Zod
- Build: Configured with `tsup` using `tsup.config.ts` to bundle `@pearl/config` seamlessly for production deployments.

### Web Client Setup Details
- Initialized React + Vite client in apps/web
- Configured with necessary build scripts
- Env: Validated by @pearl/config via Zod

### Database Schema
PostgreSQL database with initial User model (dummy schema for setup):
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

- Prisma Client v6.x singleton exported from packages/database/index.ts.
- `apps/api` successfully imports and connects to the Prisma Client.
- Root `.env` tracks the connection string.

### Development Scripts
Available at root level:
- pnpm dev - Start all dev servers via Turbo
- pnpm build - Build all packages
- pnpm lint - Lint all packages
- pnpm db:generate - Generate Prisma client
- pnpm db:push - Push schema to database

## Recent Changes
- Exported PrismaClient singleton from packages/database.
- Linked @pearl/database to apps/api.
- API connects to DB on startup and tests connection in the `/health` endpoint.
- Handled Prisma v7 experimental mismatches by standardizing on Prisma v6.x.
- Created root `.env` and `.env.example` to centralize environment variables.
- Scaffolded `@pearl/config` with `zod` for strictly typing and validating the environment.
- Integrated `zod` validation into `@pearl/api` (`dotenv` integration) and `@pearl/web` (`import.meta.env`).
- Fixed ESM export named issues by configuring `@pearl/config` with `"type": "module"`.
- Transitioned Database from SQLite to PostgreSQL. 
- Mapped Docker container PostgreSQL to **Port 5432** after gracefully shutting down conflicting local databases.
- Executed dead-code cleanup: Removed unused variables (like `Request` and `Response` in `api/src/index.ts`) and console.logs in React's `App.tsx`.
- Ran E2E functionality testing via `curl` and `pnpm lint` / `pnpm build` across workspace.
- **Production Preparedness Fix**: Added `tsup.config.ts` to `@pearl/api` with `noExternal: ['@pearl/config']` to guarantee seamless `node dist/index.js` production deployments without ESM module resolution issues.# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- Web: React 19 + Vite + TypeScript (SPA) initialized in apps/web
- API: Express.js + TypeScript (REST API) initialized in apps/api
- Database: Prisma ORM + PostgreSQL
- Build System: Turborepo
- Package Manager: pnpm

### Workspace Structure
pearl/
|- apps/
|  |- web/          (@pearl/web) - React Vite app
|  |- api/          (@pearl/api) - Express API
|- packages/
|  |- common/       (@pearl/common) - Shared utilities
|  |- config/       (@pearl/config) - Configuration package (Zod schemas)
|  |- database/     (@pearl/database) - Prisma schema
|- turbo.json        - Turborepo configuration
|- pnpm-workspace.yaml - Workspace configuration
|- docker-compose.yml - PostgreSQL database configuration
|- .memory-bank/
   |- systemPatterns.md - Naming and typing conventions
   |- progress.md - Migration/setup progress
   |- activeContext.md - This file

### Naming Conventions
All packages follow the @pearl/ namespace:
- @pearl/web - Frontend application
- @pearl/api - Backend API
- @pearl/database - Database layer
- @pearl/common - Shared code/utilities
- @pearl/config - Configuration utilities (Environment Variable Types)

### API Setup Details
- Entry point: apps/api/src/index.ts
- Port: 3001 (default, fetched from root .env)
- CORS enabled for cross-origin requests
- Health check endpoint: GET /health (implemented, verifies DB connection)
- Middleware: Centralized logging middleware integrated
- Env: Validated by @pearl/config via Zod
- Build: Configured with `tsup` using `tsup.config.ts` to bundle `@pearl/config` seamlessly for production deployments.

### Web Client Setup Details
- Initialized React + Vite client in apps/web
- Configured with necessary build scripts
- Env: Validated by @pearl/config via Zod

### Database Schema
PostgreSQL database with initial User model (dummy schema for setup):
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

- Prisma Client v6.x singleton exported from packages/database/index.ts.
- `apps/api` successfully imports and connects to the Prisma Client.
- Root `.env` tracks the connection string.

### Development Scripts
Available at root level:
- pnpm dev - Start all dev servers via Turbo
- pnpm build - Build all packages
- pnpm lint - Lint all packages
- pnpm db:generate - Generate Prisma client
- pnpm db:push - Push schema to database

## Recent Changes
- Exported PrismaClient singleton from packages/database.
- Linked @pearl/database to apps/api.
- API connects to DB on startup and tests connection in the `/health` endpoint.
- Handled Prisma v7 experimental mismatches by standardizing on Prisma v6.x.
- Created root `.env` and `.env.example` to centralize environment variables.
- Scaffolded `@pearl/config` with `zod` for strictly typing and validating the environment.
- Integrated `zod` validation into `@pearl/api` (`dotenv` integration) and `@pearl/web` (`import.meta.env`).
- Fixed ESM export named issues by configuring `@pearl/config` with `"type": "module"`.
- Transitioned Database from SQLite to PostgreSQL. 
- Mapped Docker container PostgreSQL to **Port 5432** after gracefully shutting down conflicting local databases.
- Executed dead-code cleanup: Removed unused variables (like `Request` and `Response` in `api/src/index.ts`) and console.logs in React's `App.tsx`.
- Ran E2E functionality testing via `curl` and `pnpm lint` / `pnpm build` across workspace.
- **Production Preparedness Fix**: Added `tsup.config.ts` to `@pearl/api` with `noExternal: ['@pearl/config']` to guarantee seamless `node dist/index.js` production deployments without ESM module resolution issues.
- **Database Configuration Update**: Changed the internal database name from `pearl` to `pearl_local` across all environment configurations and `docker-compose.yml` for clarity during local development.# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- Web: React 19 + Vite + TypeScript (SPA) initialized in apps/web
- API: Express.js + TypeScript (REST API) initialized in apps/api
- Database: Prisma ORM + PostgreSQL
- Build System: Turborepo
- Package Manager: pnpm

### Workspace Structure
pearl/
|- apps/
|  |- web/          (@pearl/web) - React Vite app
|  |- api/          (@pearl/api) - Express API
|- packages/
|  |- common/       (@pearl/common) - Shared utilities
|  |- config/       (@pearl/config) - Configuration package (Zod schemas)
|  |- database/     (@pearl/database) - Prisma schema
|- turbo.json        - Turborepo configuration
|- pnpm-workspace.yaml - Workspace configuration
|- docker-compose.yml - PostgreSQL database configuration
|- .memory-bank/
   |- systemPatterns.md - Naming and typing conventions
   |- progress.md - Migration/setup progress
   |- activeContext.md - This file

### Naming Conventions
All packages follow the @pearl/ namespace:
- @pearl/web - Frontend application
- @pearl/api - Backend API
- @pearl/database - Database layer
- @pearl/common - Shared code/utilities
- @pearl/config - Configuration utilities (Environment Variable Types)

### API Setup Details
- Entry point: apps/api/src/index.ts
- Port: 3001 (default, fetched from root .env)
- CORS enabled for cross-origin requests
- Health check endpoint: GET /health (implemented, verifies DB connection)
- Middleware: Centralized logging middleware integrated
- Env: Validated by @pearl/config via Zod
- Build: Configured with `tsup` using `tsup.config.ts` to bundle `@pearl/config` seamlessly for production deployments.

### Web Client Setup Details
- Initialized React + Vite client in apps/web
- Configured with necessary build scripts
- Env: Validated by @pearl/config via Zod

### Database Schema
PostgreSQL database with initial User model (dummy schema for setup):
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

- Prisma Client v6.x singleton exported from packages/database/index.ts.
- `apps/api` successfully imports and connects to the Prisma Client.
- Root `.env` tracks the connection string.

### Development Scripts
Available at root level:
- pnpm dev - Start all dev servers via Turbo
- pnpm build - Build all packages
- pnpm lint - Lint all packages
- pnpm db:generate - Generate Prisma client
- pnpm db:push - Push schema to database

## Recent Changes
- Exported PrismaClient singleton from packages/database.
- Linked @pearl/database to apps/api.
- API connects to DB on startup and tests connection in the `/health` endpoint.
- Handled Prisma v7 experimental mismatches by standardizing on Prisma v6.x.
- Created root `.env` and `.env.example` to centralize environment variables.
- Scaffolded `@pearl/config` with `zod` for strictly typing and validating the environment.
- Integrated `zod` validation into `@pearl/api` (`dotenv` integration) and `@pearl/web` (`import.meta.env`).
- Fixed ESM export named issues by configuring `@pearl/config` with `"type": "module"`.
- Transitioned Database from SQLite to PostgreSQL. 
- Mapped Docker container PostgreSQL to **Port 5432** after gracefully shutting down conflicting local databases.
- Executed dead-code cleanup: Removed unused variables (like `Request` and `Response` in `api/src/index.ts`) and console.logs in React's `App.tsx`.
- Ran E2E functionality testing via `curl` and `pnpm lint` / `pnpm build` across workspace.
- **Production Preparedness Fix**: Added `tsup.config.ts` to `@pearl/api` with `noExternal: ['@pearl/config']` to guarantee seamless `node dist/index.js` production deployments without ESM module resolution issues.
- **Database Configuration Update**: Changed the internal database name from `pearl` to `pearl_local` across all environment configurations and `docker-compose.yml` for clarity during local development.# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- Web: React 19 + Vite + TypeScript (SPA) initialized in apps/web
- API: Express.js + TypeScript (REST API) initialized in apps/api
- Database: Prisma ORM + PostgreSQL
- Build System: Turborepo
- Package Manager: pnpm

### Workspace Structure
pearl/
|- apps/
|  |- web/          (@pearl/web) - React Vite app
|  |- api/          (@pearl/api) - Express API
|- packages/
|  |- common/       (@pearl/common) - Shared utilities
|  |- config/       (@pearl/config) - Configuration package (Zod schemas)
|  |- database/     (@pearl/database) - Prisma schema
|- turbo.json        - Turborepo configuration
|- pnpm-workspace.yaml - Workspace configuration
|- docker-compose.yml - PostgreSQL database configuration
|- .memory-bank/
   |- systemPatterns.md - Naming and typing conventions
   |- progress.md - Migration/setup progress
   |- activeContext.md - This file

### Naming Conventions
All packages follow the @pearl/ namespace:
- @pearl/web - Frontend application
- @pearl/api - Backend API
- @pearl/database - Database layer
- @pearl/common - Shared code/utilities
- @pearl/config - Configuration utilities (Environment Variable Types)

### API Setup Details
- Entry point: apps/api/src/index.ts
- Port: 3001 (default, fetched from root .env)
- CORS enabled for cross-origin requests
- Health check endpoint: GET /health (implemented, verifies DB connection)
- Middleware: Centralized logging middleware integrated
- Env: Validated by @pearl/config via Zod
- Build: Configured with `tsup` using `tsup.config.ts` to bundle `@pearl/config` seamlessly for production deployments.

### Web Client Setup Details
- Initialized React + Vite client in apps/web
- Configured with necessary build scripts
- Env: Validated by @pearl/config via Zod

### Database Schema
PostgreSQL database with initial User model (dummy schema for setup):
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

- Prisma Client v6.x singleton exported from packages/database/index.ts.
- `apps/api` successfully imports and connects to the Prisma Client.
- Root `.env` tracks the connection string.

### Development Scripts
Available at root level:
- pnpm dev - Start all dev servers via Turbo
- pnpm build - Build all packages
- pnpm lint - Lint all packages
- pnpm db:generate - Generate Prisma client
- pnpm db:push - Push schema to database

## Recent Changes
- Exported PrismaClient singleton from packages/database.
- Linked @pearl/database to apps/api.
- API connects to DB on startup and tests connection in the `/health` endpoint.
- Handled Prisma v7 experimental mismatches by standardizing on Prisma v6.x.
- Created root `.env` and `.env.example` to centralize environment variables.
- Scaffolded `@pearl/config` with `zod` for strictly typing and validating the environment.
- Integrated `zod` validation into `@pearl/api` (`dotenv` integration) and `@pearl/web` (`import.meta.env`).
- Fixed ESM export named issues by configuring `@pearl/config` with `"type": "module"`.
- Transitioned Database from SQLite to PostgreSQL. 
- Mapped Docker container PostgreSQL to **Port 5432** after gracefully shutting down conflicting local databases.
- Executed dead-code cleanup: Removed unused variables (like `Request` and `Response` in `api/src/index.ts`) and console.logs in React's `App.tsx`.
- Ran E2E functionality testing via `curl` and `pnpm lint` / `pnpm build` across workspace.
- **Production Preparedness Fix**: Added `tsup.config.ts` to `@pearl/api` with `noExternal: ['@pearl/config']` to guarantee seamless `node dist/index.js` production deployments without ESM module resolution issues.
- **Database Configuration Update**: Changed the internal database name from `pearl` to `pearl_local` across all environment configurations and `docker-compose.yml` for clarity during local development.
- **Pgweb Integration**: Integrated Pgweb into `docker-compose.yml` for database visualization. Resolved port conflict and ensured correct container startup.
- Implemented a resume upload + AI integration module in apps/api.
    Added services: src/services/s3.service.ts (uploadToS3, getFromS3) and src/services/ai.service.ts (sendResumeToAI using @google/genai).
    Added module: src/modules/resume/resume.controller.ts and resume.router.ts providing POST /api/resume and /api/resume/upload for uploads, GET /api/resume/:file for streaming from S3.
    Wired resumeRouter into main Express app in src/index.ts via app.use('/api/resume', resumeRouter).
    Fixed ai.service.ts import for @google/genai: switched to default import `import GoogleGenerativeAI from '@google/genai';` to resolve runtime SyntaxError about missing named export.
    Updated ai.service.ts to use `GoogleGenAI` named export with a simple `generateContent` call for AI resume analysis.
    Updated apps/api/src/modules/resume/resume.router.ts to use `upload.any()` instead of `upload.single('file')` so any multipart form field name from frontend/Postman is accepted.
    Updated apps/api/src/modules/resume/resume.controller.ts to read the first file from `req.files` to align with the new `upload.any()` behavior.
- Added AI key verification tooling to @pearl/api.
    New script apps/api/src/ai-key-test.ts that calls GoogleGenAI.generateContent to validate AI_STUDIO_API_KEY.
    Logged presence of AI_STUDIO_API_KEY in apps/api/src/services/ai.service.ts at startup.
    Added npm script test:ai-key in apps/api/package.json to run the check via `pnpm --filter @pearl/api test:ai-key`.
    Updated root .env to include AWS_RESUME_BUCKET, AWS_REGION, AI_STUDIO_API_KEY, and PUBLIC_BASE_URL for resume upload + AI integration.
    Hardened ParsedResume JSON parsing in apps/api/src/services/ai.service.ts by attempting direct JSON.parse, stripping ```json fences, extracting the first {...} block, and logging raw output on failure.
- Changed resume parsing flow to send actual resume text to Gemini instead of just a URL.
    apps/api/src/modules/resume/resume.controller.ts now extracts text from PDF using pdf-parse and from DOCX using mammoth, falling back to UTF-8 text.
    sendResumeToAI signature changed to accept resumeText and updated prompt to include the full resume content between <RESUME> tags.
    apps/api/package.json now includes pdf-parse and mammoth dependencies.

 - Updated resume parsing to let Gemini parse the raw uploaded file instead of using pdf-parse/mammoth.
     Removed pdf-parse and mammoth from apps/api/package.json.
     In apps/api/src/modules/resume/resume.controller.ts, now pass the uploaded file buffer and mimeType to sendResumeToAI after uploading to S3.
     In apps/api/src/services/ai.service.ts, sendResumeToAI now base64-encodes the file buffer and attaches it as inlineData with mimeType to GoogleGenAI.generateContent, along with a JSON-only extraction prompt.
     Fixed ReferenceError in uploadAndParseResume by reintroducing resumeUrl: after S3 upload, we now compute publicBaseUrl + `/api/resume/${id}${ext}` and return that as fileUrl alongside aiResult.

  - Refactored resume feature into standard folders:
      New router: apps/api/src/routes/resume.router.ts
      New controller: apps/api/src/controllers/resume.controller.ts
      Services remain in apps/api/src/services (s3.service.ts, ai.service.ts).
      Updated index.ts to mount /api/resume from routes/resume.router.
      Removed old apps/api/src/modules/resume/* files.
  - Simplified MIME type handling for resumes:
      Removed apps/api/src/utils/mimeType.ts helper.
      apps/api/src/controllers/resume.controller.ts now uses mime-types.lookup directly in uploadAndParseResume and streamResume.
      Fixed ESM ReferenceError in apps/api/src/controllers/resume.controller.ts by replacing dynamic require('mime-types') with a top-level ESM import `import mime from 'mime-types';` and using `mime.lookup` directly.
  - Extended ParsedResume with atsScore (0-100) and updated the Gemini prompt in apps/api/src/services/ai.service.ts to request an ATS-style score in the JSON response.
