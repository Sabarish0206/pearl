# Active Context - Project Pearl Monorepo

## Current Project State

### Architecture Overview
Project Pearl is a full-stack monorepo using:
- Web: React 19 + Vite + TypeScript (SPA)
- API: Express.js + TypeScript (REST API)
- Database: Prisma ORM + SQLite
- Build System: Turborepo
- Package Manager: pnpm

### Workspace Structure
pearl/
|- apps/
|  |- web/          (@repo/web) - React Vite app
|  |- api/          (@repo/api) - Express API
|- packages/
|  |- common/       (@repo/common) - Shared utilities
|  |- config/       - Configuration package
|  |- database/     (@repo/database) - Prisma schema
|- turbo.json        - Turborepo configuration
|- pnpm-workspace.yaml - Workspace configuration
|- .memory-bank/
   |- systemPatterns.md - Naming and typing conventions
   |- progress.md - Migration/setup progress
   |- activeContext.md - This file

### Naming Conventions
All packages follow the @repo/ namespace:
- @repo/web - Frontend application
- @repo/api - Backend API
- @repo/database - Database layer
- @repo/common - Shared code/utilities
- @repo/config - Configuration utilities

### API Setup Details
- Entry point: apps/api/src/index.ts
- Port: 3000 (default)
- CORS enabled for cross-origin requests
- Health check endpoint: GET /health

### Database Schema
SQLite database with initial User model:
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

### Development Scripts
Available at root level:
- pnpm dev - Start all dev servers via Turbo
- pnpm build - Build all packages
- pnpm lint - Lint all packages
- pnpm db:generate - Generate Prisma client
- pnpm db:push - Push schema to database

## Recent Changes
- Recreated corrupted apps/api/package.json
- Created apps/api/src/index.ts with basic Express setup
- Created Prisma schema and .env in packages/database
- Updated all package names to follow @repo/ convention
- Updated apps/web/package.json name to @repo/web
