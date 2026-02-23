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